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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = exports.sendPayload = exports.fetch = exports.acceptsMethod = exports.acceptsComponents = exports.transformResponse = exports.deserializePayload = exports.serializePayload = exports.unwrapArray = exports.wrapArray = exports.getHeaders = exports.getParameters = exports.getComponents = exports.getBooleanOption = exports.getNumberOption = exports.getStringOption = exports.serializeParameters = exports.extractKeyValuePairs = exports.serializeComponents = void 0;
const guards = require("./guards");
function serializeComponents(components) {
    return "/" + components
        .map((component) => {
        return encodeURIComponent(component);
    })
        .join("/");
}
exports.serializeComponents = serializeComponents;
;
function extractKeyValuePairs(record) {
    let pairs = new Array();
    for (let [key, value] of Object.entries(record)) {
        if (value !== undefined) {
            pairs.push([key, String(value)]);
        }
    }
    return pairs;
}
exports.extractKeyValuePairs = extractKeyValuePairs;
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
            let value = pair[1];
            if (guards.String.is(value)) {
                return value;
            }
        }
    }
}
exports.getStringOption = getStringOption;
;
function getNumberOption(pairs, key) {
    for (let pair of pairs) {
        if (pair[0] === key) {
            let value = JSON.parse(pair[1]);
            if (guards.Number.is(value)) {
                return value;
            }
        }
    }
}
exports.getNumberOption = getNumberOption;
;
function getBooleanOption(pairs, key) {
    for (let pair of pairs) {
        if (pair[0] === key) {
            let value = JSON.parse(pair[1]);
            if (guards.Boolean.is(value)) {
                return value;
            }
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
    return url.split("?").slice(1).join("?").split("&").map((part) => {
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
            let key = parts[0];
            let value = "";
            return [key, value];
        }
        else {
            let key = parts[0];
            let value = parts.slice(1).join(":").trim();
            return [key, value];
        }
    });
}
exports.getHeaders = getHeaders;
;
function wrapArray(array) {
    function generator() {
        return __asyncGenerator(this, arguments, function* generator_1() {
            yield yield __await(array);
        });
    }
    return {
        [Symbol.asyncIterator]: generator
    };
}
exports.wrapArray = wrapArray;
;
function unwrapArray(binary) {
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
exports.unwrapArray = unwrapArray;
;
function serializePayload(payload) {
    let string = JSON.stringify(payload !== null && payload !== void 0 ? payload : "");
    let encoder = new TextEncoder();
    let array = encoder.encode(string);
    return wrapArray(array);
}
exports.serializePayload = serializePayload;
;
function deserializePayload(binary) {
    return __awaiter(this, void 0, void 0, function* () {
        let buffer = yield unwrapArray(binary);
        let decoder = new TextDecoder();
        let string = decoder.decode(buffer);
        return string === "" ? undefined : JSON.parse(string);
    });
}
exports.deserializePayload = deserializePayload;
;
function transformResponse(response) {
    var _a, _b;
    let status = (_a = response.status) !== null && _a !== void 0 ? _a : 200;
    let headers = Object.entries((_b = response.headers) !== null && _b !== void 0 ? _b : {}).map((entry) => {
        return [entry[0], String(entry)];
    });
    let payload = guards.Binary.is(response.payload) ? response.payload : serializePayload(response.payload);
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
function fetch(method, url, headers, payload) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        let xhr = new XMLHttpRequest();
        xhr.onerror = reject;
        xhr.onabort = reject;
        xhr.onload = () => {
            let status = xhr.status;
            let headers = getHeaders(xhr.getAllResponseHeaders().split("\r\n").slice(0, -1));
            let payload = wrapArray(new Uint8Array(xhr.response));
            resolve({
                status,
                headers,
                payload
            });
        };
        xhr.open(method, url, true);
        xhr.responseType = "arraybuffer";
        for (let header of headers) {
            xhr.setRequestHeader(header[0], header[1]);
        }
        xhr.send(yield unwrapArray(payload));
    }));
}
exports.fetch = fetch;
;
function sendPayload(httpResponse, payload) {
    var payload_1, payload_1_1;
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (payload_1 = __asyncValues(payload); payload_1_1 = yield payload_1.next(), !payload_1_1.done;) {
                let chunk = payload_1_1.value;
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
                if (payload_1_1 && !payload_1_1.done && (_a = payload_1.return)) yield _a.call(payload_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        httpResponse.end();
        yield new Promise((resolve, reject) => {
            httpResponse.once("finish", resolve);
        });
    });
}
exports.sendPayload = sendPayload;
;
function route(endpoints, httpRequest, httpResponse) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let method = (_a = httpRequest.method) !== null && _a !== void 0 ? _a : "GET";
        let url = (_b = httpRequest.url) !== null && _b !== void 0 ? _b : "";
        let components = getComponents(url);
        let parameters = getParameters(url);
        let headers = getHeaders(httpRequest.rawHeaders);
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
            httpResponse.writeHead(404);
            httpResponse.end();
            return;
        }
        filteredEndpoints = filteredEndpoints.filter((endpoint) => endpoint.acceptsMethod());
        if (filteredEndpoints.length === 0) {
            httpResponse.writeHead(405);
            httpResponse.end();
            return;
        }
        let endpoint = filteredEndpoints[0];
        try {
            let prepared = yield endpoint.prepareRequest();
            try {
                let response = yield prepared.handleRequest();
                let { status, headers, payload } = transformResponse(response);
                for (let header of headers) {
                    httpResponse.setHeader(header[0], header[1]);
                }
                httpResponse.writeHead(status);
                yield sendPayload(httpResponse, payload);
                return;
            }
            catch (error) {
                httpResponse.writeHead(500);
                httpResponse.end();
                return;
            }
        }
        catch (error) {
            httpResponse.writeHead(400);
            let payload = serializePayload(String(error));
            yield sendPayload(httpResponse, payload);
            return;
        }
    });
}
exports.route = route;
;
