"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = void 0;
const guard = require("./guard");
const is = require("./is");
const route = require("./route");
const tokenization = require("./tokenization");
const types = require("./types");
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
function getRequestType(route) {
    let request = new types.ObjectType();
    let options = new types.ObjectType();
    for (let component of route.path.components) {
        if (is.present(component.type)) {
            if (component.quantifier.kind === "required") {
                options.add(component.name, {
                    type: component.type,
                    optional: false
                });
            }
            if (component.quantifier.kind === "repeated") {
                options.add(component.name, {
                    type: new types.ArrayType(component.type),
                    optional: true
                });
            }
            if (component.quantifier.kind === "optional") {
                options.add(component.name, {
                    type: component.type,
                    optional: true
                });
            }
        }
    }
    for (let parameter of route.parameters.parameters) {
        if (parameter.quantifier.kind === "required") {
            options.add(parameter.name, {
                type: parameter.type,
                optional: false
            });
        }
        if (parameter.quantifier.kind === "repeated") {
            options.add(parameter.name, {
                type: new types.ArrayType(parameter.type),
                optional: true
            });
        }
        if (parameter.quantifier.kind === "optional") {
            options.add(parameter.name, {
                type: parameter.type,
                optional: true
            });
        }
    }
    request.add("options", {
        type: new types.IntersectionType([
            options,
            types.Options.INSTANCE
        ]),
        optional: areAllMembersOptional(options)
    });
    let headers = new types.ObjectType();
    for (let header of route.request.headers.headers) {
        if (header.quantifier.kind === "required") {
            headers.add(header.name, {
                type: header.type,
                optional: false
            });
        }
        if (header.quantifier.kind === "repeated") {
            headers.add(header.name, {
                type: new types.ArrayType(header.type),
                optional: true
            });
        }
        if (header.quantifier.kind === "optional") {
            headers.add(header.name, {
                type: header.type,
                optional: true
            });
        }
    }
    request.add("headers", {
        type: new types.IntersectionType([
            headers,
            types.Headers.INSTANCE
        ]),
        optional: areAllMembersOptional(headers)
    });
    let payload = route.request.payload;
    request.add("payload", {
        type: payload,
        optional: payload === types.UndefinedType.INSTANCE || payload === types.Binary.INSTANCE
    });
    return request;
}
function getResponseType(route) {
    let response = new types.ObjectType();
    let headers = new types.ObjectType();
    for (let header of route.response.headers.headers) {
        if (header.quantifier.kind === "required") {
            headers.add(header.name, {
                type: header.type,
                optional: false
            });
        }
        if (header.quantifier.kind === "repeated") {
            headers.add(header.name, {
                type: new types.ArrayType(header.type),
                optional: true
            });
        }
        if (header.quantifier.kind === "optional") {
            headers.add(header.name, {
                type: header.type,
                optional: true
            });
        }
    }
    response.add("status", {
        type: types.NumberType.INSTANCE,
        optional: true
    });
    response.add("headers", {
        type: new types.IntersectionType([
            headers,
            types.Headers.INSTANCE
        ]),
        optional: areAllMembersOptional(headers)
    });
    let payload = route.response.payload;
    response.add("payload", {
        type: payload,
        optional: payload === types.UndefinedType.INSTANCE || payload === types.Binary.INSTANCE
    });
    return response;
}
function getContentTypeFromType(payload) {
    if (payload instanceof types.Binary) {
        return "application/octet-stream";
    }
    if (payload instanceof types.UndefinedType) {
        return "application/octet-stream";
    }
    return "application/json; charset=utf-8";
}
function generateClientRoute(route, options) {
    let lines = new Array();
    let tag = makeRouteTag(route);
    lines.push(`async (request) => {`);
    lines.push(`\tlet guard = shared.Autoguard.Requests["${tag}"];`);
    lines.push(`\tguard.as(request, "request");`);
    lines.push(`\tlet method = "${route.method.method}";`);
    lines.push(`\tlet components = new Array<string>();`);
    for (let component of route.path.components) {
        if (is.absent(component.type)) {
            lines.push(`\tcomponents.push("${encodeURIComponent(component.name)}");`);
        }
        else {
            let plain = component.type === types.PlainType.INSTANCE;
            if (component.quantifier.kind === "repeated") {
                lines.push(`\tcomponents.push(...autoguard.api.encodeComponents(request.options?.["${component.name}"] ?? [], ${plain}));`);
            }
            else {
                lines.push(`\tcomponents.push(...autoguard.api.encodeComponents([request.options?.["${component.name}"]], ${plain}));`);
            }
        }
    }
    let exclude = new Array();
    for (let component of route.path.components) {
        if (is.present(component.type)) {
            exclude.push(`"${component.name}"`);
        }
    }
    lines.push(`\tlet parameters = new Array<[string, string]>();`);
    for (let parameter of route.parameters.parameters) {
        let plain = parameter.type === types.PlainType.INSTANCE;
        if (parameter.quantifier.kind === "repeated") {
            lines.push(`\tparameters.push(...autoguard.api.encodeParameterPairs("${parameter.name}", request.options?.["${parameter.name}"] ?? [], ${plain}));`);
        }
        else {
            lines.push(`\tparameters.push(...autoguard.api.encodeParameterPairs("${parameter.name}", [request.options?.["${parameter.name}"]], ${plain}));`);
        }
    }
    lines.push(`\tparameters.push(...autoguard.api.encodeUndeclaredParameterPairs(request.options ?? {}, [...[${exclude.join(",")}], ...parameters.map((parameter) => parameter[0])]));`);
    lines.push(`\tlet headers = new Array<[string, string]>();`);
    for (let header of route.request.headers.headers) {
        let plain = header.type === types.PlainType.INSTANCE;
        if (header.quantifier.kind === "repeated") {
            lines.push(`\theaders.push(...autoguard.api.encodeHeaderPairs("${header.name}", request.headers?.["${header.name}"] ?? [], ${plain}));`);
        }
        else {
            lines.push(`\theaders.push(...autoguard.api.encodeHeaderPairs("${header.name}", [request.headers?.["${header.name}"]], ${plain}));`);
        }
    }
    lines.push(`\theaders.push(...autoguard.api.encodeUndeclaredHeaderPairs(request.headers ?? {}, headers.map((header) => header[0])));`);
    if (route.request.payload === types.Binary.INSTANCE) {
        lines.push(`\tlet payload = request.payload ?? [];`);
    }
    else {
        lines.push(`\tlet payload = autoguard.api.serializePayload(request.payload);`);
    }
    lines.push(`\tlet requestHandler = clientOptions?.requestHandler ?? autoguard.api.xhr;`);
    lines.push(`\tlet defaultHeaders = clientOptions?.defaultHeaders?.slice() ?? [];`);
    lines.push(`\tdefaultHeaders.push(["Content-Type", "${getContentTypeFromType(route.request.payload)}"]);`);
    lines.push(`\tdefaultHeaders.push(["Accept", "${getContentTypeFromType(route.response.payload)}"]);`);
    lines.push(`\tlet raw = await requestHandler(autoguard.api.finalizeRequest({ method, components, parameters, headers, payload }, defaultHeaders), clientOptions?.urlPrefix);`);
    lines.push(`\t{`);
    lines.push(`\t\tlet status = raw.status;`);
    lines.push(`\t\tlet headers: Record<string, autoguard.api.JSON> = {};`);
    for (let header of route.response.headers.headers) {
        let plain = header.type === types.PlainType.INSTANCE;
        if (header.quantifier.kind === "repeated") {
            lines.push(`\t\theaders["${header.name}"] = autoguard.api.decodeHeaderValues(raw.headers, "${header.name}", ${plain});`);
        }
        else {
            lines.push(`\t\theaders["${header.name}"] = autoguard.api.decodeHeaderValue(raw.headers, "${header.name}", ${plain});`);
        }
    }
    lines.push(`\t\theaders = { ...headers, ...autoguard.api.decodeUndeclaredHeaders(raw.headers ?? {}, Object.keys(headers)) };`);
    if (route.response.payload === types.Binary.INSTANCE) {
        lines.push(`\t\tlet payload = raw.payload;`);
    }
    else {
        lines.push(`\t\tlet payload = await autoguard.api.deserializePayload(raw.payload);`);
    }
    lines.push(`\t\tlet guard = shared.Autoguard.Responses["${tag}"];`);
    lines.push(`\t\tlet response = guard.as({ status, headers, payload }, "response");`);
    let collect = route.response.payload === types.Binary.INSTANCE;
    lines.push(`\t\treturn new autoguard.api.ServerResponse(response, ${collect});`);
    lines.push(`\t}`);
    lines.push(`}`);
    return lines.join(options.eol);
}
function generateServerRoute(route, options) {
    let lines = new Array();
    let tag = makeRouteTag(route);
    lines.push(`(raw, auxillary) => {`);
    lines.push(`\tlet method = "${route.method.method}";`);
    lines.push(`\tlet matchers = new Array<autoguard.api.RouteMatcher>();`);
    for (let component of route.path.components) {
        if (is.present(component.type)) {
            let { min, max } = component.quantifier.getMinMax();
            let plain = component.type === types.PlainType.INSTANCE;
            lines.push(`\tmatchers.push(new autoguard.api.DynamicRouteMatcher(${min}, ${max}, ${plain}, ${component.type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" }))}));`);
        }
        else {
            lines.push(`\tmatchers.push(new autoguard.api.StaticRouteMatcher(decodeURIComponent("${encodeURIComponent(component.name)}")));`);
        }
    }
    lines.push(`\treturn {`);
    lines.push(`\t\tacceptsComponents: () => autoguard.api.acceptsComponents(raw.components, matchers),`);
    lines.push(`\t\tacceptsMethod: () => autoguard.api.acceptsMethod(raw.method, method),`);
    lines.push(`\t\tvalidateRequest: async () => {`);
    lines.push(`\t\t\tlet options: Record<string, autoguard.api.JSON> = {};`);
    for (let [index, component] of route.path.components.entries()) {
        if (is.present(component.type)) {
            lines.push(`\t\t\toptions["${component.name}"] = matchers[${index}].getValue();`);
        }
    }
    for (let parameter of route.parameters.parameters) {
        let plain = parameter.type === types.PlainType.INSTANCE;
        if (parameter.quantifier.kind === "repeated") {
            lines.push(`\t\t\toptions["${parameter.name}"] = autoguard.api.decodeParameterValues(raw.parameters, "${parameter.name}", ${plain});`);
        }
        else {
            lines.push(`\t\t\toptions["${parameter.name}"] = autoguard.api.decodeParameterValue(raw.parameters, "${parameter.name}", ${plain});`);
        }
    }
    lines.push(`\t\t\toptions = { ...options, ...autoguard.api.decodeUndeclaredParameters(raw.parameters ?? {}, Object.keys(options)) };`);
    lines.push(`\t\t\tlet headers: Record<string, autoguard.api.JSON> = {};`);
    for (let header of route.request.headers.headers) {
        let plain = header.type === types.PlainType.INSTANCE;
        if (header.quantifier.kind === "repeated") {
            lines.push(`\t\t\theaders["${header.name}"] = autoguard.api.decodeHeaderValues(raw.headers, "${header.name}", ${plain});`);
        }
        else {
            lines.push(`\t\t\theaders["${header.name}"] = autoguard.api.decodeHeaderValue(raw.headers, "${header.name}", ${plain});`);
        }
    }
    lines.push(`\t\t\theaders = { ...headers, ...autoguard.api.decodeUndeclaredHeaders(raw.headers ?? {}, Object.keys(headers)) };`);
    if (route.request.payload === types.Binary.INSTANCE) {
        lines.push(`\t\t\tlet payload = raw.payload;`);
    }
    else {
        lines.push(`\t\t\tlet payload = await autoguard.api.deserializePayload(raw.payload);`);
    }
    lines.push(`\t\t\tlet guard = shared.Autoguard.Requests["${tag}"];`);
    lines.push(`\t\t\tlet request = guard.as({ options, headers, payload }, "request");`);
    lines.push(`\t\t\treturn {`);
    lines.push(`\t\t\t\thandleRequest: async () => {`);
    let collect = route.request.payload === types.Binary.INSTANCE;
    lines.push(`\t\t\t\t\tlet response = await routes["${tag}"](new autoguard.api.ClientRequest(request, ${collect}, auxillary));`);
    lines.push(`\t\t\t\t\treturn {`);
    lines.push(`\t\t\t\t\t\tvalidateResponse: async () => {`);
    lines.push(`\t\t\t\t\t\t\tlet guard = shared.Autoguard.Responses["${tag}"];`);
    lines.push(`\t\t\t\t\t\t\tguard.as(response, "response");`);
    lines.push(`\t\t\t\t\t\t\tlet status = response.status ?? 200;`);
    lines.push(`\t\t\t\t\t\t\tlet headers = new Array<[string, string]>();`);
    for (let header of route.response.headers.headers) {
        let plain = header.type === types.PlainType.INSTANCE;
        if (header.quantifier.kind === "repeated") {
            lines.push(`\t\t\t\t\t\t\theaders.push(...autoguard.api.encodeHeaderPairs("${header.name}", response.headers?.["${header.name}"] ?? [], ${plain}));`);
        }
        else {
            lines.push(`\t\t\t\t\t\t\theaders.push(...autoguard.api.encodeHeaderPairs("${header.name}", [response.headers?.["${header.name}"]], ${plain}));`);
        }
    }
    lines.push(`\t\t\t\t\t\t\theaders.push(...autoguard.api.encodeUndeclaredHeaderPairs(response.headers ?? {}, headers.map((header) => header[0])));`);
    if (route.response.payload === types.Binary.INSTANCE) {
        lines.push(`\t\t\t\t\t\t\tlet payload = response.payload ?? [];`);
    }
    else {
        lines.push(`\t\t\t\t\t\t\tlet payload = autoguard.api.serializePayload(response.payload);`);
    }
    lines.push(`\t\t\t\t\t\t\tlet defaultHeaders = serverOptions?.defaultHeaders?.slice() ?? [];`);
    lines.push(`\t\t\t\t\t\t\tdefaultHeaders.push(["Content-Type", "${getContentTypeFromType(route.response.payload)}"]);`);
    lines.push(`\t\t\t\t\t\t\treturn autoguard.api.finalizeResponse({ status, headers, payload }, defaultHeaders);`);
    lines.push(`\t\t\t\t\t\t}`);
    lines.push(`\t\t\t\t\t};`);
    lines.push(`\t\t\t\t}`);
    lines.push(`\t\t\t};`);
    lines.push(`\t\t}`);
    lines.push(`\t};`);
    lines.push(`}`);
    return lines.join(options.eol);
}
class Schema {
    constructor(guards, routes) {
        this.guards = guards;
        this.routes = routes;
    }
    getClientImports() {
        let imports = new Map();
        return Array.from(imports.entries())
            .sort((one, two) => one[0].localeCompare(two[0]))
            .map((entry) => ({
            path: entry[1],
            typename: entry[0]
        }))
            .map((entry) => (Object.assign(Object.assign({}, entry), { path: entry.path.length === 0 ? [".", "index"] : ["..", ...entry.path] })));
    }
    getServerImports() {
        let imports = new Map();
        for (let route of this.routes) {
            for (let component of route.path.components) {
                let type = component.type;
                if (is.present(type)) {
                    for (let reference of type.getReferences()) {
                        imports.set(reference.typename, reference.path);
                    }
                }
            }
            for (let parameter of route.parameters.parameters) {
                let type = parameter.type;
                for (let reference of type.getReferences()) {
                    imports.set(reference.typename, reference.path);
                }
            }
        }
        return Array.from(imports.entries())
            .sort((one, two) => one[0].localeCompare(two[0]))
            .map((entry) => ({
            path: entry[1],
            typename: entry[0]
        }))
            .map((entry) => (Object.assign(Object.assign({}, entry), { path: entry.path.length === 0 ? [".", "index"] : ["..", ...entry.path] })));
    }
    getSharedImports() {
        let imports = new Map();
        for (let guard of this.guards) {
            let references = guard.type.getReferences();
            for (let reference of references) {
                imports.set(reference.typename, reference.path);
            }
        }
        for (let route of this.routes) {
            let request = route.request.payload;
            if (is.present(request)) {
                let references = request.getReferences();
                for (let reference of references) {
                    imports.set(reference.typename, reference.path);
                }
            }
            let response = route.response.payload;
            if (is.present(response)) {
                let references = response.getReferences();
                for (let reference of references) {
                    imports.set(reference.typename, reference.path);
                }
            }
        }
        return Array.from(imports.entries())
            .sort((one, two) => one[0].localeCompare(two[0]))
            .map((entry) => ({
            path: entry[1],
            typename: entry[0]
        }))
            .filter((entry) => entry.path.length > 0)
            .map((entry) => (Object.assign(Object.assign({}, entry), { path: ["..", ...entry.path] })));
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
        lines.push(`import * as autoguard from "@joelek/ts-autoguard/dist/lib-client";`);
        lines.push(`import * as shared from "./index";`);
        for (let entry of this.getClientImports()) {
            lines.push(`import { ${entry.typename} } from "${entry.path.join("/")}";`);
        }
        lines.push(``);
        lines.push(`export const makeClient = (clientOptions?: autoguard.api.MakeClientOptions): autoguard.api.Client<shared.Autoguard.Requests, shared.Autoguard.Responses> => ({`);
        for (let route of this.routes) {
            let tag = makeRouteTag(route);
            lines.push(`\t"${tag}": ${generateClientRoute(route, Object.assign(Object.assign({}, options), { eol: options.eol + "\t" }))},`);
        }
        lines.push(`});`);
        lines.push(``);
        return lines.join(options.eol);
    }
    generateServer(options) {
        let lines = new Array();
        lines.push(`// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.`);
        lines.push(``);
        lines.push(`import * as autoguard from "@joelek/ts-autoguard/dist/lib-server";`);
        lines.push(`import * as shared from "./index";`);
        for (let entry of this.getServerImports()) {
            lines.push(`import { ${entry.typename} } from "${entry.path.join("/")}";`);
        }
        lines.push(``);
        lines.push(`export const makeServer = (routes: autoguard.api.Server<shared.Autoguard.Requests, shared.Autoguard.Responses>, serverOptions?: autoguard.api.MakeServerOptions): autoguard.api.RequestListener => {`);
        lines.push(`\tlet endpoints = new Array<autoguard.api.Endpoint>();`);
        for (let route of this.routes) {
            lines.push(`\tendpoints.push(${generateServerRoute(route, Object.assign(Object.assign({}, options), { eol: options.eol + "\t" }))});`);
        }
        lines.push(`\treturn (request, response) => autoguard.api.route(endpoints, request, response, serverOptions);`);
        lines.push(`};`);
        lines.push(``);
        return lines.join(options.eol);
    }
    generateShared(options) {
        let lines = new Array();
        lines.push(`// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.`);
        lines.push(``);
        lines.push(`import * as autoguard from "@joelek/ts-autoguard/dist/lib-shared";`);
        for (let entry of this.getSharedImports()) {
            lines.push(`import { ${entry.typename} } from "${entry.path.join("/")}";`);
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
            let token = peek();
            if (is.present(token)) {
                throw new tokenization.SyntaxError(token);
            }
            return new Schema(guards, routes);
        });
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            let guards = new Array();
            let routes = new Array();
            let errors = new Array();
            while (peek()) {
                try {
                    guards.push(guard.Guard.parse(tokenizer));
                    continue;
                }
                catch (error) {
                    errors.push(error);
                }
                try {
                    routes.push(route.Route.parse(tokenizer));
                    continue;
                }
                catch (error) {
                    errors.push(error);
                }
                throw tokenization.SyntaxError.getError(tokenizer, errors);
            }
            return new Schema(guards, routes);
        });
    }
}
exports.Schema = Schema;
;
