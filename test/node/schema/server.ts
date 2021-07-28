// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.

import * as autoguard from "../../../dist/lib-server";
import * as shared from "./index";

export const makeServer = (routes: autoguard.api.Server<shared.Autoguard.Requests, shared.Autoguard.Responses>, serverOptions?: autoguard.api.MakeServerOptions): autoguard.api.RequestListener => {
	let endpoints = new Array<autoguard.api.Endpoint>();
	endpoints.push((raw, auxillary) => {
		let method = "POST";
		let matchers = new Array<autoguard.api.RouteMatcher>();
		matchers.push(new autoguard.api.StaticRouteMatcher(decodeURIComponent("plain")));
		matchers.push(new autoguard.api.DynamicRouteMatcher(1, 1, true, autoguard.guards.String));
		matchers.push(new autoguard.api.DynamicRouteMatcher(0, 1, true, autoguard.guards.String));
		matchers.push(new autoguard.api.DynamicRouteMatcher(0, Infinity, true, autoguard.guards.String));
		return {
			acceptsComponents: () => autoguard.api.acceptsComponents(raw.components, matchers),
			acceptsMethod: () => autoguard.api.acceptsMethod(raw.method, method),
			validateRequest: async () => {
				let options: Record<string, autoguard.api.JSON> = {};
				options["ca"] = matchers[1].getValue();
				options["cb"] = matchers[2].getValue();
				options["cc"] = matchers[3].getValue();
				options["pa"] = autoguard.api.decodeParameterValue(raw.parameters, "pa", true);
				options["pb"] = autoguard.api.decodeParameterValue(raw.parameters, "pb", true);
				options["pc"] = autoguard.api.decodeParameterValues(raw.parameters, "pc", true);
				options = { ...options, ...autoguard.api.decodeUndeclaredParameters(raw.parameters ?? {}, Object.keys(options)) };
				let headers: Record<string, autoguard.api.JSON> = {};
				headers["ha"] = autoguard.api.decodeHeaderValue(raw.headers, "ha", true);
				headers["hb"] = autoguard.api.decodeHeaderValue(raw.headers, "hb", true);
				headers["hc"] = autoguard.api.decodeHeaderValues(raw.headers, "hc", true);
				headers = { ...headers, ...autoguard.api.decodeUndeclaredHeaders(raw.headers ?? {}, Object.keys(headers)) };
				let payload = raw.payload;
				let guard = shared.Autoguard.Requests["plain"];
				let request = guard.as({ options, headers, payload }, "request");
				return {
					handleRequest: async () => {
						let response = await routes["plain"](new autoguard.api.ClientRequest(request, true, auxillary));
						return {
							validateResponse: async () => {
								let guard = shared.Autoguard.Responses["plain"];
								guard.as(response, "response");
								let status = response.status ?? 200;
								let headers = new Array<[string, string]>();
								headers.push(...autoguard.api.encodeHeaderPairs("ha", [response.headers?.["ha"]], true));
								headers.push(...autoguard.api.encodeHeaderPairs("hb", [response.headers?.["hb"]], true));
								headers.push(...autoguard.api.encodeHeaderPairs("hc", response.headers?.["hc"] ?? [], true));
								headers.push(...autoguard.api.encodeUndeclaredHeaderPairs(response.headers ?? {}, headers.map((header) => header[0])));
								let payload = response.payload ?? [];
								let defaultHeaders = serverOptions?.defaultHeaders?.slice() ?? [];
								defaultHeaders.push(["Content-Type", "application/octet-stream"]);
								return autoguard.api.finalizeResponse({ status, headers, payload }, defaultHeaders);
							}
						};
					}
				};
			}
		};
	});
	endpoints.push((raw, auxillary) => {
		let method = "POST";
		let matchers = new Array<autoguard.api.RouteMatcher>();
		matchers.push(new autoguard.api.StaticRouteMatcher(decodeURIComponent("json")));
		matchers.push(new autoguard.api.DynamicRouteMatcher(1, 1, false, autoguard.guards.Number));
		matchers.push(new autoguard.api.DynamicRouteMatcher(0, 1, false, autoguard.guards.Number));
		matchers.push(new autoguard.api.DynamicRouteMatcher(0, Infinity, false, autoguard.guards.Number));
		return {
			acceptsComponents: () => autoguard.api.acceptsComponents(raw.components, matchers),
			acceptsMethod: () => autoguard.api.acceptsMethod(raw.method, method),
			validateRequest: async () => {
				let options: Record<string, autoguard.api.JSON> = {};
				options["ca"] = matchers[1].getValue();
				options["cb"] = matchers[2].getValue();
				options["cc"] = matchers[3].getValue();
				options["pa"] = autoguard.api.decodeParameterValue(raw.parameters, "pa", false);
				options["pb"] = autoguard.api.decodeParameterValue(raw.parameters, "pb", false);
				options["pc"] = autoguard.api.decodeParameterValues(raw.parameters, "pc", false);
				options = { ...options, ...autoguard.api.decodeUndeclaredParameters(raw.parameters ?? {}, Object.keys(options)) };
				let headers: Record<string, autoguard.api.JSON> = {};
				headers["ha"] = autoguard.api.decodeHeaderValue(raw.headers, "ha", false);
				headers["hb"] = autoguard.api.decodeHeaderValue(raw.headers, "hb", false);
				headers["hc"] = autoguard.api.decodeHeaderValues(raw.headers, "hc", false);
				headers = { ...headers, ...autoguard.api.decodeUndeclaredHeaders(raw.headers ?? {}, Object.keys(headers)) };
				let payload = raw.payload;
				let guard = shared.Autoguard.Requests["json"];
				let request = guard.as({ options, headers, payload }, "request");
				return {
					handleRequest: async () => {
						let response = await routes["json"](new autoguard.api.ClientRequest(request, true, auxillary));
						return {
							validateResponse: async () => {
								let guard = shared.Autoguard.Responses["json"];
								guard.as(response, "response");
								let status = response.status ?? 200;
								let headers = new Array<[string, string]>();
								headers.push(...autoguard.api.encodeHeaderPairs("ha", [response.headers?.["ha"]], false));
								headers.push(...autoguard.api.encodeHeaderPairs("hb", [response.headers?.["hb"]], false));
								headers.push(...autoguard.api.encodeHeaderPairs("hc", response.headers?.["hc"] ?? [], false));
								headers.push(...autoguard.api.encodeUndeclaredHeaderPairs(response.headers ?? {}, headers.map((header) => header[0])));
								let payload = response.payload ?? [];
								let defaultHeaders = serverOptions?.defaultHeaders?.slice() ?? [];
								defaultHeaders.push(["Content-Type", "application/octet-stream"]);
								return autoguard.api.finalizeResponse({ status, headers, payload }, defaultHeaders);
							}
						};
					}
				};
			}
		};
	});
	return (request, response) => autoguard.api.route(endpoints, request, response, serverOptions);
};
