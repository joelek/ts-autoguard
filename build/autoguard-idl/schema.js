"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = void 0;
const guard = require("./guard");
const is = require("./is");
const route = require("./route");
const tokenization = require("./tokenization");
const types = require("./types");
function makeParser(type) {
    if (type === "boolean") {
        return "getBooleanOption";
    }
    if (type === "number") {
        return "getNumberOption";
    }
    if (type === "string") {
        return "getStringOption";
    }
    throw `Expected "${type}" to be a supported parameter type!`;
}
function areAllMembersOptional(object) {
    for (let [key, value] of object.members) {
        if (!value.optional) {
            return false;
        }
    }
    return true;
}
function makeRouteTag(route) {
    if (route.alias.identifier !== "") {
        return route.alias.identifier;
    }
    let components = route.path.components.map((component) => {
        if (is.present(component.type)) {
            return `/<${component.name}>`;
        }
        else {
            return `/${encodeURIComponent(component.name)}`;
        }
    });
    return `${route.method.method}:${components.join("")}`;
}
function makeOptionType() {
    return new types.RecordType(new types.UnionType([
        types.BooleanType.INSTANCE,
        types.NumberType.INSTANCE,
        types.StringType.INSTANCE
    ]));
}
function getRequestType(route) {
    let request = new types.ObjectType();
    let options = new types.ObjectType();
    for (let component of route.path.components) {
        if (is.present(component.type)) {
            options.add(component.name, {
                type: types.Type.parse(new tokenization.Tokenizer(component.type)),
                optional: false
            });
        }
    }
    for (let parameter of route.parameters.parameters) {
        options.add(parameter.name, {
            type: types.Type.parse(new tokenization.Tokenizer(parameter.type)),
            optional: parameter.optional
        });
    }
    request.add("options", {
        type: new types.IntersectionType([
            types.Options.INSTANCE,
            options
        ]),
        optional: areAllMembersOptional(options)
    });
    let headers = new types.ObjectType();
    for (let header of route.request.headers.headers) {
        headers.add(header.name, {
            type: types.Type.parse(new tokenization.Tokenizer(header.type)),
            optional: header.optional
        });
    }
    request.add("headers", {
        type: new types.IntersectionType([
            types.Headers.INSTANCE,
            headers
        ]),
        optional: areAllMembersOptional(headers)
    });
    let payload = route.request.payload;
    request.add("payload", {
        type: payload,
        optional: payload === types.UndefinedType.INSTANCE
    });
    return request;
}
function getResponseType(route) {
    let response = new types.ObjectType();
    let headers = new types.ObjectType();
    for (let header of route.response.headers.headers) {
        headers.add(header.name, {
            type: types.Type.parse(new tokenization.Tokenizer(header.type)),
            optional: header.optional
        });
    }
    response.add("status", {
        type: types.NumberType.INSTANCE,
        optional: true
    });
    response.add("headers", {
        type: new types.IntersectionType([
            types.Headers.INSTANCE,
            headers
        ]),
        optional: areAllMembersOptional(headers)
    });
    let payload = route.response.payload;
    response.add("payload", {
        type: payload,
        optional: payload === types.UndefinedType.INSTANCE
    });
    return response;
}
class Schema {
    constructor(guards, routes) {
        this.guards = guards;
        this.routes = routes;
    }
    getImports() {
        let imports = new Map();
        for (let guard of this.guards) {
            let entries = guard.type.getImports();
            for (let entry of entries) {
                imports.set(entry.typename, entry.path);
            }
        }
        for (let route of this.routes) {
            let request = route.request.payload;
            if (is.present(request)) {
                let entries = request.getImports();
                for (let entry of entries) {
                    imports.set(entry.typename, entry.path);
                }
            }
            let response = route.response.payload;
            if (is.present(response)) {
                let entries = response.getImports();
                for (let entry of entries) {
                    imports.set(entry.typename, entry.path);
                }
            }
        }
        return Array.from(imports.entries())
            .sort((one, two) => one[0].localeCompare(two[0]))
            .map((entry) => {
            return {
                path: entry[1],
                typename: entry[0]
            };
        });
    }
    generateSchema(options) {
        let lines = new Array();
        for (let guard of this.guards) {
            lines.push(guard.generateSchema(options));
            lines.push(``);
        }
        for (let route of this.routes) {
            lines.push(route.generateSchema(options));
            lines.push(``);
        }
        return lines.join(options.eol);
    }
    generateClient(options) {
        let lines = new Array();
        lines.push(`// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.`);
        lines.push(``);
        lines.push(`import * as autoguard from "@joelek/ts-autoguard";`);
        lines.push(`import * as shared from "./index";`);
        lines.push(``);
        lines.push(`export const makeClient = (options?: Partial<{`);
        lines.push(`\turlPrefix: string,`);
        lines.push(`\trequestHandler: autoguard.api.RequestHandler`);
        lines.push(`}>): autoguard.api.Client<shared.Autoguard.Requests, shared.Autoguard.Responses> => ({`);
        for (let route of this.routes) {
            let tag = makeRouteTag(route);
            lines.push(`\t"${tag}": async (request) => {`);
            lines.push(`\t\tlet guard = shared.Autoguard.Requests["${tag}"];`);
            lines.push(`\t\tguard.as(request, "request");`);
            lines.push(`\t\tlet method = "${route.method.method}";`);
            lines.push(`\t\tlet components = new Array<string>();`);
            for (let component of route.path.components) {
                if (is.absent(component.type)) {
                    lines.push(`\t\tcomponents.push(decodeURIComponent("${encodeURIComponent(component.name)}"));`);
                }
                else {
                    lines.push(`\t\tcomponents.push(String(request.options["${component.name}"]));`);
                }
            }
            let exclude = new Array();
            for (let component of route.path.components) {
                if (is.present(component.type)) {
                    exclude.push(`"${component.name}"`);
                }
            }
            lines.push(`\t\tlet parameters = autoguard.api.extractKeyValuePairs(request.options ?? {}, [${exclude.join(",")}]);`);
            lines.push(`\t\tlet headers = autoguard.api.extractKeyValuePairs(request.headers ?? {});`);
            if (route.request.payload === types.Binary.INSTANCE) {
                lines.push(`\t\tlet payload = request.payload;`);
            }
            else {
                lines.push(`\t\tlet payload = autoguard.api.serializePayload(request.payload);`);
            }
            lines.push(`\t\tlet requestHandler = options?.requestHandler ?? autoguard.api.xhr;`);
            lines.push(`\t\tlet raw = await requestHandler({ method, components, parameters, headers, payload }, options?.urlPrefix);`);
            lines.push(`\t\t{`);
            lines.push(`\t\t\tlet status = raw.status;`);
            lines.push(`\t\t\tlet headers = autoguard.api.combineKeyValuePairs(raw.headers);`);
            for (let header of route.response.headers.headers) {
                lines.push(`\t\t\theaders["${header.name}"] = autoguard.api.${makeParser(header.type)}(raw.headers, "${header.name}");`);
            }
            if (route.response.payload === types.Binary.INSTANCE) {
                lines.push(`\t\t\tlet payload = raw.payload;`);
            }
            else {
                lines.push(`\t\t\tlet payload = await autoguard.api.deserializePayload(raw.payload);`);
            }
            lines.push(`\t\t\tlet guard = shared.Autoguard.Responses["${tag}"];`);
            lines.push(`\t\t\tlet response = guard.as({ status, headers, payload }, "response");`);
            lines.push(`\t\t\treturn new autoguard.api.ServerResponse(response);`);
            lines.push(`\t\t}`);
            lines.push(`\t},`);
        }
        lines.push(`});`);
        lines.push(``);
        return lines.join(options.eol);
    }
    generateServer(options) {
        let lines = new Array();
        lines.push(`// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.`);
        lines.push(``);
        lines.push(`import * as autoguard from "@joelek/ts-autoguard";`);
        lines.push(`import * as shared from "./index";`);
        lines.push(``);
        lines.push(`export const makeServer = (routes: autoguard.api.Server<shared.Autoguard.Requests, shared.Autoguard.Responses>, options?: Partial<{ urlPrefix: string }>): autoguard.api.RequestListener => {`);
        lines.push(`\tlet endpoints = new Array<autoguard.api.Endpoint>();`);
        for (let route of this.routes) {
            let tag = makeRouteTag(route);
            lines.push(`\tendpoints.push((raw, auxillary) => {`);
            lines.push(`\t\tlet method = "${route.method.method}";`);
            lines.push(`\t\tlet components = new Array<[string, string]>();`);
            for (let [index, component] of route.path.components.entries()) {
                if (is.present(component.type)) {
                    lines.push(`\t\tcomponents.push(["${component.name}", raw.components[${index}]]);`);
                }
                else {
                    lines.push(`\t\tcomponents.push(["", decodeURIComponent("${encodeURIComponent(component.name)}")]);`);
                }
            }
            lines.push(`\t\treturn {`);
            lines.push(`\t\t\tacceptsComponents: () => autoguard.api.acceptsComponents(raw.components, components),`);
            lines.push(`\t\t\tacceptsMethod: () => autoguard.api.acceptsMethod(raw.method, method),`);
            lines.push(`\t\t\tvalidateRequest: async () => {`);
            lines.push(`\t\t\t\tlet options = autoguard.api.combineKeyValuePairs(raw.parameters);`);
            for (let component of route.path.components) {
                if (is.present(component.type)) {
                    lines.push(`\t\t\t\toptions["${component.name}"] = autoguard.api.${makeParser(component.type)}(components, "${component.name}");`);
                }
            }
            for (let parameter of route.parameters.parameters) {
                lines.push(`\t\t\t\toptions["${parameter.name}"] = autoguard.api.${makeParser(parameter.type)}(raw.parameters, "${parameter.name}");`);
            }
            lines.push(`\t\t\t\tlet headers = autoguard.api.combineKeyValuePairs(raw.headers);`);
            for (let header of route.request.headers.headers) {
                lines.push(`\t\t\t\theaders["${header.name}"] = autoguard.api.${makeParser(header.type)}(raw.headers, "${header.name}");`);
            }
            if (route.request.payload === types.Binary.INSTANCE) {
                lines.push(`\t\t\t\tlet payload = raw.payload;`);
            }
            else {
                lines.push(`\t\t\t\tlet payload = await autoguard.api.deserializePayload(raw.payload);`);
            }
            lines.push(`\t\t\t\tlet guard = shared.Autoguard.Requests["${tag}"];`);
            lines.push(`\t\t\t\tlet request = guard.as({ options, headers, payload }, "request");`);
            lines.push(`\t\t\t\treturn {`);
            lines.push(`\t\t\t\t\thandleRequest: async () => {`);
            lines.push(`\t\t\t\t\t\tlet response = await routes["${tag}"](new autoguard.api.ClientRequest(request, auxillary));`);
            lines.push(`\t\t\t\t\t\treturn {`);
            lines.push(`\t\t\t\t\t\t\tvalidateResponse: async () => {`);
            lines.push(`\t\t\t\t\t\t\t\tlet guard = shared.Autoguard.Responses["${tag}"];`);
            lines.push(`\t\t\t\t\t\t\t\tguard.as(response, "response");`);
            lines.push(`\t\t\t\t\t\t\t\treturn response;`);
            lines.push(`\t\t\t\t\t\t\t}`);
            lines.push(`\t\t\t\t\t\t};`);
            lines.push(`\t\t\t\t\t}`);
            lines.push(`\t\t\t\t};`);
            lines.push(`\t\t\t}`);
            lines.push(`\t\t};`);
            lines.push(`\t});`);
        }
        lines.push(`\treturn (request, response) => autoguard.api.route(endpoints, request, response, options?.urlPrefix);`);
        lines.push(`};`);
        lines.push(``);
        return lines.join(options.eol);
    }
    generateShared(options) {
        let lines = new Array();
        lines.push(`// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.`);
        lines.push(``);
        lines.push(`import * as autoguard from "@joelek/ts-autoguard";`);
        let imports = this.getImports();
        if (imports.length > 0) {
            for (let entry of imports) {
                lines.push(`import { ${entry.typename} } from "${["..", ...entry.path].join("/")}";`);
            }
        }
        lines.push(``);
        for (let guard of this.guards) {
            lines.push(`export const ${guard.typename} = ${guard.type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol }))};`);
            lines.push(``);
            lines.push(`export type ${guard.typename} = ReturnType<typeof ${guard.typename}["as"]>;`);
            lines.push(``);
        }
        let guards = new Array();
        for (let guard of this.guards) {
            let reference = new types.ReferenceType([], guard.typename);
            guards.push(`\t\t"${guard.typename}": ${reference.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" }))}`);
        }
        lines.push(`export namespace Autoguard {`);
        lines.push(`\texport const Guards = {${guards.length > 0 ? options.eol + guards.join("," + options.eol) + options.eol + "\t" : ""}};`);
        lines.push(``);
        lines.push(`\texport type Guards = { [A in keyof typeof Guards]: ReturnType<typeof Guards[A]["as"]>; };`);
        lines.push(``);
        let requests = new Array();
        for (let route of this.routes) {
            let request = getRequestType(route);
            let tag = makeRouteTag(route);
            requests.push(`\t\t"${tag}": ${request.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" }))}`);
        }
        lines.push(`\texport const Requests = {${requests.length > 0 ? options.eol + requests.join("," + options.eol) + options.eol + "\t" : ""}};`);
        lines.push(``);
        lines.push(`\texport type Requests = { [A in keyof typeof Requests]: ReturnType<typeof Requests[A]["as"]>; };`);
        lines.push(``);
        let responses = new Array();
        for (let route of this.routes) {
            let response = getResponseType(route);
            let tag = makeRouteTag(route);
            responses.push(`\t\t"${tag}": ${response.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" }))}`);
        }
        lines.push(`\texport const Responses = {${responses.length > 0 ? options.eol + responses.join("," + options.eol) + options.eol + "\t" : ""}};`);
        lines.push(``);
        lines.push(`\texport type Responses = { [A in keyof typeof Responses]: ReturnType<typeof Responses[A]["as"]>; };`);
        lines.push(`};`);
        lines.push(``);
        return lines.join(options.eol);
    }
    static parseOld(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            var _a, _b;
            let guards = new Array();
            let routes = new Array();
            tokenization.expect(read(), "{");
            while (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "}") {
                let identifier = tokenization.expect(read(), "IDENTIFIER").value;
                tokenization.expect(read(), ":");
                let type = types.Type.parse(tokenizer);
                guards.push(new guard.Guard(identifier, type));
                if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.family) === ",") {
                    tokenization.expect(read(), ",");
                }
                else {
                    break;
                }
            }
            tokenization.expect(read(), "}");
            if (is.present(peek())) {
                throw `Expected end of stream!`;
            }
            return new Schema(guards, routes);
        });
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            let guards = new Array();
            let routes = new Array();
            while (peek()) {
                try {
                    guards.push(guard.Guard.parse(tokenizer));
                    continue;
                }
                catch (error) { }
                try {
                    routes.push(route.Route.parse(tokenizer));
                    continue;
                }
                catch (error) { }
                return tokenizer.newContext((read, peek) => {
                    let token = read();
                    throw `Unexpected ${token.family} at row ${token.row}, col ${token.col}!`;
                });
            }
            return new Schema(guards, routes);
        });
    }
}
exports.Schema = Schema;
;
