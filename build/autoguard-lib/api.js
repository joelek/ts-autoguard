"use strict";
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
exports.route = exports.combineRawHeaders = exports.respond = exports.xhr = exports.acceptsMethod = exports.acceptsComponents = exports.transformResponse = exports.getContentType = exports.deserializePayload = exports.deserializeStringPayload = exports.serializePayload = exports.serializeStringPayload = exports.collectPayload = exports.ServerResponse = exports.ClientRequest = exports.getHeaders = exports.getParameters = exports.getComponents = exports.getBooleanOption = exports.getNumberOption = exports.getStringOption = exports.serializeParameters = exports.combineKeyValuePairs = exports.extractKeyValuePairs = exports.serializeComponents = exports.Binary = exports.SyncBinary = exports.AsyncBinary = exports.Headers = exports.Options = void 0;
const guards = require("./guards");
exports.Options = guards.Record.of(guards.Union.of(guards.Boolean, guards.Number, guards.String));
exports.Headers = guards.Record.of(guards.Union.of(guards.Boolean, guards.Number, guards.String));
exports.AsyncBinary = {
    as(subject, path = "") {
        if (subject != null) {
            let member = subject[Symbol.asyncIterator];
            if (member != null && member.constructor === globalThis.Function) {
                return subject;
            }
        }
        throw "Expected AsyncBinary at " + path + "!";
    },
    is(subject) {
        try {
            this.as(subject);
        }
        catch (error) {
            return false;
        }
        return true;
    },
    ts(eol = "\n") {
        return `AsyncBinary`;
    }
};
exports.SyncBinary = {
    as(subject, path = "") {
        if (subject != null) {
            let member = subject[Symbol.iterator];
            if (member != null && member.constructor === globalThis.Function) {
                return subject;
            }
        }
        throw "Expected SyncBinary at " + path + "!";
    },
    is(subject) {
        try {
            this.as(subject);
        }
        catch (error) {
            return false;
        }
        return true;
    },
    ts(eol = "\n") {
        return `SyncBinary`;
    }
};
exports.Binary = guards.Union.of(exports.AsyncBinary, exports.SyncBinary);
function serializeComponents(components) {
    return "/" + components
        .map((component) => {
        return encodeURIComponent(component);
    })
        .join("/");
}
exports.serializeComponents = serializeComponents;
;
function extractKeyValuePairs(record, exclude = []) {
    let pairs = new Array();
    for (let [key, value] of Object.entries(record)) {
        if (value !== undefined && !exclude.includes(key)) {
            pairs.push([key, String(value)]);
        }
    }
    return pairs;
}
exports.extractKeyValuePairs = extractKeyValuePairs;
;
function combineKeyValuePairs(pairs) {
    let record = {};
    for (let pair of pairs) {
        record[pair[0]] = pair[1];
    }
    return record;
}
exports.combineKeyValuePairs = combineKeyValuePairs;
;
function serializeParameters(parameters) {
    let parts = parameters.map((parameters) => {
        let key = encodeURIComponent(parameters[0]);
        let value = encodeURIComponent(parameters[1]);
        return `${key}=${value}`;
    });
    if (parts.length === 0) {
        return "";
    }
    return `?${parts.join("&")}`;
}
exports.serializeParameters = serializeParameters;
;
function getStringOption(pairs, key) {
    for (let pair of pairs) {
        if (pair[0] === key) {
            try {
                let value = pair[1];
                if (guards.String.is(value)) {
                    return value;
                }
            }
            catch (error) { }
        }
    }
}
exports.getStringOption = getStringOption;
;
function getNumberOption(pairs, key) {
    for (let pair of pairs) {
        if (pair[0] === key) {
            try {
                let value = JSON.parse(pair[1]);
                if (guards.Number.is(value)) {
                    return value;
                }
            }
            catch (error) { }
        }
    }
}
exports.getNumberOption = getNumberOption;
;
function getBooleanOption(pairs, key) {
    for (let pair of pairs) {
        if (pair[0] === key) {
            try {
                let value = JSON.parse(pair[1]);
                if (guards.Boolean.is(value)) {
                    return value;
                }
            }
            catch (error) { }
        }
    }
}
exports.getBooleanOption = getBooleanOption;
;
function getComponents(url) {
    return url.split("?")[0].split("/").map((part) => {
        return decodeURIComponent(part);
    }).slice(1);
}
exports.getComponents = getComponents;
;
function getParameters(url) {
    let query = url.split("?").slice(1).join("?");
    return query === "" ? [] : query.split("&").map((part) => {
        let parts = part.split("=");
        if (parts.length === 1) {
            let key = decodeURIComponent(parts[0]);
            let value = "";
            return [key, value];
        }
        else {
            let key = decodeURIComponent(parts[0]);
            let value = decodeURIComponent(parts.slice(1).join("="));
            return [key, value];
        }
    });
}
exports.getParameters = getParameters;
;
function getHeaders(headers) {
    return headers.map((part) => {
        let parts = part.split(":");
        if (parts.length === 1) {
            let key = parts[0].toLowerCase();
            let value = "";
            return [key, value];
        }
        else {
            let key = parts[0].toLowerCase();
            let value = parts.slice(1).join(":").trim();
            return [key, value];
        }
    });
}
exports.getHeaders = getHeaders;
;
class ClientRequest {
    constructor(request) {
        this.request = request;
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
            let payload = this.request.payload;
            return (exports.Binary.is(payload) ? yield collectPayload(payload) : payload);
        });
    }
}
exports.ClientRequest = ClientRequest;
;
class ServerResponse {
    constructor(response) {
        this.response = response;
    }
    status() {
        let status = this.response.status;
        return status !== null && status !== void 0 ? status : 200;
    }
    headers() {
        let headers = this.response.headers;
        return Object.assign({}, headers);
    }
    payload() {
        return __awaiter(this, void 0, void 0, function* () {
            let payload = this.response.payload;
            return (exports.Binary.is(payload) ? yield collectPayload(payload) : payload);
        });
    }
}
exports.ServerResponse = ServerResponse;
;
function collectPayload(binary) {
    var binary_1, binary_1_1;
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        let chunks = new Array();
        let length = 0;
        try {
            for (binary_1 = __asyncValues(binary); binary_1_1 = yield binary_1.next(), !binary_1_1.done;) {
                let chunk = binary_1_1.value;
                chunks.push(chunk);
                length += chunk.length;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (binary_1_1 && !binary_1_1.done && (_a = binary_1.return)) yield _a.call(binary_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        let payload = new Uint8Array(length);
        let offset = 0;
        for (let chunk of chunks) {
            payload.set(chunk, offset);
            offset += chunk.length;
        }
        return payload;
    });
}
exports.collectPayload = collectPayload;
;
function serializeStringPayload(string) {
    let encoder = new TextEncoder();
    let array = encoder.encode(string);
    return [array];
}
exports.serializeStringPayload = serializeStringPayload;
;
function serializePayload(payload) {
    if (payload === undefined) {
        return [];
    }
    let string = JSON.stringify(payload);
    return serializeStringPayload(string);
}
exports.serializePayload = serializePayload;
;
function deserializeStringPayload(binary) {
    return __awaiter(this, void 0, void 0, function* () {
        let buffer = yield collectPayload(binary);
        let decoder = new TextDecoder();
        let string = decoder.decode(buffer);
        return string;
    });
}
exports.deserializeStringPayload = deserializeStringPayload;
;
function deserializePayload(binary) {
    return __awaiter(this, void 0, void 0, function* () {
        let string = yield deserializeStringPayload(binary);
        return string === "" ? undefined : JSON.parse(string);
    });
}
exports.deserializePayload = deserializePayload;
;
function getContentType(payload) {
    if (exports.Binary.is(payload) || payload === undefined) {
        return "application/octet-stream";
    }
    else {
        return "application/json; charset=utf-8";
    }
}
exports.getContentType = getContentType;
;
function transformResponse(response) {
    var _a, _b;
    let status = (_a = response.status) !== null && _a !== void 0 ? _a : 200;
    let headers = extractKeyValuePairs((_b = response.headers) !== null && _b !== void 0 ? _b : {});
    let contentType = headers.find((header) => {
        return header[0].toLowerCase() === "content-type";
    });
    if (contentType === undefined) {
        headers.push(["Content-Type", getContentType(response.payload)]);
    }
    let payload = exports.Binary.is(response.payload) ? response.payload : serializePayload(response.payload);
    return {
        status: status,
        headers: headers,
        payload: payload
    };
}
exports.transformResponse = transformResponse;
;
function acceptsComponents(one, two) {
    if (one.length !== two.length) {
        return false;
    }
    let length = one.length;
    for (let i = 0; i < length; i++) {
        if (two[i][0] === "") {
            if (one[i] !== two[i][1]) {
                return false;
            }
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
function xhr(raw, urlPrefix) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        let xhr = new XMLHttpRequest();
        xhr.onerror = reject;
        xhr.onabort = reject;
        xhr.onload = () => {
            let status = xhr.status;
            let headers = getHeaders(xhr.getAllResponseHeaders().split("\r\n").slice(0, -1));
            let payload = [new Uint8Array(xhr.response)];
            resolve({
                status,
                headers,
                payload
            });
        };
        let url = urlPrefix !== null && urlPrefix !== void 0 ? urlPrefix : "";
        url += serializeComponents(raw.components);
        url += serializeParameters(raw.parameters);
        xhr.open(raw.method, url, true);
        xhr.responseType = "arraybuffer";
        for (let header of raw.headers) {
            xhr.setRequestHeader(header[0], header[1]);
        }
        xhr.send(yield collectPayload(raw.payload));
    }));
}
exports.xhr = xhr;
;
function respond(httpResponse, raw) {
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function* () {
        for (let header of raw.headers) {
            httpResponse.setHeader(header[0], header[1]);
        }
        httpResponse.writeHead(raw.status);
        try {
            for (var _b = __asyncValues(raw.payload), _c; _c = yield _b.next(), !_c.done;) {
                let chunk = _c.value;
                if (!httpResponse.write(chunk)) {
                    yield new Promise((resolve, reject) => {
                        httpResponse.once("drain", resolve);
                    });
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        httpResponse.end();
        yield new Promise((resolve, reject) => {
            httpResponse.once("finish", resolve);
        });
    });
}
exports.respond = respond;
;
function combineRawHeaders(raw) {
    let headers = new Array();
    for (let i = 0; i < raw.length; i += 2) {
        headers.push(`${raw[i + 0]}: ${raw[i + 1]}`);
    }
    return headers;
}
exports.combineRawHeaders = combineRawHeaders;
;
function route(endpoints, httpRequest, httpResponse) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let method = (_a = httpRequest.method) !== null && _a !== void 0 ? _a : "GET";
        let url = (_b = httpRequest.url) !== null && _b !== void 0 ? _b : "";
        let components = getComponents(url);
        let parameters = getParameters(url);
        let headers = getHeaders(combineRawHeaders(httpRequest.rawHeaders));
        let payload = {
            [Symbol.asyncIterator]: () => httpRequest[Symbol.asyncIterator]()
        };
        let raw = {
            method,
            components,
            parameters,
            headers,
            payload
        };
        let filteredEndpoints = endpoints.map((endpoint) => endpoint(raw));
        filteredEndpoints = filteredEndpoints.filter((endpoint) => endpoint.acceptsComponents());
        if (filteredEndpoints.length === 0) {
            return respond(httpResponse, {
                status: 404,
                headers: [],
                payload: []
            });
        }
        filteredEndpoints = filteredEndpoints.filter((endpoint) => endpoint.acceptsMethod());
        if (filteredEndpoints.length === 0) {
            return respond(httpResponse, {
                status: 405,
                headers: [],
                payload: []
            });
        }
        let endpoint = filteredEndpoints[0];
        try {
            let valid = yield endpoint.validateRequest();
            try {
                let handled = yield valid.handleRequest();
                try {
                    let response = yield handled.validateResponse();
                    let raw = transformResponse(response);
                    return yield respond(httpResponse, raw);
                }
                catch (error) {
                    let payload = serializeStringPayload(String(error));
                    return respond(httpResponse, {
                        status: 500,
                        headers: [],
                        payload: payload
                    });
                }
            }
            catch (error) {
                let status = 500;
                if (Number.isInteger(error) && error >= 100 && error <= 999) {
                    status = error;
                }
                return respond(httpResponse, {
                    status: status,
                    headers: [],
                    payload: []
                });
            }
        }
        catch (error) {
            let payload = serializeStringPayload(String(error));
            return respond(httpResponse, {
                status: 400,
                headers: [],
                payload: payload
            });
        }
    });
}
exports.route = route;
;
