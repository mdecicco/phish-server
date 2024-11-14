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
            if (comps.length === 2) {
                try {
                    params[comps[0]] = comps.length === 2 ? JSON.parse(comps[1]) : params[comps[0]];
                } catch (e) {
                    if (comps[1].trim().toLowerCase() === 'true') params[comps[0]] = 1;
                    else if (comps[1].trim().toLowerCase() === 'false') params[comps[0]] = 0;
                    else if (!isNaN(parseFloat(comps[1])) && parseFloat(comps[1]).toString() === comps[1].trim()) params[comps[0]] = parseFloat(comps[1]);
                    else params[comps[0]] = comps[1];
                }
            } else params[comps[0]] = null;
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
        const pathParams = {};
        pathComps.forEach((comp, idx) => {
            if (idx !== 0 && route) {
                let foundFallback = false;
                const found = route.subRoutes.some((subRoute) => {
                    if (subRoute.path === comp) {
                        route = subRoute;
                        lastFoundIdx = idx;
                        return true;
                    }

                    if (subRoute.path.includes(':')) {
                        pathParams[subRoute.path.substr(1).trim()] = comp;
                        route = subRoute;
                        lastFoundIdx = idx;
                        foundFallback = true;
                    }

                    return false;
                });

                if (!found && !foundFallback) route = null;
            }
        });

        return { route, remaining: pathComps.slice(lastFoundIdx + 1), pathParams };
    }

    addSubRoute(path, methods) {
        const comps = path.split('/');
        
        if (comps.length <= 1) {
            let exists = false;
            this.subRoutes.forEach((route) => {
                if (route.path === path) exists = true;
            });

            if (!exists) {
                let route = new Route(this, path, methods);
                this.subRoutes.push(route);
                console.log(`Added route: ${route.getFullPath()}`);
                return route;
            } else console.error(`Attempted to add route that already exists at ${this.getFullPath()}`);
        } else {
            let r = this.addSubRoute(comps[0], {});
            for (let i = 1;i < comps.length - 1;i++) {
                r = r.addSubRoute(comps[i], {});
            }
            return r.addSubRoute(comps[comps.length - 1], methods);
        }

        return null;
    }

    logRequest(request, params, routeInfo) {
        let extra = '';

        if (routeInfo && Object.keys(routeInfo.pathParams).length > 0) {
            const printParams = [];
            Object.keys(routeInfo.pathParams).forEach(k => {
                printParams.push(`${k}: ${routeInfo.pathParams[k]}`);
            });

            extra += `(path: ${printParams.join(', ')})`;
        }

        if (Object.keys(params).length > 0) {
            const printParams = [];
            Object.keys(params).forEach(k => {
                printParams.push(`${k}: ${params[k]}`);
            });
            
            extra += `(query: ${printParams.join(', ')})`;
        }

        console.log(`${request.method} ${routeInfo && routeInfo.route ? routeInfo.route.getFullPath() : '<no route found>'} ${extra}`);
    }

    onRequest(request, response) {
        const params = parseParameters(request);
        const routeInfo = this.getEndpoint(request.url);
        const route = routeInfo ? routeInfo.route : null;

        this.logRequest(request, params, routeInfo);

        let callbackFired = false;
        const callback = (code, result, contentType, extraHeaders, encoding) => {
            let methods = [];
            if (route.methods.get) methods.push('GET');
            if (route.methods.patch) methods.push('PATCH');
            if (route.methods.post) methods.push('POST');
            if (route.methods.put) methods.push('PUT');
            if (route.methods.options) methods.push('OPTIONS');
            if (route.methods.delete) methods.push('DELETE');

            var headers = {};
            var output = contentType === 'application/json' ? JSON.stringify(result) : result;

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
            response.end(output, encoding);
            callbackFired = true;
        };

        const fireRequest = () => {
            if (route) {
                const args = {
                    params,
                    callback,
                    request,
                    response,
                    remainingPath: routeInfo.remaining,
                    pathParams: routeInfo.pathParams
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
        
        try {
            fireRequest();
        } catch (e) {
            console.error('uh oh', e);
            if (!callbackFired) {
                callback(500, null);
            }
        }
    }
}

module.exports = Route;
