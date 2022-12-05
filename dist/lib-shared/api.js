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
exports.wrapMessageGuard = exports.deserializePayload = exports.deserializeStringPayload = exports.compareArrays = exports.serializePayload = exports.serializeStringPayload = exports.collectPayload = exports.deserializeValue = exports.serializeValue = exports.Headers = exports.Options = exports.JSON = exports.Primitive = exports.Binary = exports.SyncBinary = exports.AsyncBinary = exports.decodeUndeclaredHeaders = exports.decodeHeaderValue = exports.decodeHeaderValues = exports.decodeUndeclaredParameters = exports.decodeParameterValue = exports.decodeParameterValues = exports.encodeUndeclaredParameterPairs = exports.encodeParameterPairs = exports.escapeParameterValue = exports.escapeParameterKey = exports.encodeComponents = exports.escapeComponent = exports.encodeUndeclaredHeaderPairs = exports.encodeHeaderPairs = exports.escapeHeaderValue = exports.escapeHeaderKey = exports.splitHeaders = exports.combineParameters = exports.splitParameters = exports.combineComponents = exports.splitComponents = exports.decodeURIComponent = void 0;
const guards = require("./guards");
function decodeURIComponent(string) {
    try {
        return globalThis.decodeURIComponent(string);
    }
    catch (error) { }
}
exports.decodeURIComponent = decodeURIComponent;
;
function splitComponents(url) {
    let components = new Array();
    for (let part of url.split("?")[0].split("/").slice(1)) {
        components.push(part);
    }
    return components;
}
exports.splitComponents = splitComponents;
;
function combineComponents(components) {
    return "/" + components.join("/");
}
exports.combineComponents = combineComponents;
;
function splitParameters(url) {
    let parameters = new Array();
    let query = url.split("?").slice(1).join("?");
    if (query !== "") {
        for (let part of query.split("&")) {
            let parts = part.split("=");
            if (parts.length === 1) {
                let key = parts[0];
                let value = "";
                parameters.push([key, value]);
            }
            else {
                let key = parts[0];
                let value = parts.slice(1).join("=");
                parameters.push([key, value]);
            }
        }
    }
    return parameters;
}
exports.splitParameters = splitParameters;
;
function combineParameters(parameters) {
    let parts = parameters.map((parameters) => {
        let key = parameters[0];
        let value = parameters[1];
        return `${key}=${value}`;
    });
    if (parts.length === 0) {
        return "";
    }
    return `?${parts.join("&")}`;
}
exports.combineParameters = combineParameters;
;
function splitHeaders(lines) {
    return lines.map((part) => {
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
exports.splitHeaders = splitHeaders;
;
const RFC7320_DELIMITERS = "\"(),/:;<=>?@[\\]{}";
const RFC7320_WHITESPACE = "\t ";
// The specification (rfc7320) allows octets 33-126 and forbids delimiters. Octets 128-255 have been deprecated since rfc2616.
function escapeHeaderKey(string, alwaysEncode = "") {
    return escapeHeaderValue(string, RFC7320_DELIMITERS + RFC7320_WHITESPACE + alwaysEncode);
}
exports.escapeHeaderKey = escapeHeaderKey;
;
// The specification (rfc7320) allows octets 33-126 and whitespace. Octets 128-255 have been deprecated since rfc2616.
function escapeHeaderValue(string, alwaysEncode = "") {
    return [...string]
        .map((codePointString) => {
        var _a;
        if (!alwaysEncode.includes(codePointString) && codePointString !== "%") {
            let codePoint = (_a = codePointString.codePointAt(0)) !== null && _a !== void 0 ? _a : 0;
            if (codePoint >= 33 && codePoint <= 126) {
                return codePointString;
            }
            if (RFC7320_WHITESPACE.includes(codePointString)) {
                return codePointString;
            }
        }
        return encodeURIComponent(codePointString);
    })
        .join("");
}
exports.escapeHeaderValue = escapeHeaderValue;
;
function encodeHeaderPairs(key, values, plain) {
    let pairs = new Array();
    for (let value of values) {
        let serialized = serializeValue(value, plain);
        if (serialized !== undefined) {
            if (plain) {
                pairs.push([
                    escapeHeaderKey(key),
                    escapeHeaderValue(serialized)
                ]);
            }
            else {
                pairs.push([
                    escapeHeaderKey(key),
                    escapeHeaderKey(serialized)
                ]);
            }
        }
    }
    return pairs;
}
exports.encodeHeaderPairs = encodeHeaderPairs;
;
function encodeUndeclaredHeaderPairs(record, exclude) {
    let pairs = new Array();
    for (let [key, value] of Object.entries(record)) {
        if (!exclude.includes(key) && value !== undefined) {
            if (guards.String.is(value)) {
                pairs.push(...encodeHeaderPairs(key, [value], true));
            }
            else if (guards.Array.of(guards.String).is(value)) {
                pairs.push(...encodeHeaderPairs(key, value, true));
            }
            else {
                throw `Expected type of undeclared header "${key}" to be string or string[]!`;
            }
        }
    }
    return pairs;
}
exports.encodeUndeclaredHeaderPairs = encodeUndeclaredHeaderPairs;
;
function escapeComponent(string) {
    return encodeURIComponent(string);
}
exports.escapeComponent = escapeComponent;
;
function encodeComponents(values, plain) {
    let array = new Array();
    for (let value of values) {
        let serialized = serializeValue(value, plain);
        if (serialized !== undefined) {
            array.push(escapeComponent(serialized));
        }
    }
    return array;
}
exports.encodeComponents = encodeComponents;
;
function escapeParameterKey(string) {
    return encodeURIComponent(string);
}
exports.escapeParameterKey = escapeParameterKey;
;
function escapeParameterValue(string) {
    return encodeURIComponent(string);
}
exports.escapeParameterValue = escapeParameterValue;
;
function encodeParameterPairs(key, values, plain) {
    let pairs = new Array();
    for (let value of values) {
        let serialized = serializeValue(value, plain);
        if (serialized !== undefined) {
            pairs.push([
                escapeParameterKey(key),
                escapeParameterValue(serialized)
            ]);
        }
    }
    return pairs;
}
exports.encodeParameterPairs = encodeParameterPairs;
;
function encodeUndeclaredParameterPairs(record, exclude) {
    let pairs = new Array();
    for (let [key, value] of Object.entries(record)) {
        if (!exclude.includes(key) && value !== undefined) {
            if (guards.String.is(value)) {
                pairs.push(...encodeParameterPairs(key, [value], true));
            }
            else if (guards.Array.of(guards.String).is(value)) {
                pairs.push(...encodeParameterPairs(key, value, true));
            }
            else {
                throw `Expected type of undeclared parameter "${key}" to be string or string[]!`;
            }
        }
    }
    return pairs;
}
exports.encodeUndeclaredParameterPairs = encodeUndeclaredParameterPairs;
;
function decodeParameterValues(pairs, key, plain) {
    let values = new Array();
    for (let pair of pairs) {
        if (key === decodeURIComponent(pair[0])) {
            let parts = pair[1].split(",");
            for (let part of parts) {
                let value = deserializeValue(decodeURIComponent(part), plain);
                if (value === undefined) {
                    throw `Expected parameter "${key}" to be properly encoded!`;
                }
                values.push(value);
            }
        }
    }
    return values;
}
exports.decodeParameterValues = decodeParameterValues;
;
function decodeParameterValue(pairs, key, plain) {
    let values = decodeParameterValues(pairs, key, plain);
    if (values.length > 1) {
        throw `Expected no more than one "${key}" parameter!`;
    }
    return values[0];
}
exports.decodeParameterValue = decodeParameterValue;
;
function decodeUndeclaredParameters(pairs, exclude) {
    let map = {};
    for (let pair of pairs) {
        let key = decodeURIComponent(pair[0]);
        let value = decodeURIComponent(pair[1]);
        if (key === undefined || value === undefined) {
            throw `Expected undeclared parameter "${key}" to be properly encoded!`;
        }
        if (!exclude.includes(key)) {
            let values = map[key];
            if (values === undefined) {
                values = new Array();
                map[key] = values;
            }
            values.push(value);
        }
    }
    let record = {};
    for (let [key, value] of Object.entries(map)) {
        if (value.length === 1) {
            record[key] = value[0];
        }
        else {
            record[key] = value;
        }
    }
    return record;
}
exports.decodeUndeclaredParameters = decodeUndeclaredParameters;
;
function decodeHeaderValues(pairs, key, plain) {
    let values = new Array();
    for (let pair of pairs) {
        if (key === decodeURIComponent(pair[0])) {
            let parts = pair[1].split(",");
            for (let part of parts) {
                let value = deserializeValue(decodeURIComponent(part.trim()), plain);
                if (value === undefined) {
                    throw `Expected header "${key}" to be properly encoded!`;
                }
                values.push(value);
            }
        }
    }
    return values;
}
exports.decodeHeaderValues = decodeHeaderValues;
;
function decodeHeaderValue(pairs, key, plain) {
    let values = decodeHeaderValues(pairs, key, plain);
    if (values.length > 1) {
        throw `Expected no more than one "${key}" header!`;
    }
    return values[0];
}
exports.decodeHeaderValue = decodeHeaderValue;
;
function decodeUndeclaredHeaders(pairs, exclude) {
    let map = {};
    for (let pair of pairs) {
        let key = decodeURIComponent(pair[0]);
        let value = decodeURIComponent(pair[1]);
        if (key === undefined || value === undefined) {
            throw `Expected undeclared header "${key}" to be properly encoded!`;
        }
        if (!exclude.includes(key)) {
            let values = map[key];
            if (values === undefined) {
                values = new Array();
                map[key] = values;
            }
            values.push(value);
        }
    }
    let record = {};
    for (let [key, value] of Object.entries(map)) {
        if (value.length === 1) {
            record[key] = value[0];
        }
        else {
            record[key] = value;
        }
    }
    return record;
}
exports.decodeUndeclaredHeaders = decodeUndeclaredHeaders;
;
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
exports.Primitive = guards.Union.of(guards.Boolean, guards.Number, guards.String, guards.Undefined);
exports.JSON = guards.Group.of(guards.Union.of(guards.Boolean, guards.Null, guards.Number, guards.String, guards.Array.of(guards.Reference.of(() => exports.JSON)), guards.Record.of(guards.Reference.of(() => exports.JSON)), guards.Undefined), "JSON");
exports.Options = guards.Record.of(exports.JSON);
exports.Headers = guards.Record.of(exports.JSON);
function serializeValue(value, plain) {
    if (value === undefined) {
        return;
    }
    return plain ? String(value) : globalThis.JSON.stringify(value);
}
exports.serializeValue = serializeValue;
;
function deserializeValue(value, plain) {
    if (value === undefined || plain) {
        return value;
    }
    try {
        return globalThis.JSON.parse(value);
    }
    catch (error) { }
}
exports.deserializeValue = deserializeValue;
;
function collectPayload(binary, maxByteLength) {
    var _a, binary_1, binary_1_1;
    var _b, e_1, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        maxByteLength = maxByteLength !== null && maxByteLength !== void 0 ? maxByteLength : Infinity;
        let chunks = new Array();
        let length = 0;
        try {
            for (_a = true, binary_1 = __asyncValues(binary); binary_1_1 = yield binary_1.next(), _b = binary_1_1.done, !_b;) {
                _d = binary_1_1.value;
                _a = false;
                try {
                    let chunk = _d;
                    chunks.push(chunk);
                    length += chunk.length;
                    if (length > maxByteLength) {
                        throw `Expected payload to contain at most ${maxByteLength} bytes!`;
                    }
                }
                finally {
                    _a = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_a && !_b && (_c = binary_1.return)) yield _c.call(binary_1);
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
    // @ts-ignore
    let encoder = new TextEncoder();
    let array = encoder.encode(string);
    return [array];
}
exports.serializeStringPayload = serializeStringPayload;
;
function serializePayload(payload) {
    let serialized = serializeValue(payload, false);
    if (serialized === undefined) {
        return [];
    }
    return serializeStringPayload(serialized);
}
exports.serializePayload = serializePayload;
;
function compareArrays(one, two) {
    if (one.length !== two.length) {
        return false;
    }
    for (let i = 0; i < one.length; i++) {
        if (one[i] !== two[i]) {
            return false;
        }
    }
    return true;
}
exports.compareArrays = compareArrays;
;
function deserializeStringPayload(binary) {
    return __awaiter(this, void 0, void 0, function* () {
        let buffer = yield collectPayload(binary);
        // @ts-ignore
        let decoder = new TextDecoder();
        let string = decoder.decode(buffer);
        // @ts-ignore
        let encoder = new TextEncoder();
        let encoded = encoder.encode(string);
        if (!compareArrays(buffer, encoded)) {
            throw `Expected payload to be UTF-8 encoded!`;
        }
        return string;
    });
}
exports.deserializeStringPayload = deserializeStringPayload;
;
function deserializePayload(binary) {
    return __awaiter(this, void 0, void 0, function* () {
        let string = yield deserializeStringPayload(binary);
        if (string === "") {
            return;
        }
        let value = deserializeValue(string, false);
        if (value === undefined) {
            throw `Expected payload to be JSON encoded!`;
        }
        return value;
    });
}
exports.deserializePayload = deserializePayload;
;
function wrapMessageGuard(guard, log) {
    return Object.assign(Object.assign({}, guard), { as(subject, path) {
            if (log) {
                console.log(subject);
            }
            return guard.as(subject, path);
        } });
}
exports.wrapMessageGuard = wrapMessageGuard;
;
