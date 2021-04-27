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
exports.route = exports.fetch = exports.checkComponents = exports.transformResponse = exports.getHeaders = exports.getParameters = exports.getComponents = exports.getRequiredBoolean = exports.getOptionalBoolean = exports.getRequiredNumber = exports.getOptionalNumber = exports.getRequiredString = exports.getOptionalString = exports.serializeParameters = exports.extractKeyValuePairs = exports.serializeComponents = void 0;
const guards = require("./guards");
const is = require("./is");
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
function getOptionalString(pairs, key) {
    for (let pair of pairs) {
        if (pair[0] === key) {
            let value = pair[1];
            return value;
        }
    }
}
exports.getOptionalString = getOptionalString;
;
function getRequiredString(pairs, key) {
    let value = getOptionalString(pairs, key);
    if (is.present(value)) {
        return value;
    }
    throw `Expected a string for key "${key}"!`;
}
exports.getRequiredString = getRequiredString;
;
function getOptionalNumber(pairs, key) {
    for (let pair of pairs) {
        if (pair[0] === key) {
            let value = JSON.parse(pair[1]);
            if (!guards.Number.is(value)) {
                throw `Expected ${value} to be a number!`;
            }
            return value;
        }
    }
}
exports.getOptionalNumber = getOptionalNumber;
;
function getRequiredNumber(pairs, key) {
    let value = getOptionalNumber(pairs, key);
    if (is.present(value)) {
        return value;
    }
    throw `Expected a number for key "${key}"!`;
}
exports.getRequiredNumber = getRequiredNumber;
;
function getOptionalBoolean(pairs, key) {
    for (let pair of pairs) {
        if (pair[0] === key) {
            let value = JSON.parse(pair[1]);
            if (!guards.Boolean.is(value)) {
                throw `Expected ${value} to be a boolean!`;
            }
            return value;
        }
    }
}
exports.getOptionalBoolean = getOptionalBoolean;
;
function getRequiredBoolean(pairs, key) {
    let value = getOptionalBoolean(pairs, key);
    if (is.present(value)) {
        return value;
    }
    throw `Expected a boolean for key "${key}"!`;
}
exports.getRequiredBoolean = getRequiredBoolean;
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
function transformResponse(response) {
    var _a, _b;
    let status = (_a = response.status) !== null && _a !== void 0 ? _a : 200;
    let headers = Object.entries((_b = response.headers) !== null && _b !== void 0 ? _b : {}).map((entry) => {
        return [entry[0], String(entry)];
    });
    let payload = JSON.stringify(response.payload);
    return {
        status: status,
        headers: headers,
        payload: payload
    };
}
exports.transformResponse = transformResponse;
;
function checkComponents(one, two) {
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
exports.checkComponents = checkComponents;
;
function fetch(method, url, headers, payload) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onerror = reject;
        xhr.onabort = reject;
        xhr.onload = () => {
            let status = xhr.status;
            let headers = getHeaders(xhr.getAllResponseHeaders().split("\r\n").slice(0, -1));
            let payload = xhr.responseText || undefined;
            resolve({
                status,
                headers,
                payload
            });
        };
        xhr.open(method, url, true);
        for (let header of headers) {
            xhr.setRequestHeader(header[0], header[1]);
        }
        xhr.send(payload);
    });
}
exports.fetch = fetch;
;
function route(endpoints, httpRequest, httpResponse) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        let method = (_a = httpRequest.method) !== null && _a !== void 0 ? _a : "GET";
        let url = (_b = httpRequest.url) !== null && _b !== void 0 ? _b : "";
        let components = getComponents(url);
        let parameters = getParameters(url);
        let headers = getHeaders(httpRequest.rawHeaders);
        let payload = (yield (() => __awaiter(this, void 0, void 0, function* () {
            var e_1, _e;
            let chunks = new Array();
            try {
                for (var httpRequest_1 = __asyncValues(httpRequest), httpRequest_1_1; httpRequest_1_1 = yield httpRequest_1.next(), !httpRequest_1_1.done;) {
                    let chunk = httpRequest_1_1.value;
                    chunks.push(chunk);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (httpRequest_1_1 && !httpRequest_1_1.done && (_e = httpRequest_1.return)) yield _e.call(httpRequest_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            let buffer = Buffer.concat(chunks);
            return buffer.toString();
        }))()) || undefined;
        let request = {
            method,
            components,
            parameters,
            headers,
            payload
        };
        for (let endpoint of endpoints) {
            let response = yield endpoint(request);
            if (response.status === 404) {
                continue;
            }
            for (let header of (_c = response.headers) !== null && _c !== void 0 ? _c : []) {
                httpResponse.setHeader(header[0], header[1]);
            }
            httpResponse.writeHead(response.status);
            httpResponse.write((_d = response.payload) !== null && _d !== void 0 ? _d : "");
            return httpResponse.end();
        }
        httpResponse.writeHead(404);
        return httpResponse.end();
    });
}
exports.route = route;
;
