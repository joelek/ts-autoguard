"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = void 0;
const guard = require("./guard");
const is = require("../is");
const route = require("./route");
const tokenization = require("../tokenization");
const types = require("./types");
function makeParser(type, optional) {
    if (optional) {
        if (type === "boolean") {
            return "getOptionalBoolean";
        }
        if (type === "number") {
            return "getOptionalNumber";
        }
        if (type === "string") {
            return "getOptionalString";
        }
    }
    else {
        if (type === "boolean") {
            return "getRequiredBoolean";
        }
        if (type === "number") {
            return "getRequiredNumber";
        }
        if (type === "string") {
            return "getRequiredString";
        }
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
    let components = route.path.components.map((component) => {
        if (is.present(component.type)) {
            return `/<${component.name}>`;
        }
        else {
            return `/${component.name}`;
        }
    });
    return `${route.method.method}:${components.join("")}`;
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
        type: options,
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
        type: headers,
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
        type: headers,
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
        lines.push(`export const Client = (options?: Partial<{ urlPrefix: string }>): shared.Autoguard.Routes => ({`);
        for (let route of this.routes) {
            let tag = makeRouteTag(route);
            lines.push(`\t"${tag}": async (request) => {`);
            lines.push(`\t\tlet guard = shared.Autoguard.Requests["${tag}"];`);
            lines.push(`\t\tguard.as(request, "request");`);
            lines.push(`\t\tlet method = "${route.method.method}";`);
            lines.push(`\t\tlet components = new Array<string>();`);
            for (let component of route.path.components) {
                if (is.absent(component.type)) {
                    lines.push(`\t\tcomponents.push("${component.name}");`);
                }
                else {
                    lines.push(`\t\tcomponents.push(String(request.options["${component.name}"]));`);
                }
            }
            lines.push(`\t\tlet parameters = new Array<[string, string]>();`);
            for (let parameter of route.parameters.parameters) {
                lines.push("\t\t" + `if (request.options?.["${parameter.name}"] !== undefined) {`);
                lines.push("\t\t\t" + `parameters.push(["${parameter.name}", String(request.options?.["${parameter.name}"])]);`);
                lines.push("\t\t" + `}`);
            }
            lines.push(`\t\tlet headers = new Array<[string, string]>();`);
            for (let header of route.request.headers.headers) {
                lines.push("\t\t" + `if (request.headers?.["${header.name}"] !== undefined) {`);
                lines.push("\t\t\t" + `headers.push(["${header.name}", String(request.headers?.["${header.name}"])]);`);
                lines.push("\t\t" + `}`);
            }
            lines.push(`\t\tlet payload = JSON.stringify(request.payload) as string | undefined;`);
            lines.push(`\t\tlet url = (options?.urlPrefix ?? "");`);
            lines.push(`\t\turl += autoguard.api.serializeComponents(components);`);
            lines.push(`\t\turl += autoguard.api.serializeParameters(parameters);`);
            lines.push(`\t\tlet response = await autoguard.api.fetch(method, url, headers, payload);`);
            lines.push(`\t\t{`);
            lines.push(`\t\t\tlet status = response.status;`);
            lines.push(`\t\t\tlet headers = {`);
            for (let header of route.response.headers.headers) {
                lines.push(`\t\t\t\t"${header.name}": autoguard.api.${makeParser(header.type, header.optional)}(response.headers, "${header.name}"),`);
            }
            lines.push(`\t\t\t};`);
            lines.push(`\t\t\tlet payload = response.payload !== undefined ? JSON.parse(response.payload) : undefined;`);
            lines.push(`\t\t\tlet guard = shared.Autoguard.Responses["${tag}"];`);
            lines.push(`\t\t\treturn guard.as({ status, headers, payload });`);
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
        lines.push(`export const Server = (routes: shared.Autoguard.Routes, options?: Partial<{}>): autoguard.api.RequestListener => {`);
        lines.push(`\tlet endpoints = new Array<autoguard.api.Endpoint>();`);
        for (let route of this.routes) {
            let tag = makeRouteTag(route);
            lines.push(`\tendpoints.push(async (request) => {`);
            lines.push(`\t\tlet components = new Array<[string, string]>();`);
            for (let [index, component] of route.path.components.entries()) {
                lines.push(`\t\tcomponents.push(["${is.present(component.type) ? component.name : ""}", request.components[${index}]]);`);
            }
            lines.push(`\t\tif (!autoguard.api.checkComponents(request.components, components)) {`);
            lines.push(`\t\t\treturn { status: 404, headers: [] };`);
            lines.push(`\t\t}`);
            lines.push(`\t\tif (request.method !== "${route.method.method}") {`);
            lines.push(`\t\t\treturn { status: 405, headers: [] };`);
            lines.push(`\t\t}`);
            lines.push(`\t\ttry {`);
            lines.push(`\t\t\tlet options = {`);
            for (let component of route.path.components) {
                if (is.present(component.type)) {
                    lines.push(`\t\t\t\t"${component.name}": autoguard.api.${makeParser(component.type, false)}(components, "${component.name}"),`);
                }
            }
            for (let parameter of route.parameters.parameters) {
                lines.push(`\t\t\t\t"${parameter.name}": autoguard.api.${makeParser(parameter.type, parameter.optional)}(request.parameters, "${parameter.name}"),`);
            }
            lines.push(`\t\t\t};`);
            lines.push(`\t\t\tlet headers = {`);
            for (let header of route.request.headers.headers) {
                lines.push(`\t\t\t\t"${header.name}": autoguard.api.${makeParser(header.type, header.optional)}(request.parameters, "${header.name}"),`);
            }
            lines.push(`\t\t\t};`);
            lines.push(`\t\t\tlet guard = ${route.request.payload.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t\t" }))};`);
            lines.push(`\t\t\tlet json = request.payload !== undefined ? JSON.parse(request.payload) : undefined;`);
            lines.push(`\t\t\tlet payload = guard.as(json);`);
            lines.push(`\t\t\ttry {`);
            lines.push(`\t\t\t\tlet response = await routes["${tag}"]({ options, headers, payload });`);
            lines.push(`\t\t\t\tlet guard = shared.Autoguard.Responses["${tag}"];`);
            lines.push(`\t\t\t\tguard.as(response, "response");`);
            lines.push(`\t\t\t\treturn autoguard.api.transformResponse(response);`);
            lines.push(`\t\t\t} catch (error) {`);
            lines.push(`\t\t\t\treturn { status: 500, headers: [] };`);
            lines.push(`\t\t\t}`);
            lines.push(`\t\t} catch (error) {`);
            lines.push(`\t\t\treturn { status: 400, headers: [] };`);
            lines.push(`\t\t}`);
            lines.push(`\t});`);
        }
        lines.push(`\treturn (request, response) => autoguard.api.route(endpoints, request, response);`);
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
                lines.push(`import { ${entry.typename} } from "${["..", ...entry.path, "shared"].join("/")}";`);
            }
        }
        lines.push(``);
        for (let guard of this.guards) {
            lines.push(`export type ${guard.typename} = ${guard.type.generateType(options)};`);
            lines.push(``);
            lines.push(`export const ${guard.typename} = ${guard.type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol }))};`);
            lines.push(``);
        }
        let guards = new types.ObjectType();
        for (let guard of this.guards) {
            guards.add(guard.typename, {
                type: new types.ReferenceType([], guard.typename),
                optional: false
            });
        }
        lines.push(`export namespace Autoguard {`);
        lines.push(`\texport type Guards = ${guards.generateType(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" }))};`);
        lines.push(``);
        lines.push(`\texport const Guards = ${guards.generateType(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" }))};`);
        lines.push(``);
        let request_types = new Array();
        let request_guards = new Array();
        for (let route of this.routes) {
            let request = getRequestType(route);
            let tag = makeRouteTag(route);
            request_types.push(`\t\t"${tag}": ${request.generateType(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" }))}`);
            request_guards.push(`\t\t"${tag}": ${request.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" }))}`);
        }
        lines.push(`\texport type Requests = {${request_types.length > 0 ? options.eol + request_types.join("," + options.eol) + options.eol + "\t" : ""}};`);
        lines.push(``);
        lines.push(`\texport const Requests = {${request_guards.length > 0 ? options.eol + request_guards.join("," + options.eol) + options.eol + "\t" : ""}};`);
        lines.push(``);
        let response_types = new Array();
        let response_guards = new Array();
        for (let route of this.routes) {
            let response = getResponseType(route);
            let tag = makeRouteTag(route);
            response_types.push(`\t\t"${tag}": ${response.generateType(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" }))}`);
            response_guards.push(`\t\t"${tag}": ${response.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" }))}`);
        }
        lines.push(`\texport type Responses = {${response_types.length > 0 ? options.eol + response_types.join("," + options.eol) + options.eol + "\t" : ""}};`);
        lines.push(``);
        lines.push(`\texport const Responses = {${response_guards.length > 0 ? options.eol + response_guards.join("," + options.eol) + options.eol + "\t" : ""}};`);
        lines.push(``);
        lines.push(`\texport type Routes = {`);
        for (let route of this.routes) {
            let tag = makeRouteTag(route);
            lines.push(`\t\t"${tag}": (request: Requests["${tag}"]) => Promise<Responses["${tag}"]>;`);
        }
        lines.push(`\t};`);
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
                throw `Expected code to be unreachable!`;
            }
            return new Schema(guards, routes);
        });
    }
}
exports.Schema = Schema;
;
