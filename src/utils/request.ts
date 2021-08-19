/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Constants from '@constants';

enum RequestStatus {
    SUCCESS         = 'success',
    SERVER_ERROR    = 'server error',
    NOT_FOUND       = 'not found',
    INPUT_ERROR     = 'client error',
    TIMEOUT         = 'timeout',
    TEAPOT          = 'teapot',
    BAD_RESPONSE    = 'bad response',
    NO_RESPONSE     = 'no response',
    AUTH_ERROR      = 'auth error',
    UNKNOWN_ERROR   = 'unknown error'
};

export class RequestResult {
    private pStatus: RequestStatus = RequestStatus.UNKNOWN_ERROR;
    private pStatusCode: number | null = null;
    private pResult: any = null;
    private pOptions: RequestInit = {};
    private pUrl = '';
    private pAttempts = 0;
    private pContentType: string | null = null;
    
    get status () : RequestStatus { return this.pStatus; }
    get statusCode () : number | null { return this.pStatusCode; }
    get result () : any { return this.pResult; }
    get requestUrl () : string { return this.pUrl; }
    get requestOptions () : RequestInit | null { return this.pOptions; }
    get attempts () : number { return this.pAttempts; }
    get contentType () : string | null { return this.pContentType; }

    constructor (url: string, options: RequestInit, status: RequestStatus, result: any, attempts: number, contentType: string | null, statusCode: number | null = null) {
        this.pStatus = status;
        this.pStatusCode = statusCode;
        this.pResult = result;
        this.pUrl = url;
        this.pOptions = options;
        this.pAttempts = attempts;
        this.pContentType = contentType;
    }

    retry () : Promise<RequestResult> {
        return fetchWrapper(this.pUrl, this.pOptions, this);
    }
    
    get errored () : boolean {
        return ![RequestStatus.SUCCESS, RequestStatus.NO_RESPONSE, RequestStatus.TEAPOT].includes(this.status);
    }

    get succeeded () : boolean {
        return [RequestStatus.SUCCESS, RequestStatus.NO_RESPONSE, RequestStatus.TEAPOT].includes(this.status);
    }

    get timedOut () : boolean {
        return this.pStatus === RequestStatus.TIMEOUT;
    }

    get shouldRetry () : boolean {
        return ![
            RequestStatus.SERVER_ERROR,
            RequestStatus.NOT_FOUND,
            RequestStatus.INPUT_ERROR,
            RequestStatus.AUTH_ERROR,
            RequestStatus.UNKNOWN_ERROR
        ].includes(this.status);
    }
};

function fetchWrapper(url: string, options: RequestInit, initiatedBy: RequestResult | null = null) : Promise<RequestResult> {
    return new Promise<RequestResult>(async (resolve) => {
        if (Constants.LogOutgoingRequests) console.log(url, options);
        let status = RequestStatus.SUCCESS;
        let type: string | null = null;
        let scode: number | null = null;

        try {
            let didTimeout = false;
            let resolved = false;
    
            const timeout = setTimeout(() => {
                if (resolved) return;
                didTimeout = true;
                resolve(new RequestResult(url, options, RequestStatus.TIMEOUT, null, initiatedBy ? initiatedBy.attempts : 1, null, null));
            }, Constants.RequestTimeout * 1000);
            
            const result = await fetch(url, options).then(r => {
                if (didTimeout) return null;
                clearTimeout(timeout);
                resolved = true;
    
                scode = r.status;
                if (r.status >= 300) {
                    if (r.status >= 500 && r.status < 600) status = RequestStatus.SERVER_ERROR;
                    else if (r.status >= 400 && r.status < 500) {
                        if (r.status === 401) status = RequestStatus.AUTH_ERROR;
                        else if (r.status === 404) status = RequestStatus.NOT_FOUND;
                        else if (r.status === 408) status = RequestStatus.TIMEOUT;
                        else if (r.status === 418) status = RequestStatus.TEAPOT;
                        else status = RequestStatus.INPUT_ERROR;
                    } else status = RequestStatus.UNKNOWN_ERROR;
                }
    
                return r;
            }).then(async r => {
                if (didTimeout) return null;
                if (r === null) {
                    status = RequestStatus.NO_RESPONSE;
                    return null;
                }

                type = r.headers.get('Content-Type');
                if (type && type.includes('application/json')) {
                    try {
                        const data = await r.json();
                        if (Constants.LogOutgoingRequests) console.log(`Got ${url} results:`, data);
                        return data;
                    } catch (err) {
                        if (status === RequestStatus.SUCCESS) status = RequestStatus.BAD_RESPONSE;
                    }
                } else if (type && (type.includes('text/') || type.includes('application/xml'))) {
                    try {
                        const data = await r.text();
                        if (Constants.LogOutgoingRequests) console.log(`Got ${url} results:`, data);
                        return data;
                    } catch (err) {
                        if (status === RequestStatus.SUCCESS) status = RequestStatus.BAD_RESPONSE;
                    }
                } else {
                    if (Constants.LogOutgoingRequests) console.log(`Got ${url} results:`, r);
                }
    
                return r;
            });
    
            if (!didTimeout) resolve(new RequestResult(url, options, status, result, initiatedBy ? initiatedBy.attempts : 1, type, scode));
        } catch (err) {
            resolve(new RequestResult(url, options, RequestStatus.UNKNOWN_ERROR, err, initiatedBy ? initiatedBy.attempts : 1, type, scode));
        }
    });
}

