"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeReadStreamResponse = exports.makeDirectoryListing = exports.getContentTypeFromExtension = exports.parseRangeHeader = exports.route = exports.respond = exports.finalizeResponse = exports.acceptsMethod = exports.acceptsComponents = exports.makeNodeRequestHandler = exports.combineNodeRawHeaders = exports.DynamicRouteMatcher = exports.StaticRouteMatcher = exports.ClientRequest = exports.EndpointError = void 0;
const libfs = require("fs");
const libhttp = require("http");
const libhttps = require("https");
const libpath = require("path");
const shared = require("../lib-shared");
__exportStar(require("../lib-shared/api"), exports);
class EndpointError {
    constructor(response) {
        this.response = response;
    }
    getResponse() {
        var _a, _b, _c;
        let status = (_a = this.response.status) !== null && _a !== void 0 ? _a : 500;
        let headers = (_b = this.response.headers) !== null && _b !== void 0 ? _b : [];
        let payload = (_c = this.response.payload) !== null && _c !== void 0 ? _c : [];
        return {
            status,
            headers,
            payload
        };
    }
}
exports.EndpointError = EndpointError;
;
class ClientRequest {
    constructor(request, collect, auxillary) {
        this.request = request;
        this.collect = collect;
        this.auxillary = auxillary;
    }
    options() {
        let options = this.request.options;
        return Object.assign({}, options);
    }
    headers() {
        let headers = this.request.headers;
        return Object.assign({}, headers);
    }
    payload() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.collectedPayload !== undefined) {
                return this.collectedPayload;
            }
            let payload = this.request.payload;
            let collectedPayload = (this.collect ? yield shared.api.collectPayload(payload) : payload);
            this.collectedPayload = collectedPayload;
            return collectedPayload;
        });
    }
    socket() {
        return this.auxillary.socket;
    }
}
exports.ClientRequest = ClientRequest;
;
;
class StaticRouteMatcher {
    constructor(string) {
        this.string = string;
        this.accepted = false;
    }
    acceptComponent(component) {
        if (this.accepted) {
            return false;
        }
        this.accepted = component === this.string;
        return this.accepted;
    }
    getValue() {
        return this.string;
    }
    isSatisfied() {
        return this.accepted;
    }
}
exports.StaticRouteMatcher = StaticRouteMatcher;
;
class DynamicRouteMatcher {
    constructor(minOccurences, maxOccurences, plain, guard) {
        this.minOccurences = minOccurences;
        this.maxOccurences = maxOccurences;
        this.plain = plain;
        this.guard = guard;
        this.values = new Array();
    }
    acceptComponent(component) {
        if (this.values.length >= this.maxOccurences) {
            return false;
        }
        try {
            let value = shared.api.deserializeValue(component, this.plain);
            if (this.guard.is(value)) {
                this.values.push(value);
                return true;
            }
        }
        catch (error) { }
        return false;
    }
    getValue() {
        if (this.maxOccurences === 1) {
            return this.values[0];
        }
        else {
            return this.values;
        }
    }
    isSatisfied() {
        return this.minOccurences <= this.values.length && this.values.length <= this.maxOccurences;
    }
}
exports.DynamicRouteMatcher = DynamicRouteMatcher;
;
function combineNodeRawHeaders(raw) {
    let headers = new Array();
    for (let i = 0; i < raw.length; i += 2) {
        headers.push(`${raw[i + 0]}: ${raw[i + 1]}`);
    }
    return headers;
}
exports.combineNodeRawHeaders = combineNodeRawHeaders;
;
function makeNodeRequestHandler(options) {
    return (raw, urlPrefix) => {
        let lib = (urlPrefix !== null && urlPrefix !== void 0 ? urlPrefix : "").startsWith("https:") ? libhttps : libhttp;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let payload = yield shared.api.collectPayload(raw.payload);
            let headers = {
                "Content-Length": `${payload.length}`
            };
            for (let header of raw.headers) {
                let key = header[0];
                let value = header[1];
                let values = headers[key];
                if (values === undefined) {
                    headers[key] = value;
                }
                else if (Array.isArray(values)) {
                    values.push(value);
                }
                else {
                    headers[key] = [values, value];
                }
            }
            let url = urlPrefix !== null && urlPrefix !== void 0 ? urlPrefix : "";
            url += shared.api.combineComponents(raw.components);
            url += shared.api.combineParameters(raw.parameters);
            let request = lib.request(url, Object.assign(Object.assign({}, options), { method: raw.method, headers: headers }), (response) => {
                var _a;
                let status = (_a = response.statusCode) !== null && _a !== void 0 ? _a : 200;
                let headers = shared.api.splitHeaders(combineNodeRawHeaders(response.rawHeaders));
                let payload = {
                    [Symbol.asyncIterator]: () => response[Symbol.asyncIterator]()
                };
                resolve({ status, headers, payload });
            });
            request.on("abort", reject);
            request.on("error", reject);
            request.write(payload);
            request.end();
        }));
    };
}
exports.makeNodeRequestHandler = makeNodeRequestHandler;
;
function acceptsComponents(components, matchers) {
    let currentMatcher = 0;
    outer: for (let component of components) {
        let decoded = decodeURIComponent(component);
        if (decoded === undefined) {
            throw `Expected component to be properly encoded!`;
        }
        inner: for (let matcher of matchers.slice(currentMatcher)) {
            if (matcher.acceptComponent(decoded)) {
                continue outer;
            }
            else {
                if (matcher.isSatisfied()) {
                    currentMatcher += 1;
                    continue inner;
                }
                else {
                    break outer;
                }
            }
        }
        break outer;
    }
    if (currentMatcher >= matchers.length) {
        return false;
    }
    for (let matcher of matchers.slice(currentMatcher)) {
        if (!matcher.isSatisfied()) {
            return false;
        }
    }
    return true;
}
exports.acceptsComponents = acceptsComponents;
;
function acceptsMethod(one, two) {
    return one === two;
}
exports.acceptsMethod = acceptsMethod;
;
function finalizeResponse(raw, defaultHeaders) {
    let headersToAppend = defaultHeaders.filter((defaultHeader) => {
        let found = raw.headers.find((header) => header[0].toLowerCase() === defaultHeader[0].toLowerCase());
        return found === undefined;
    });
    return Object.assign(Object.assign({}, raw), { headers: [
            ...raw.headers,
            ...headersToAppend
        ] });
}
exports.finalizeResponse = finalizeResponse;
;
function respond(httpResponse, raw) {
    var e_1, _a;
    var _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        let rawHeaders = new Array();
        for (let header of (_b = raw.headers) !== null && _b !== void 0 ? _b : []) {
            rawHeaders.push(...header);
        }
        httpResponse.writeHead((_c = raw.status) !== null && _c !== void 0 ? _c : 200, rawHeaders);
        try {
            for (var _e = __asyncValues((_d = raw.payload) !== null && _d !== void 0 ? _d : []), _f; _f = yield _e.next(), !_f.done;) {
                let chunk = _f.value;
                if (!httpResponse.write(chunk)) {
                    yield new Promise((resolve, reject) => {
                        httpResponse.once("drain", resolve);
                    });
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_a = _e.return)) yield _a.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        httpResponse.end();
        yield new Promise((resolve, reject) => {
            httpResponse.once("finish", resolve);
        });
    });
}
exports.respond = respond;
;
function route(endpoints, httpRequest, httpResponse, serverOptions) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        let urlPrefix = (_a = serverOptions === null || serverOptions === void 0 ? void 0 : serverOptions.urlPrefix) !== null && _a !== void 0 ? _a : "";
        let method = (_b = httpRequest.method) !== null && _b !== void 0 ? _b : "GET";
        let url = (_c = httpRequest.url) !== null && _c !== void 0 ? _c : "";
        if (!url.startsWith(urlPrefix)) {
            throw `Expected url "${url}" to have prefix "${urlPrefix}"!`;
        }
        url = url.slice(urlPrefix.length);
        try {
            let components = shared.api.splitComponents(url);
            let parameters = shared.api.splitParameters(url);
            let headers = shared.api.splitHeaders(combineNodeRawHeaders(httpRequest.rawHeaders));
            let payload = {
                [Symbol.asyncIterator]: () => httpRequest[Symbol.asyncIterator]()
            };
            let socket = httpRequest.socket;
            let raw = {
                method,
                components,
                parameters,
                headers,
                payload
            };
            let auxillary = {
                socket
            };
            let filteredEndpoints = endpoints.map((endpoint) => endpoint(raw, auxillary));
            filteredEndpoints = filteredEndpoints.filter((endpoint) => endpoint.acceptsComponents());
            if (filteredEndpoints.length === 0) {
                return respond(httpResponse, {
                    status: 404
                });
            }
            filteredEndpoints = filteredEndpoints.filter((endpoint) => endpoint.acceptsMethod());
            if (filteredEndpoints.length === 0) {
                return respond(httpResponse, {
                    status: 405
                });
            }
            let endpoint = filteredEndpoints[0];
            let valid = yield endpoint.validateRequest();
            try {
                let handled = yield valid.handleRequest();
                try {
                    let raw = yield handled.validateResponse();
                    return yield respond(httpResponse, raw);
                }
                catch (error) {
                    return respond(httpResponse, {
                        status: 500,
                        payload: shared.api.serializeStringPayload(String(error))
                    });
                }
            }
            catch (error) {
                if (Number.isInteger(error) && error >= 100 && error <= 999) {
                    return respond(httpResponse, {
                        status: error
                    });
                }
                if (error instanceof EndpointError) {
                    let raw = error.getResponse();
                    return respond(httpResponse, raw);
                }
                return respond(httpResponse, {
                    status: 500
                });
            }
        }
        catch (error) {
            return respond(httpResponse, {
                status: 400,
                payload: shared.api.serializeStringPayload(String(error))
            });
        }
    });
}
exports.route = route;
;
// TODO: Move to Nexus in v6.
function parseRangeHeader(value, size) {
    var _a, _b, _c;
    if (value === undefined) {
        return {
            status: 200,
            offset: 0,
            length: size,
            size: size
        };
    }
    let s416 = {
        status: 416,
        offset: 0,
        length: 0,
        size: size
    };
    let parts;
    parts = (_a = /^bytes[=]([0-9]+)[-]$/.exec(String(value))) !== null && _a !== void 0 ? _a : undefined;
    if (parts !== undefined) {
        let one = Number.parseInt(parts[1], 10);
        if (one >= size) {
            return s416;
        }
        return {
            status: 206,
            offset: one,
            length: size - one,
            size: size
        };
    }
    parts = (_b = /^bytes[=]([0-9]+)[-]([0-9]+)$/.exec(String(value))) !== null && _b !== void 0 ? _b : undefined;
    if (parts !== undefined) {
        let one = Number.parseInt(parts[1], 10);
        let two = Number.parseInt(parts[2], 10);
        if (two < one) {
            return s416;
        }
        if (one >= size) {
            return s416;
        }
        if (two >= size) {
            two = size - 1;
        }
        return {
            status: 206,
            offset: one,
            length: two - one + 1,
            size: size
        };
    }
    parts = (_c = /^bytes[=][-]([0-9]+)$/.exec(String(value))) !== null && _c !== void 0 ? _c : undefined;
    if (parts !== undefined) {
        let one = Number.parseInt(parts[1], 10);
        if (one < 1) {
            return s416;
        }
        if (size < 1) {
            return s416;
        }
        if (one > size) {
            one = size;
        }
        return {
            status: 206,
            offset: size - one,
            length: one,
            size: size
        };
    }
    return s416;
}
exports.parseRangeHeader = parseRangeHeader;
;
// TODO: Move to Nexus in v6.
function getContentTypeFromExtension(extension) {
    let extensions = {
        ".aac": "audio/aac",
        ".bmp": "image/bmp",
        ".css": "text/css",
        ".csv": "text/csv",
        ".gif": "image/gif",
        ".htm": "text/html",
        ".html": "text/html",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".js": "text/javascript",
        ".json": "application/json",
        ".mid": "audio/midi",
        ".mp3": "audio/mpeg",
        ".mp4": "video/mp4",
        ".otf": "font/otf",
        ".pdf": "application/pdf",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".tif": "image/tiff",
        ".tiff": "image/tiff",
        ".ttf": "font/ttf",
        ".txt": "text/plain",
        ".wav": "audio/wav",
        ".woff": "font/woff",
        ".woff2": "font/woff2",
        ".xml": "text/xml"
    };
    return extensions[extension];
}
exports.getContentTypeFromExtension = getContentTypeFromExtension;
;
// TODO: Move to Nexus in v6.
function makeDirectoryListing(pathPrefix, pathSuffix, request) {
    let pathSuffixParts = libpath.normalize(pathSuffix).split(libpath.sep);
    if (pathSuffixParts[0] === "..") {
        throw 400;
    }
    if (pathSuffixParts[pathSuffixParts.length - 1] !== "") {
        pathSuffixParts.push("");
    }
    let fullPath = libpath.join(pathPrefix, ...pathSuffixParts);
    if (!libfs.existsSync(fullPath) || !libfs.statSync(fullPath).isDirectory()) {
        throw 404;
    }
    let entries = libfs.readdirSync(fullPath, { withFileTypes: true });
    let directories = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => {
        return {
            name: entry.name
        };
    })
        .sort((one, two) => one.name.localeCompare(two.name));
    let files = entries
        .filter((entry) => entry.isFile())
        .map((entry) => {
        let stat = libfs.statSync(libpath.join(fullPath, entry.name));
        return {
            name: entry.name,
            size: stat.size,
            timestamp: stat.mtime.valueOf()
        };
    })
        .sort((one, two) => one.name.localeCompare(two.name));
    let components = pathSuffixParts;
    return {
        components,
        directories,
        files
    };
}
exports.makeDirectoryListing = makeDirectoryListing;
;
// TODO: Move to Nexus in v6.
function makeReadStreamResponse(pathPrefix, pathSuffix, request) {
    if (libpath.normalize(pathSuffix).split(libpath.sep)[0] === "..") {
        throw 400;
    }
    let path = libpath.join(pathPrefix, pathSuffix);
    while (libfs.existsSync(path) && libfs.statSync(path).isDirectory()) {
        path = libpath.join(path, "index.html");
    }
    if (!libfs.existsSync(path)) {
        throw 404;
    }
    let stat = libfs.statSync(path);
    let range = parseRangeHeader(request.headers().range, stat.size);
    let stream = libfs.createReadStream(path, {
        start: range.offset,
        end: range.offset + range.length
    });
    return {
        status: range.status,
        headers: {
            "Accept-Ranges": "bytes",
            "Content-Length": `${range.length}`,
            "Content-Range": range.length > 0 ? `bytes ${range.offset}-${range.offset + range.length - 1}/${range.size}` : `bytes */${range.size}`,
            "Content-Type": getContentTypeFromExtension(libpath.extname(path)),
            "Last-Modified": stat.mtime.toUTCString()
        },
        payload: stream
    };
}
exports.makeReadStreamResponse = makeReadStreamResponse;
;
