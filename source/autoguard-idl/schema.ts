import * as guard from "./guard";
import * as is from "./is";
import * as route from "./route";
import * as shared from "./shared";
import * as tokenization from "./tokenization";
import * as types from "./types";

function areAllMembersOptional(object: types.ObjectType): boolean {
	for (let [key, value] of object.members) {
		if (!value.optional) {
			return false;
		}
	}
	return true;
}

function makeRouteTag(route: route.Route): string {
	if (route.alias.identifier !== "") {
		return route.alias.identifier;
	}
	let components = route.path.components.map((component) => {
		if (is.present(component.type)) {
			return `/<${component.name}>`;
		} else {
			return `/${encodeURIComponent(component.name)}`;
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
				type: (component.quantifier.kind === "repeated") ? new types.ArrayType(component.type) : component.type,
				optional: false
			});
		}
	}
	for (let parameter of route.parameters.parameters) {
		options.add(parameter.name, {
			type: parameter.type,
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
			type: header.type,
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

function getResponseType(route: route.Route): types.Type {
	let response = new types.ObjectType();
	let headers = new types.ObjectType();
	for (let header of route.response.headers.headers) {
		headers.add(header.name, {
			type: header.type,
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

function getDefaultContentType(payload: types.Type | types.Binary): string {
	if (payload instanceof types.Binary) {
		return "application/octet-stream";
	}
	if (payload instanceof types.UndefinedType) {
		return "application/octet-stream";
	}
	return "application/json; charset=utf-8";
}

function generateClientRoute(route: route.Route, options: shared.Options): string {
	let lines = new Array<string>();
	let tag = makeRouteTag(route);
	lines.push(`async (request) => {`);
	lines.push(`\tlet guard = shared.Autoguard.Requests["${tag}"];`);
	lines.push(`\tguard.as(request, "request");`);
	lines.push(`\tlet method = "${route.method.method}";`);
	lines.push(`\tlet components = new Array<string>();`);
	for (let component of route.path.components) {
		if (is.absent(component.type)) {
			lines.push(`\tcomponents.push(decodeURIComponent("${encodeURIComponent(component.name)}"));`);
		} else {
			let plain = component.type === types.PlainType.INSTANCE;
			if (component.quantifier.kind === "repeated") {
				lines.push(`\tcomponents.push(...autoguard.api.serializeValues(request.options["${component.name}"], ${plain}));`);
			} else {
				lines.push(`\tcomponents.push(autoguard.api.serializeValue(request.options["${component.name}"], ${plain}) ?? "");`);
			}
		}
	}
	let exclude = new Array<string>();
	for (let component of route.path.components) {
		if (is.present(component.type)) {
			exclude.push(`"${component.name}"`);
		}
	}
	lines.push(`\tlet parameters = new Array<[string, string]>();`);
	for (let parameter of route.parameters.parameters) {
		let plain = parameter.type === types.PlainType.INSTANCE;
		lines.push(`\tautoguard.api.appendKeyValuePair(parameters, "${parameter.name}", request.options?.["${parameter.name}"], ${plain});`);
	}
	lines.push(`\tparameters.push(...autoguard.api.extractKeyValuePairs(request.options ?? {}, [...[${exclude.join(",")}], ...parameters.map((parameter) => parameter[0])]));`);
	lines.push(`\tlet headers = new Array<[string, string]>();`);
	for (let header of route.request.headers.headers) {
		let plain = header.type === types.PlainType.INSTANCE;
		lines.push(`\tautoguard.api.appendKeyValuePair(headers, "${header.name}", request.headers?.["${header.name}"], ${plain});`);
	}
	lines.push(`\theaders.push(...autoguard.api.extractKeyValuePairs(request.headers ?? {}, headers.map((header) => header[0])));`);
	if (route.request.payload === types.Binary.INSTANCE) {
		lines.push(`\tlet payload = request.payload;`);
	} else {
		lines.push(`\tlet payload = autoguard.api.serializePayload(request.payload);`);
	}
	lines.push(`\tlet requestHandler = options?.requestHandler ?? autoguard.api.xhr;`);
	lines.push(`\tlet raw = await requestHandler({ method, components, parameters, headers, payload }, options?.urlPrefix);`);
	lines.push(`\t{`);
	lines.push(`\t\tlet status = raw.status;`);
	lines.push(`\t\tlet headers = autoguard.api.combineKeyValuePairs(raw.headers);`);
	for (let header of route.response.headers.headers) {
		let plain = header.type === types.PlainType.INSTANCE;
		lines.push(`\t\theaders["${header.name}"] = autoguard.api.getValue(raw.headers, "${header.name}", ${plain});`);
	}
	if (route.response.payload === types.Binary.INSTANCE) {
		lines.push(`\t\tlet payload = raw.payload;`);
	} else {
		lines.push(`\t\tlet payload = await autoguard.api.deserializePayload(raw.payload);`);
	}
	lines.push(`\t\tlet guard = shared.Autoguard.Responses["${tag}"];`);
	lines.push(`\t\tlet response = guard.as({ status, headers, payload }, "response");`);
	lines.push(`\t\treturn new autoguard.api.ServerResponse(response);`);
	lines.push(`\t}`);
	lines.push(`}`);
	return lines.join(options.eol);
}

function generateServerRoute(route: route.Route, options: shared.Options): string {
	let lines = new Array<string>();
	let tag = makeRouteTag(route);
	lines.push(`(raw, auxillary) => {`);
	lines.push(`\tlet method = "${route.method.method}";`);
	lines.push(`\tlet matchers = new Array<autoguard.api.RouteMatcher>();`);
	for (let component of route.path.components) {
		if (is.present(component.type)) {
			let min = component.quantifier.kind === "repeated" ? 1 : 1;
			let max = component.quantifier.kind === "repeated" ? Infinity : 1;
			let plain = component.type === types.PlainType.INSTANCE;
			lines.push(`\tmatchers.push(new autoguard.api.DynamicRouteMatcher(${min}, ${max}, ${plain}, ${component.type.generateTypeGuard({ ...options, eol: options.eol + "\t" })}));`);
		} else {
			lines.push(`\tmatchers.push(new autoguard.api.StaticRouteMatcher(decodeURIComponent("${encodeURIComponent(component.name)}")));`);
		}
	}
	lines.push(`\treturn {`);
	lines.push(`\t\tacceptsComponents: () => autoguard.api.acceptsComponents(raw.components, matchers),`);
	lines.push(`\t\tacceptsMethod: () => autoguard.api.acceptsMethod(raw.method, method),`);
	lines.push(`\t\tvalidateRequest: async () => {`);
	lines.push(`\t\t\tlet options = autoguard.api.combineKeyValuePairs(raw.parameters);`);
	for (let [index, component] of route.path.components.entries()) {
		if (is.present(component.type)) {
			lines.push(`\t\t\toptions["${component.name}"] = matchers[${index}].getValue();`);
		}
	}
	for (let parameter of route.parameters.parameters) {
		let plain = parameter.type === types.PlainType.INSTANCE;
		lines.push(`\t\t\toptions["${parameter.name}"] = autoguard.api.getValue(raw.parameters, "${parameter.name}", ${plain});`);
	}
	lines.push(`\t\t\tlet headers = autoguard.api.combineKeyValuePairs(raw.headers);`);
	for (let header of route.request.headers.headers) {
		let plain = header.type === types.PlainType.INSTANCE;
		lines.push(`\t\t\theaders["${header.name}"] = autoguard.api.getValue(raw.headers, "${header.name}", ${plain});`);
	}
	if (route.request.payload === types.Binary.INSTANCE) {
		lines.push(`\t\t\tlet payload = raw.payload;`);
	} else {
		lines.push(`\t\t\tlet payload = await autoguard.api.deserializePayload(raw.payload);`);
	}
	lines.push(`\t\t\tlet guard = shared.Autoguard.Requests["${tag}"];`);
	lines.push(`\t\t\tlet request = guard.as({ options, headers, payload }, "request");`);
	lines.push(`\t\t\treturn {`);
	lines.push(`\t\t\t\thandleRequest: async () => {`);
	lines.push(`\t\t\t\t\tlet response = await routes["${tag}"](new autoguard.api.ClientRequest(request, auxillary));`);
	lines.push(`\t\t\t\t\treturn {`);
	lines.push(`\t\t\t\t\t\tvalidateResponse: async () => {`);
	lines.push(`\t\t\t\t\t\t\tlet guard = shared.Autoguard.Responses["${tag}"];`);
	lines.push(`\t\t\t\t\t\t\tguard.as(response, "response");`);
	lines.push(`\t\t\t\t\t\t\tlet status = response.status ?? 200;`);
	lines.push(`\t\t\t\t\t\t\tlet headers = new Array<[string, string]>();`);
	for (let header of route.response.headers.headers) {
		let plain = header.type === types.PlainType.INSTANCE;
		lines.push(`\t\t\t\t\t\t\tautoguard.api.appendKeyValuePair(headers, "${header.name}", response.headers?.["${header.name}"], ${plain});`);
	}
	lines.push(`\t\t\t\t\t\t\theaders.push(...autoguard.api.extractKeyValuePairs(response.headers ?? {}, headers.map((header) => header[0])));`);
	if (route.response.payload === types.Binary.INSTANCE) {
		lines.push(`\t\t\t\t\t\t\tlet payload = response.payload;`);
	} else {
		lines.push(`\t\t\t\t\t\t\tlet payload = autoguard.api.serializePayload(response.payload);`);
	}
	let contentType = getDefaultContentType(route.response.payload);
	lines.push(`\t\t\t\t\t\t\treturn autoguard.api.finalizeResponse({ status, headers, payload }, "${contentType}");`);
	lines.push(`\t\t\t\t\t\t}`);
	lines.push(`\t\t\t\t\t};`);
	lines.push(`\t\t\t\t}`);
	lines.push(`\t\t\t};`);
	lines.push(`\t\t}`);
	lines.push(`\t};`);
	lines.push(`}`);
	return lines.join(options.eol);
}

export class Schema {
	private guards: Array<guard.Guard>;
	private routes: Array<route.Route>;

	private getSharedImports(): Array<shared.Reference> {
		let imports = new Map<string, string[]>();
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
			.filter((entry) =>  entry.path.length > 0)
			.map((entry) => ({
				...entry,
				path: ["..", ...entry.path]
			}));
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
		lines.push(`export const makeClient = (options?: Partial<{`);
		lines.push(`\turlPrefix: string,`);
		lines.push(`\trequestHandler: autoguard.api.RequestHandler`);
		lines.push(`}>): autoguard.api.Client<shared.Autoguard.Requests, shared.Autoguard.Responses> => ({`);
		for (let route of this.routes) {
			let tag = makeRouteTag(route);
			lines.push(`\t"${tag}": ${generateClientRoute(route, { ...options, eol: options.eol + "\t" })},`);
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
		lines.push(`export const makeServer = (routes: autoguard.api.Server<shared.Autoguard.Requests, shared.Autoguard.Responses>, options?: Partial<{ urlPrefix: string }>): autoguard.api.RequestListener => {`);
		lines.push(`\tlet endpoints = new Array<autoguard.api.Endpoint>();`);
		for (let route of this.routes) {
			lines.push(`\tendpoints.push(${generateServerRoute(route, { ...options, eol: options.eol + "\t" })});`);
		}
		lines.push(`\treturn (request, response) => autoguard.api.route(endpoints, request, response, options?.urlPrefix);`);
		lines.push(`};`);
		lines.push(``);
		return lines.join(options.eol);
	}

	generateShared(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push(`// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.`);
		lines.push(``);
		lines.push(`import * as autoguard from "@joelek/ts-autoguard";`);
		for (let entry of this.getSharedImports()) {
			lines.push(`import { ${entry.typename} } from "${entry.path.join("/")}";`);
		}
		lines.push(``);
		for (let guard of this.guards) {
			lines.push(`export const ${guard.typename} = ${guard.type.generateTypeGuard({ ...options, eol: options.eol })};`);
			lines.push(``);
			lines.push(`export type ${guard.typename} = ReturnType<typeof ${guard.typename}["as"]>;`);
			lines.push(``);
		}
		let guards = new Array<string>();
		for (let guard of this.guards) {
			let reference = new types.ReferenceType([], guard.typename);
			guards.push(`\t\t"${guard.typename}": ${reference.generateTypeGuard({ ...options, eol: options.eol + "\t\t" })}`);
		}
		lines.push(`export namespace Autoguard {`);
		lines.push(`\texport const Guards = {${guards.length > 0 ? options.eol + guards.join("," + options.eol) + options.eol + "\t" : ""}};`);
		lines.push(``);
		lines.push(`\texport type Guards = { [A in keyof typeof Guards]: ReturnType<typeof Guards[A]["as"]>; };`);
		lines.push(``);
		let requests = new Array<string>();
		for (let route of this.routes) {
			let request = getRequestType(route);
			let tag = makeRouteTag(route);
			requests.push(`\t\t"${tag}": ${request.generateTypeGuard({ ...options, eol: options.eol + "\t\t" })}`);
		}
		lines.push(`\texport const Requests = {${requests.length > 0 ? options.eol + requests.join("," + options.eol) + options.eol + "\t" : ""}};`);
		lines.push(``);
		lines.push(`\texport type Requests = { [A in keyof typeof Requests]: ReturnType<typeof Requests[A]["as"]>; };`);
		lines.push(``);
		let responses = new Array<string>();
		for (let route of this.routes) {
			let response = getResponseType(route);
			let tag = makeRouteTag(route);
			responses.push(`\t\t"${tag}": ${response.generateTypeGuard({ ...options, eol: options.eol + "\t\t" })}`);
		}
		lines.push(`\texport const Responses = {${responses.length > 0 ? options.eol + responses.join("," + options.eol) + options.eol + "\t" : ""}};`);
		lines.push(``);
		lines.push(`\texport type Responses = { [A in keyof typeof Responses]: ReturnType<typeof Responses[A]["as"]>; };`);
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
				return tokenizer.newContext((read, peek) => {
					let token = read();
					throw `Unexpected ${token.family} at row ${token.row}, col ${token.col}!`;
				});
			}
			return new Schema(guards, routes);
		});
	}
};