export type RequestParams = Record<string, unknown> | string | null;
export type BodyEncoderFn = (params: RequestParams, headers: Headers) => BodyInit | null;

const Encoders = {
    JSON: (params: RequestParams, headers: Headers): BodyInit | null => {
        if (!params) return null;

        if ((typeof params) !== 'object') {
            console.error('Request.BodyEncode.JSON received params that is not an object', params);
            return null;
        }

        if (Object.keys(params).length > 0) {
            headers.set('Content-Type', 'application/json');
            return JSON.stringify(params);
        }

        return null;
    },
    FormData: (params: RequestParams, headers: Headers): BodyInit | null => {
        if (!params) return null;

        if ((typeof params) !== 'object') {
            console.error('Request.BodyEncode.FormData received params that is not an object', params);
            return null;
        }

        if (Object.keys(params).length > 0) {
            headers.set('Content-Type', 'application/x-www-form-urlencoded');
            return Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k as keyof RequestParams])}`).join('&');
        }

        return null;
    },
    Text: (params: RequestParams, headers: Headers): BodyInit | null => {
        if (!params) return null;
        if ((typeof params) !== 'string') {
            console.error('Request.BodyEncode.Text received params that is not a string', params);
        }

        headers.set('Content-Type', 'text/plain');
        return params as string;
    },
    TextCsv: (params: RequestParams, headers: Headers): BodyInit | null => {
        if (!params) return null;
        if ((typeof params) !== 'string') {
            console.error('Request.BodyEncode.TextCsv received params that is not a string', params);
        }

        headers.set('Content-Type', 'text/csv');
        return params as string;
    },
    None: (): BodyInit | null => {
        return null;
    }
};

export default {
    BodyEncode: Encoders,
    get: (url: string, params: RequestParams = null, headers: Headers = new Headers()) : Promise<RequestResult> => {
        if (!headers.has('Accept')) headers.set('Accept', 'application/json');

        const dummy = new Headers();
        const body = Encoders.FormData(params, dummy);
        let actualUrl = url;
        if (body) {
            if (url.includes('?')) actualUrl += `&${body.toString()}`;
            else actualUrl += `?${body.toString()}`;
        }

        return fetchWrapper(actualUrl, {
            method: 'GET',
            headers,
        });
    },
    patch: (url: string, params: RequestParams = null, headers: Headers = new Headers(), bodyEncoder: BodyEncoderFn = Encoders.JSON) : Promise<RequestResult> => {
        if (!headers.has('Accept')) headers.set('Accept', 'application/json');

        const body = bodyEncoder(params, headers);

        return fetchWrapper(url, {
            method: 'PATCH',
            headers,
            body
        });
    },
    post: (url: string, params: RequestParams = null, headers: Headers = new Headers(), bodyEncoder: BodyEncoderFn = Encoders.JSON) : Promise<RequestResult> => {
        if (!headers.has('Accept')) headers.set('Accept', 'application/json');

        const body = bodyEncoder(params, headers);

        return fetchWrapper(url, {
            method: 'POST',
            headers,
            body
        });
    },
    delete: (url: string, params: RequestParams = null, headers: Headers = new Headers(), bodyEncoder: BodyEncoderFn = Encoders.None) : Promise<RequestResult> => {
        if (!headers.has('Accept')) headers.set('Accept', 'application/json');

        const body = bodyEncoder(params, headers);

        return fetchWrapper(url, {
            method: 'DELETE',
            headers,
            body
        });
    },
    Status: RequestStatus
};
