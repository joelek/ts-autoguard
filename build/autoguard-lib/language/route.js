"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = exports.Message = exports.Headers = exports.Parameters = exports.Parameter = exports.Method = exports.Path = exports.Component = void 0;
const tokenization = require("../tokenization");
const types = require("./types");
class Component {
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            var _a, _b;
            if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.family) === "<") {
                tokenization.expect(read(), "<");
                let name = tokenization.expect(read(), "IDENTIFIER").value;
                tokenization.expect(read(), ":");
                let type = tokenization.expect(read(), ["boolean", "number", "string"]).value;
                tokenization.expect(read(), ">");
                return new Component(name, type);
            }
            else {
                let name = "";
                if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.family) === "IDENTIFIER") {
                    name = tokenization.expect(read(), "IDENTIFIER").value;
                }
                return new Component(name);
            }
        });
    }
}
exports.Component = Component;
;
class Path {
    constructor(components) {
        this.components = components;
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            var _a;
            let components = new Array();
            while (true) {
                tokenization.expect(read(), "/");
                let component = Component.parse(tokenizer);
                components.push(component);
                if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.family) !== "/") {
                    break;
                }
            }
            return new Path(components);
        });
    }
}
exports.Path = Path;
;
class Method {
    constructor(method) {
        this.method = method;
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            let method = tokenization.expect(read(), "IDENTIFIER").value;
            return new Method(method);
        });
    }
}
exports.Method = Method;
;
class Parameter {
    constructor(name, type, optional) {
        this.name = name;
        this.type = type;
        this.optional = optional;
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            var _a;
            let name = tokenization.expect(read(), "IDENTIFIER").value;
            let optional = false;
            if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.family) === "?") {
                tokenization.expect(read(), "?");
                optional = true;
            }
            tokenization.expect(read(), ":");
            let type = tokenization.expect(read(), ["boolean", "number", "string"]).value;
            return new Parameter(name, type, optional);
        });
    }
}
exports.Parameter = Parameter;
;
class Parameters {
    constructor(parameters) {
        this.parameters = parameters;
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            var _a, _b;
            let parameters = new Array();
            tokenization.expect(read(), "<");
            tokenization.expect(read(), "{");
            while (((_a = peek()) === null || _a === void 0 ? void 0 : _a.family) !== "}") {
                let parameter = Parameter.parse(tokenizer);
                parameters.push(parameter);
                if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.family) === ",") {
                    tokenization.expect(read(), ",");
                }
                else {
                    break;
                }
            }
            tokenization.expect(read(), "}");
            tokenization.expect(read(), ">");
            return new Parameters(parameters);
        });
    }
}
exports.Parameters = Parameters;
;
class Headers {
    constructor(headers) {
        this.headers = headers;
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            var _a, _b;
            let headers = new Array();
            tokenization.expect(read(), "<");
            tokenization.expect(read(), "{");
            while (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "}") {
                let header = Parameter.parse(tokenizer);
                headers.push(header);
                if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.family) === ",") {
                    tokenization.expect(read(), ",");
                }
                else {
                    break;
                }
            }
            tokenization.expect(read(), "}");
            tokenization.expect(read(), ">");
            return new Headers(headers);
        });
    }
}
exports.Headers = Headers;
;
class Message {
    constructor(headers, payload) {
        this.headers = headers;
        this.payload = payload;
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            var _a;
            let headers = new Headers([]);
            if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.family) === "<") {
                headers = Headers.parse(tokenizer);
            }
            let payload = types.UndefinedType.INSTANCE;
            try {
                payload = types.Type.parse(tokenizer);
            }
            catch (error) { }
            return new Message(headers, payload);
        });
    }
}
exports.Message = Message;
;
class Route {
    constructor(method, path, parameters, request, response) {
        this.method = method;
        this.path = path;
        this.parameters = parameters;
        this.request = request;
        this.response = response;
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            var _a, _b, _c;
            tokenization.expect(read(), "route");
            let method = Method.parse(tokenizer);
            tokenization.expect(read(), ":");
            let path = Path.parse(tokenizer);
            let parameters = new Parameters([]);
            if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.family) === "?") {
                tokenization.expect(read(), "?");
                parameters = Parameters.parse(tokenizer);
            }
            let request = new Message(new Headers([]), types.UndefinedType.INSTANCE);
            if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.family) === "<=") {
                tokenization.expect(read(), "<=");
                request = Message.parse(tokenizer);
            }
            let response = new Message(new Headers([]), types.UndefinedType.INSTANCE);
            if (((_c = peek()) === null || _c === void 0 ? void 0 : _c.family) === "=>") {
                tokenization.expect(read(), "=>");
                response = Message.parse(tokenizer);
            }
            return new Route(method, path, parameters, request, response);
        });
    }
}
exports.Route = Route;
;
