/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */

function parseParameters(request) {
    const url = request.url.split('?');
    let params = {};
    if (url.length === 2) {
        const pArr = Array.from(
            url[1].split('&'),
            param => decodeURIComponent(param)
        );
        pArr.forEach(p => {
            const comps = p.split('=');
            params[comps[0]] = comps.length === 2 ? JSON.parse(comps[1]) : null;
            if (params[comps[0]] === 'true') params[comps[0]] = 1;
            else if (params[comps[0]] === 'false') params[comps[0]] = 0;
            else if (!isNaN(parseFloat(params[comps[0]]))) params[comps[0]] = parseFloat(params[comps[0]]);
        });
    }
    return params;
}

class Route {
    constructor(parent, path, methods) {
        this.path = path || null;
        this.parent = parent || null;
        this.methods = methods || {
            get: null,
            patch: null,
            post: null,
            put: null,
            options: null,
            delete: null,
        };
        this.subRoutes = [];

        if (!this.methods.options) this.methods.options = (args) => { args.callback(200); };
    }

    getFullPath() {
        let fullPath = '';

        if (this.parent) fullPath = this.parent.getFullPath();
        if (this.path) fullPath += `/${this.path}`;

        return fullPath;
    }

    getEndpoint(path) {
        // This method can only be called on the root route
        if (this.parent) return null;

        let pathComps = path.split('?')[0].split('/');
        let route = this;

        let lastFoundIdx = 0;
        pathComps.forEach((comp, idx) => {
            if (idx !== 0) {
                route.subRoutes.some((subRoute) => {
                    if (subRoute.path === comp) {
                        route = subRoute;
                        lastFoundIdx = idx;
                        return true;
                    }
                    return false;
                });
            }
        });

        return { route, remaining: pathComps.slice(lastFoundIdx + 1) };
    }

    addSubRoute(path, methods) {
        let exists = false;
        this.subRoutes.forEach((route) => {
            if (route.path === path) exists = true;
        });

        if (!exists) {
            let route = new Route(this, path, methods);
            this.subRoutes.push(route);
            return route;
        } else console.error(`Attempted to add route that already exists at ${this.getFullPath()}`);

        return null;
    }

    onRequest(request, response) {
        const params = parseParameters(request);
        const routeInfo = this.getEndpoint(request.url);
        const route = routeInfo ? routeInfo.route : null;

        console.log(`${request.method} ${request.url.split('?')[0]}`);

        const callback = (code, result, contentType, extraHeaders, encoding) => {
            let methods = [];
            if (route.methods.get) methods.push('GET');
            if (route.methods.patch) methods.push('PATCH');
            if (route.methods.post) methods.push('POST');
            if (route.methods.put) methods.push('PUT');
            if (route.methods.options) methods.push('OPTIONS');
            if (route.methods.delete) methods.push('DELETE');

            var headers = {};
            headers["Access-Control-Allow-Origin"] = "*";
            headers["Access-Control-Allow-Methods"] = methods.join(', ');
            headers["Access-Control-Allow-Credentials"] = false;
            headers["Access-Control-Max-Age"] = '86400'; // 24 hours
            headers["Access-Control-Allow-Headers"] = "Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
            if (contentType) headers['Content-Type'] = contentType;
            if (extraHeaders instanceof Object) {
                for (var prop in extraHeaders) {
                    headers[prop] = extraHeaders[prop];
                }
            }
            response.writeHead(code, headers);
            response.end(contentType === 'application/json' ? JSON.stringify(result) : result, encoding);
        }

        const fireRequest = () => {
            if (route) {
                const args = {
                    params,
                    callback,
                    request,
                    response,
                    remainingPath: routeInfo.remaining
                };
                if (request.method === 'GET' && route.methods.get) route.methods.get(args);
                else if (request.method === 'PATCH' && route.methods.patch) route.methods.patch(args);
                else if (request.method === 'POST' && route.methods.post) route.methods.post(args);
                else if (request.method === 'OPTIONS' && route.methods.options) route.methods.options(args);
                else if (request.method === 'DELETE' && route.methods.delete) route.methods.delete(args);
                else {
                    response.writeHead(404);
                    response.end();
                }
            } else {
                response.writeHead(404);
                response.end();
            }
        };
        
        fireRequest();
    }
}

module.exports = Route;
