import * as guard from "./guard";
import * as is from "../is";
import * as route from "./route";
import * as shared from "../shared";
import * as tokenization from "../tokenization";
import * as types from "./types";

function makeParser(type: string): string {
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

function areAllMembersOptional(object: types.ObjectType): boolean {
	for (let [key, value] of object.members) {
		if (!value.optional) {
			return false;
		}
	}
	return true;
}

function makeRouteTag(route: route.Route): string {
	let components = route.path.components.map((component) => {
		if (is.present(component.type)) {
			return `/<${component.name}>`;
		} else {
			return `/${component.name}`;
		}
	});
	return `${route.method.method}:${components.join("")}`;
}

function getRequestType(route: route.Route): types.Type {
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

function getResponseType(route: route.Route): types.Type {
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

export class Schema {
	private guards: Array<guard.Guard>;
	private routes: Array<route.Route>;

	private getImports(): Array<shared.Import> {
		let imports = new Map<string, string[]>();
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

	private constructor(guards: Array<guard.Guard>, routes: Array<route.Route>) {
		this.guards = guards;
		this.routes = routes;
	}

	generateSchema(options: shared.Options): string {
		let lines = new Array<string>();
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

	generateClient(options: shared.Options): string {
		let lines = new Array<string>();
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
				} else {
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
			if (route.request.payload === types.Binary.INSTANCE) {
				lines.push(`\t\tlet payload = request.payload;`);
			} else {
				lines.push(`\t\tlet payload = autoguard.api.serializePayload(request.payload);`);
			}
			lines.push(`\t\tlet url = (options?.urlPrefix ?? "");`);
			lines.push(`\t\turl += autoguard.api.serializeComponents(components);`);
			lines.push(`\t\turl += autoguard.api.serializeParameters(parameters);`);
			lines.push(`\t\tlet raw = await autoguard.api.fetch(method, url, headers, payload);`);
			lines.push(`\t\t{`);
			lines.push(`\t\t\tlet status = raw.status;`);
			lines.push(`\t\t\tlet headers: Record<string, autoguard.api.Primitive | undefined> = {};`);
			for (let header of route.response.headers.headers) {
				lines.push(`\t\t\theaders["${header.name}"] = autoguard.api.${makeParser(header.type)}(raw.headers, "${header.name}");`);
			}
			if (route.response.payload === types.Binary.INSTANCE) {
				lines.push(`\t\t\tlet payload = raw.payload;`);
			} else {
				lines.push(`\t\t\tlet payload = await autoguard.api.deserializePayload(raw.payload);`);
			}
			lines.push(`\t\t\tlet guard = shared.Autoguard.Responses["${tag}"];`);
			lines.push(`\t\t\tlet response = guard.as({ status, headers, payload }, "response");`);
			lines.push(`\t\t\treturn response;`);
			lines.push(`\t\t}`);
			lines.push(`\t},`);
		}
		lines.push(`});`);
		lines.push(``);
		return lines.join(options.eol);
	}

	generateServer(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push(`// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.`);
		lines.push(``);
		lines.push(`import * as autoguard from "@joelek/ts-autoguard";`);
		lines.push(`import * as shared from "./index";`);
		lines.push(``);
		lines.push(`export const Server = (routes: shared.Autoguard.Routes, options?: Partial<{}>): autoguard.api.RequestListener => {`);
		lines.push(`\tlet endpoints = new Array<autoguard.api.Endpoint>();`);
		for (let route of this.routes) {
			let tag = makeRouteTag(route);
			lines.push(`\tendpoints.push((raw) => {`);
			lines.push(`\t\tlet method = "${route.method.method}";`);
			lines.push(`\t\tlet components = new Array<[string, string]>();`);
			for (let [index, component] of route.path.components.entries()) {
				if (is.present(component.type)) {
					lines.push(`\t\tcomponents.push(["${component.name}", raw.components[${index}]]);`);
				} else {
					lines.push(`\t\tcomponents.push(["", "${component.name}"]);`);
				}
			}
			lines.push(`\t\treturn {`);
			lines.push(`\t\t\tacceptsComponents: () => autoguard.api.acceptsComponents(raw.components, components),`);
			lines.push(`\t\t\tacceptsMethod: () => autoguard.api.acceptsMethod(raw.method, method),`);
			lines.push(`\t\t\tprepareRequest: async () => {`);
			lines.push(`\t\t\t\tlet options: Record<string, autoguard.api.Primitive | undefined> = {};`);
			for (let component of route.path.components) {
				if (is.present(component.type)) {
					lines.push(`\t\t\t\toptions["${component.name}"] = autoguard.api.${makeParser(component.type)}(components, "${component.name}");`);
				}
			}
			for (let parameter of route.parameters.parameters) {
				lines.push(`\t\t\t\toptions["${parameter.name}"] = autoguard.api.${makeParser(parameter.type)}(raw.parameters, "${parameter.name}");`);
			}
			lines.push(`\t\t\t\tlet headers: Record<string, autoguard.api.Primitive | undefined> = {};`);
			for (let header of route.request.headers.headers) {
				lines.push(`\t\t\t\theaders["${header.name}"] = autoguard.api.${makeParser(header.type)}(raw.parameters, "${header.name}");`);
			}
			if (route.request.payload === types.Binary.INSTANCE) {
				lines.push(`\t\t\t\tlet payload = raw.payload;`);
			} else {
				lines.push(`\t\t\t\tlet payload = await autoguard.api.deserializePayload(raw.payload);`);
			}
			lines.push(`\t\t\t\tlet guard = shared.Autoguard.Requests["${tag}"];`);
			lines.push(`\t\t\t\tlet request = guard.as({ options, headers, payload }, "request");`);
			lines.push(`\t\t\t\treturn {`);
			lines.push(`\t\t\t\t\thandleRequest: async () => {`);
			lines.push(`\t\t\t\t\t\tlet response = await routes["${tag}"](request);`);
			lines.push(`\t\t\t\t\t\tlet guard = shared.Autoguard.Responses["${tag}"];`);
			lines.push(`\t\t\t\t\t\tguard.as(response, "response");`);
			lines.push(`\t\t\t\t\t\treturn response;`);
			lines.push(`\t\t\t\t\t}`);
			lines.push(`\t\t\t\t};`);
			lines.push(`\t\t\t}`);
			lines.push(`\t\t};`);
			lines.push(`\t});`);
		}
		lines.push(`\treturn (request, response) => autoguard.api.route(endpoints, request, response);`);
		lines.push(`};`);
		lines.push(``);
		return lines.join(options.eol);
	}

	generateShared(options: shared.Options): string {
		let lines = new Array<string>();
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
			lines.push(`export type ${guard.typename} = ${guard.type.generateType(options)};`);
			lines.push(``);
			lines.push(`export const ${guard.typename} = ${guard.type.generateTypeGuard({ ...options, eol: options.eol })};`);
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
		lines.push(`\texport type Guards = ${guards.generateType({ ...options, eol: options.eol + "\t" })};`);
		lines.push(``);
		lines.push(`\texport const Guards = ${guards.generateType({ ...options, eol: options.eol + "\t" })};`);
		lines.push(``);
		let request_types = new Array<string>();
		let request_guards = new Array<string>();
		for (let route of this.routes) {
			let request = getRequestType(route);
			let tag = makeRouteTag(route);
			request_types.push(`\t\t"${tag}": ${request.generateType({ ...options, eol: options.eol + "\t\t" })}`);
			request_guards.push(`\t\t"${tag}": ${request.generateTypeGuard({ ...options, eol: options.eol + "\t\t" })}`);
		}
		lines.push(`\texport type Requests = {${request_types.length > 0 ? options.eol + request_types.join("," + options.eol) + options.eol + "\t" : ""}};`);
		lines.push(``);
		lines.push(`\texport const Requests = {${request_guards.length > 0 ? options.eol + request_guards.join("," + options.eol) + options.eol + "\t" : ""}};`);
		lines.push(``);
		let response_types = new Array<string>();
		let response_guards = new Array<string>();
		for (let route of this.routes) {
			let response = getResponseType(route);
			let tag = makeRouteTag(route);
			response_types.push(`\t\t"${tag}": ${response.generateType({ ...options, eol: options.eol + "\t\t" })}`);
			response_guards.push(`\t\t"${tag}": ${response.generateTypeGuard({ ...options, eol: options.eol + "\t\t" })}`);
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

	static parseOld(tokenizer: tokenization.Tokenizer): Schema {
		return tokenizer.newContext((read, peek) => {
			let guards = new Array<guard.Guard>();
			let routes = new Array<route.Route>();
			tokenization.expect(read(), "{");
			while (peek()?.value !== "}") {
				let identifier = tokenization.expect(read(), "IDENTIFIER").value;
				tokenization.expect(read(), ":");
				let type = types.Type.parse(tokenizer);
				guards.push(new guard.Guard(identifier, type));
				if (peek()?.family === ",") {
					tokenization.expect(read(), ",");
				} else {
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

	static parse(tokenizer: tokenization.Tokenizer): Schema {
		return tokenizer.newContext((read, peek) => {
			let guards = new Array<guard.Guard>();
			let routes = new Array<route.Route>();
			while (peek()) {
				try {
					guards.push(guard.Guard.parse(tokenizer));
					continue;
				} catch (error) {}
				try {
					routes.push(route.Route.parse(tokenizer));
					continue;
				} catch (error) {}
				throw `Expected code to be unreachable!`;
			}
			return new Schema(guards, routes);
		});
	}
};
