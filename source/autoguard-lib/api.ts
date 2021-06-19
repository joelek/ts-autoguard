import * as guards from "./guards";
import * as serialization from "./serialization";

export function decodeURIComponent(string: string): string | undefined {
	try {
		return globalThis.decodeURIComponent(string);
	} catch (error) {}
};

export function splitComponents(url: string): Array<string> {
	let components = new Array<string>();
	for (let part of url.split("?")[0].split("/").slice(1)) {
		components.push(part);
	}
	return components;
};

export function combineComponents(components: Array<string>): string {
	return "/" + components.join("/");
};

export function splitParameters(url: string): Array<[string, string]> {
	let parameters = new Array<[string, string]>();
	let query = url.split("?").slice(1).join("?");
	if (query !== "") {
		for (let part of query.split("&")) {
			let parts = part.split("=");
			if (parts.length === 1) {
				let key = parts[0];
				let value = "";
				parameters.push([key, value]);
			} else {
				let key = parts[0];
				let value = parts.slice(1).join("=");
				parameters.push([key, value]);
			}
		}
	}
	return parameters;
};

export function combineParameters(parameters: Array<[string, string]>): string {
	let parts = parameters.map((parameters) => {
			let key = parameters[0];
			let value = parameters[1];
			return `${key}=${value}`;
		});
	if (parts.length === 0) {
		return "";
	}
	return `?${parts.join("&")}`;
};

export function splitHeaders(lines: Array<string>): Array<[string, string]> {
	return lines.map((part) => {
		let parts = part.split(":");
		if (parts.length === 1) {
			let key = parts[0].toLowerCase();
			let value = "";
			return [key, value];
		} else {
			let key = parts[0].toLowerCase();
			let value = parts.slice(1).join(":").trim();
			return [key, value];
		}
	});
};

const RFC7320_DELIMITERS = "\"(),/:;<=>?@[\\]{}";
const RFC7320_WHITESPACE = "\t ";

// The specification (rfc7320) allows octets 33-126 and forbids delimiters. Octets 128-255 have been deprecated since rfc2616.
export function escapeHeaderKey(string: string, alwaysEncode: string = ""): string {
	return escapeHeaderValue(string, RFC7320_DELIMITERS + RFC7320_WHITESPACE + alwaysEncode);
};

// The specification (rfc7320) allows octets 33-126 and whitespace. Octets 128-255 have been deprecated since rfc2616.
export function escapeHeaderValue(string: string, alwaysEncode: string = ""): string {
	return [...string]
		.map((codePointString) => {
			if (!alwaysEncode.includes(codePointString) && codePointString !== "%") {
				let codePoint = codePointString.codePointAt(0) ?? 0;
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
};

export function encodeHeaderPairs(key: string, values: Array<JSON>, plain: boolean): Array<[string, string]> {
	let pairs = new Array<[string, string]>();
	for (let value of values) {
		let serialized = serializeValue(value, plain);
		if (serialized !== undefined) {
			if (plain) {
				pairs.push([
					escapeHeaderKey(key),
					escapeHeaderValue(serialized)
				]);
			} else {
				pairs.push([
					escapeHeaderKey(key),
					escapeHeaderKey(serialized)
				]);
			}
		}
	}
	return pairs;
};

export function encodeUndeclaredHeaderPairs(record: Record<string, JSON>, exclude: Array<string>): Array<[string, string]> {
	let pairs = new Array<[string, string]>();
	for (let [key, value] of Object.entries(record)) {
		if (!exclude.includes(key) && value !== undefined) {
			if (guards.String.is(value)) {
				pairs.push(...encodeHeaderPairs(key, [value], true));
			} else if (guards.Array.of(guards.String).is(value)) {
				pairs.push(...encodeHeaderPairs(key, value, true));
			} else {
				throw `Expected type of undeclared header "${key}" to be string or string[]!`;
			}
		}
	}
	return pairs;
};

export function escapeComponent(string: string): string {
	return encodeURIComponent(string);
};

export function encodeComponents(values: Array<JSON>, plain: boolean): Array<string> {
	let array = new Array<string>();
	for (let value of values) {
		let serialized = serializeValue(value, plain);
		if (serialized !== undefined) {
			array.push(escapeComponent(serialized));
		}
	}
	return array;
};

export function escapeParameterKey(string: string): string {
	return encodeURIComponent(string);
};

export function escapeParameterValue(string: string): string {
	return encodeURIComponent(string);
};

export function encodeParameterPairs(key: string, values: Array<JSON>, plain: boolean): Array<[string, string]> {
	let pairs = new Array<[string, string]>();
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
};

export function encodeUndeclaredParameterPairs(record: Record<string, JSON>, exclude: Array<string>): Array<[string, string]> {
	let pairs = new Array<[string, string]>();
	for (let [key, value] of Object.entries(record)) {
		if (!exclude.includes(key) && value !== undefined) {
			if (guards.String.is(value)) {
				pairs.push(...encodeParameterPairs(key, [value], true));
			} else if (guards.Array.of(guards.String).is(value)) {
				pairs.push(...encodeParameterPairs(key, value, true));
			} else {
				throw `Expected type of undeclared parameter "${key}" to be string or string[]!`;
			}
		}
	}
	return pairs;
};

export function decodeParameterValues(pairs: Iterable<[string, string]>, key: string, plain: boolean): Array<JSON> {
	let values = new Array<JSON>();
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
};

export function decodeParameterValue(pairs: Iterable<[string, string]>, key: string, plain: boolean): JSON {
	let values = decodeParameterValues(pairs, key, plain);
	if (values.length > 1) {
		throw `Expected no more than one "${key}" parameter!`;
	}
	return values[0];
};

export function decodeUndeclaredParameters(pairs: Array<[string, string]>, exclude: Array<string>): Record<string, JSON> {
	let map: Record<string, Array<string>> = {};
	for (let pair of pairs) {
		let key = decodeURIComponent(pair[0]);
		let value = decodeURIComponent(pair[1]);
		if (key === undefined || value === undefined) {
			throw `Expected undeclared parameter "${key}" to be properly encoded!`;
		}
		if (!exclude.includes(key)) {
			let values = map[key] as string[] | undefined;
			if (values === undefined) {
				values = new Array<string>();
				map[key] = values;
			}
			values.push(value);
		}
	}
	let record: Record<string, JSON> = {};
	for (let [key, value] of Object.entries(map)) {
		if (value.length === 1) {
			record[key] = value[0];
		} else {
			record[key] = value;
		}
	}
	return record;
};

export function decodeHeaderValues(pairs: Iterable<[string, string]>, key: string, plain: boolean): Array<JSON> {
	let values = new Array<JSON>();
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
};

export function decodeHeaderValue(pairs: Iterable<[string, string]>, key: string, plain: boolean): JSON {
	let values = decodeHeaderValues(pairs, key, plain);
	if (values.length > 1) {
		throw `Expected no more than one "${key}" header!`;
	}
	return values[0];
};

export function decodeUndeclaredHeaders(pairs: Array<[string, string]>, exclude: Array<string>): Record<string, JSON> {
	let map: Record<string, Array<string>> = {};
	for (let pair of pairs) {
		let key = decodeURIComponent(pair[0]);
		let value = decodeURIComponent(pair[1]);
		if (key === undefined || value === undefined) {
			throw `Expected undeclared header "${key}" to be properly encoded!`;
		}
		if (!exclude.includes(key)) {
			let values = map[key] as string[] | undefined;
			if (values === undefined) {
				values = new Array<string>();
				map[key] = values;
			}
			values.push(value);
		}
	}
	let record: Record<string, JSON> = {};
	for (let [key, value] of Object.entries(map)) {
		if (value.length === 1) {
			record[key] = value[0];
		} else {
			record[key] = value;
		}
	}
	return record;
};

export interface RouteMatcher {
	acceptComponent(component: string): boolean;
	getValue(): JSON;
	isSatisfied(): boolean;
};

export class StaticRouteMatcher implements RouteMatcher {
	private string: string;
	private accepted: boolean;

	constructor(string: string) {
		this.string = string;
		this.accepted = false;
	}

	acceptComponent(component: string): boolean {
		if (this.accepted) {
			return false;
		}
		this.accepted = component === this.string;
		return this.accepted;
	}

	getValue(): JSON {
		return this.string;
	}

	isSatisfied(): boolean {
		return this.accepted;
	}
};

export class DynamicRouteMatcher<A> implements RouteMatcher {
	private minOccurences: number;
	private maxOccurences: number;
	private plain: boolean;
	private guard: serialization.MessageGuard<A>;
	private values: Array<JSON>;

	constructor(minOccurences: number, maxOccurences: number, plain: boolean, guard: serialization.MessageGuard<A>) {
		this.minOccurences = minOccurences;
		this.maxOccurences = maxOccurences;
		this.plain = plain;
		this.guard = guard;
		this.values = new Array<JSON>();
	}

	acceptComponent(component: string): boolean {
		if (this.values.length >= this.maxOccurences) {
			return false;
		}
		try {
			let value = deserializeValue(component, this.plain);
			if (this.guard.is(value)) {
				this.values.push(value);
				return true;
			}
		} catch (error) {}
		return false;
	}

	getValue(): JSON {
		if (this.maxOccurences === 1) {
			return this.values[0];
		} else {
			return this.values;
		}
	}

	isSatisfied(): boolean {
		return this.minOccurences <= this.values.length && this.values.length <= this.maxOccurences;
	}
};

export type AsyncBinary = AsyncIterable<Uint8Array>;

export const AsyncBinary = {
	as(subject: any, path: string = ""): AsyncBinary {
		if (subject != null) {
			let member = subject[Symbol.asyncIterator];
			if (member != null && member.constructor === globalThis.Function) {
				return subject;
			}
		}
		throw "Expected AsyncBinary at " + path + "!";
	},
	is(subject: any): subject is AsyncBinary {
		try {
			this.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	},
	ts(eol: string = "\n"): string {
		return `AsyncBinary`;
	}
};

export type SyncBinary = Iterable<Uint8Array>;

export const SyncBinary = {
	as(subject: any, path: string = ""): SyncBinary {
		if (subject != null) {
			let member = subject[Symbol.iterator];
			if (member != null && member.constructor === globalThis.Function) {
				return subject;
			}
		}
		throw "Expected SyncBinary at " + path + "!";
	},
	is(subject: any): subject is SyncBinary {
		try {
			this.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	},
	ts(eol: string = "\n"): string {
		return `SyncBinary`;
	}
};

export const Binary = guards.Union.of(
	AsyncBinary,
	SyncBinary
);

export type Binary = ReturnType<typeof Binary.as>;

export type Primitive = boolean | number | string | undefined;

export const Primitive: serialization.MessageGuard<Primitive> = guards.Union.of(
	guards.Boolean,
	guards.Number,
	guards.String,
	guards.Undefined
);

export type JSON = boolean | null | number | string | JSON[] | { [key: string]: JSON } | undefined;

export const JSON: serialization.MessageGuard<JSON> = guards.Union.of(
	guards.Boolean,
	guards.Null,
	guards.Number,
	guards.String,
	guards.Array.of(guards.Reference.of(() => JSON)),
	guards.Record.of(guards.Reference.of(() => JSON)),
	guards.Undefined
);

export const Options = guards.Record.of(JSON);
export const Headers = guards.Record.of(JSON);

export type RequestLike = AsyncBinary & {
	method?: string;
	rawHeaders: string[];
	socket: import("net").Socket | import("tls").TLSSocket;
	url?: string;
};

export type ResponseLike = {
	end(): void;
	once(type: string, callback: () => void): void;
	setHeader(key: string, value: string | Array<string>): void;
	write(payload: Uint8Array): boolean;
	writeHead(status: number, headers?: Record<string, string | Array<string>> | Array<string>): void;
};

export type RequestListener = (request: RequestLike, response: ResponseLike) => Promise<void>;

export function serializeValue(value: JSON, plain: boolean): string | undefined {
	if (value === undefined) {
		return;
	}
	return plain ? String(value) : globalThis.JSON.stringify(value);
};

export function deserializeValue(value: string | undefined, plain: boolean): JSON {
	if (value === undefined || plain) {
		return value;
	}
	try {
		return globalThis.JSON.parse(value);
	} catch (error) {}
};

export type RawRequest = {
	method: string;
	components: Array<string>;
	parameters: Array<[string, string]>;
	headers: Array<[string, string]>;
	payload: Binary;
};

export type Auxillary = {
	socket: RequestLike["socket"];
};

export type RawResponse = {
	status: number;
	headers: Array<[string, string]>;
	payload: Binary;
};

export type Endpoint = (raw: RawRequest, auxillary: Auxillary) => {
	acceptsComponents(): boolean;
	acceptsMethod(): boolean;
	validateRequest(): Promise<{
		handleRequest(): Promise<{
			validateResponse(): Promise<RawResponse>;
		}>
	}>
};

export type Payload = JSON | Binary;
export type CollectedPayload<A extends Payload> = A extends Binary ? Uint8Array : A;

export type EndpointRequest = {
	options?: Record<string, JSON>;
	headers?: Record<string, JSON>;
	payload?: Payload;
};

export type EndpointResponse = {
	status?: number;
	headers?: Record<string, JSON>;
	payload?: Payload;
};

export class ClientRequest<A extends EndpointRequest> {
	private request: A;
	private collect: boolean;
	private auxillary: Auxillary;
	private collectedPayload?: CollectedPayload<A["payload"]>;

	constructor(request: A, collect: boolean, auxillary: Auxillary) {
		this.request = request;
		this.collect = collect;
		this.auxillary = auxillary;
	}

	options(): {} & A["options"] {
		let options = this.request.options;
		return {
			...options
		};
	}

	headers(): {} & A["headers"] {
		let headers = this.request.headers;
		return {
			...headers
		};
	}

	async payload(): Promise<CollectedPayload<A["payload"]>> {
		if (this.collectedPayload !== undefined) {
			return this.collectedPayload;
		}
		let payload = this.request.payload;
		let collectedPayload = (this.collect ? await collectPayload(payload as Binary) : payload) as any;
		this.collectedPayload = collectedPayload;
		return collectedPayload;
	}

	socket(): Auxillary["socket"] {
		return this.auxillary.socket;
	}
};

export class ServerResponse<A extends EndpointResponse> {
	private response: A;
	private collect: boolean;
	private collectedPayload?: CollectedPayload<A["payload"]>;

	constructor(response: A, collect: boolean) {
		this.response = response;
		this.collect = collect;
	}

	status(): number {
		let status = this.response.status;
		return status ?? 200;
	}

	headers(): {} & A["headers"] {
		let headers = this.response.headers;
		return {
			...headers
		};
	}

	async payload(): Promise<CollectedPayload<A["payload"]>> {
		if (this.collectedPayload !== undefined) {
			return this.collectedPayload;
		}
		let payload = this.response.payload;
		let collectedPayload = (this.collect ? await collectPayload(payload as Binary) : payload) as any;
		this.collectedPayload = collectedPayload;
		return collectedPayload;
	}
};

export class EndpointError {
	private response: Partial<RawResponse>;

	constructor(response: Partial<RawResponse>) {
		this.response = response;
	}

	getResponse(): RawResponse {
		let status = this.response.status ?? 500;
		let headers = this.response.headers ?? [];
		let payload = this.response.payload ?? [];
		return {
			status,
			headers,
			payload
		};
	}
};

export type RequestMap<A extends RequestMap<A>> = {
	[B in keyof A]: EndpointRequest;
};

export type ResponseMap<A extends ResponseMap<A>> = {
	[B in keyof A]: EndpointResponse;
};

export type Client<A extends RequestMap<A>, B extends ResponseMap<B>> = {
	[C in keyof A & keyof B]: (request: A[C]) => Promise<ServerResponse<B[C]>>;
};

export type Server<A extends RequestMap<A>, B extends ResponseMap<B>> = {
	[C in keyof A & keyof B]: (request: ClientRequest<A[C]>) => Promise<B[C]>;
};

export async function collectPayload(binary: Binary): Promise<Uint8Array> {
	let chunks = new Array<Uint8Array>();
	let length = 0;
	for await (let chunk of binary) {
		chunks.push(chunk);
		length += chunk.length;
	}
	let payload = new Uint8Array(length);
	let offset = 0;
	for (let chunk of chunks) {
		payload.set(chunk, offset);
		offset += chunk.length;
	}
	return payload;
};

export function serializeStringPayload(string: string): Binary {
	let encoder = new TextEncoder();
	let array = encoder.encode(string);
	return [array];
};

export function serializePayload(payload: JSON): Binary {
	let serialized = serializeValue(payload, false);
	if (serialized === undefined) {
		return [];
	}
	return serializeStringPayload(serialized);
};

export function compareArrays(one: Uint8Array, two: Uint8Array): boolean {
	if (one.length !== two.length) {
		return false;
	}
	for (let i = 0; i < one.length; i++) {
		if (one[i] !== two[i]) {
			return false;
		}
	}
	return true;
};

export async function deserializeStringPayload(binary: Binary): Promise<string> {
	let buffer = await collectPayload(binary);
	let decoder = new TextDecoder();
	let string = decoder.decode(buffer);
	let encoder = new TextEncoder();
	let encoded = encoder.encode(string);
	if (!compareArrays(buffer, encoded)) {
		throw `Expected payload to be UTF-8 encoded!`;
	}
	return string;
};

export async function deserializePayload(binary: Binary): Promise<JSON> {
	let string = await deserializeStringPayload(binary);
	if (string === "") {
		return;
	}
	let value = deserializeValue(string, false);
	if (value === undefined) {
		throw `Expected payload to be JSON encoded!`;
	}
	return value;
};

export function finalizeResponse(raw: RawResponse, defaultContentType: string): RawResponse {
	let headers = raw.headers;
	let contentType = headers.find((header) => {
		return header[0].toLowerCase() === "content-type";
	});
	if (contentType === undefined) {
		headers = [
			...headers,
			["Content-Type", defaultContentType]
		];
	}
	return {
		...raw,
		headers
	};
};

export function acceptsComponents(components: Array<string>, matchers: Array<RouteMatcher>): boolean {
	let currentMatcher = 0;
	outer: for (let component of components) {
		let decoded = decodeURIComponent(component);
		if (decoded === undefined) {
			throw `Expected component to be properly encoded!`;
		}
		inner: for (let matcher of matchers.slice(currentMatcher)) {
			if (matcher.acceptComponent(decoded)) {
				continue outer;
			} else {
				if (matcher.isSatisfied()) {
					currentMatcher += 1;
					continue inner;
				} else {
					break outer;
				}
			}
		}
		break outer;
	}
	return currentMatcher === matchers.length - 1 && matchers[currentMatcher].isSatisfied();
};

export function acceptsMethod(one: string, two: string): boolean {
	return one === two;
};

export type RequestHandler = (raw: RawRequest, urlPrefix?: string) => Promise<RawResponse>;

export function xhr(raw: RawRequest, urlPrefix?: string): Promise<RawResponse> {
	return new Promise(async (resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.onerror = reject;
		xhr.onabort = reject;
		xhr.onload = () => {
			let status = xhr.status;
			// Header values for the same header name are joined by he XHR implementation.
			let headers = splitHeaders(xhr.getAllResponseHeaders().split("\r\n").slice(0, -1));
			let payload = [new Uint8Array(xhr.response as ArrayBuffer)];
			resolve({
				status,
				headers,
				payload
			});
		};
		let url = urlPrefix ?? "";
		url += combineComponents(raw.components);
		url += combineParameters(raw.parameters);
		xhr.open(raw.method, url, true);
		xhr.responseType = "arraybuffer";
		for (let header of raw.headers) {
			// Header values for the same header name are joined by he XHR implementation.
			xhr.setRequestHeader(header[0], header[1]);
		}
		xhr.send(await collectPayload(raw.payload));
	});
};

export type NodeRequestHandlerOptions = Partial<Omit<import("https").RequestOptions, keyof import("http").RequestOptions>>;

export function makeNodeRequestHandler(options?: NodeRequestHandlerOptions): RequestHandler {
	return (raw, urlPrefix) => {
		let libhttp = require("http") as typeof import("http");
		let libhttps = require("https") as typeof import("https");
		let lib = (urlPrefix ?? "").startsWith("https:") ? libhttps : libhttp;
		return new Promise(async (resolve, reject) => {
			let headers: Record<string, Array<string>> = {};
			for (let header of raw.headers) {
				let key = header[0];
				let value = header[1];
				let values = headers[key] as Array<string> | undefined;
				if (values === undefined) {
					values = new Array<string>();
					headers[key] = values;
				}
				values.push(value);
			}
			let url = urlPrefix ?? "";
			url += combineComponents(raw.components);
			url += combineParameters(raw.parameters);
			let request = lib.request(url, {
				...options,
				method: raw.method,
				headers: headers
			}, (response) => {
				let status = response.statusCode ?? 200;
				let headers = splitHeaders(combineRawHeaders(response.rawHeaders));
				let payload = {
					[Symbol.asyncIterator]: () => response[Symbol.asyncIterator]()
				};
				resolve({ status, headers, payload });
			});
			request.on("abort", reject);
			request.on("error", reject);
			request.write(await collectPayload(raw.payload));
			request.end();
		});
	};
};

export async function respond(httpResponse: ResponseLike, raw: RawResponse): Promise<void> {
	let rawHeaders = new Array<string>();
	for (let header of raw.headers) {
		rawHeaders.push(...header);
	}
	httpResponse.writeHead(raw.status, rawHeaders);
	for await (let chunk of raw.payload) {
		if (!httpResponse.write(chunk)) {
			await new Promise<void>((resolve, reject) => {
				httpResponse.once("drain", resolve);
			});
		}
	}
	httpResponse.end();
	await new Promise<void>((resolve, reject) => {
		httpResponse.once("finish", resolve);
	});
};

export function combineRawHeaders(raw: Array<string>): Array<string> {
	let headers = new Array<string>();
	for (let i = 0; i < raw.length; i += 2) {
		headers.push(`${raw[i+0]}: ${raw[i+1]}`);
	}
	return headers;
};

export async function route(endpoints: Array<Endpoint>, httpRequest: RequestLike, httpResponse: ResponseLike, urlPrefix: string = ""): Promise<void> {
	let method = httpRequest.method ?? "GET";
	let url = httpRequest.url ?? "";
	if (!url.startsWith(urlPrefix)) {
		throw `Expected url "${url}" to have prefix "${urlPrefix}"!`;
	}
	url = url.slice(urlPrefix?.length);
	try {
		let components = splitComponents(url);
		let parameters = splitParameters(url);
		let headers = splitHeaders(combineRawHeaders(httpRequest.rawHeaders));
		let payload = {
			[Symbol.asyncIterator]: () => httpRequest[Symbol.asyncIterator]()
		};
		let socket = httpRequest.socket;
		let raw: RawRequest = {
			method,
			components,
			parameters,
			headers,
			payload
		};
		let auxillary: Auxillary = {
			socket
		}
		let filteredEndpoints = endpoints.map((endpoint) => endpoint(raw, auxillary));
		filteredEndpoints = filteredEndpoints.filter((endpoint) => endpoint.acceptsComponents());
		if (filteredEndpoints.length === 0) {
			return respond(httpResponse, {
				status: 404,
				headers: [],
				payload: []
			});
		}
		filteredEndpoints = filteredEndpoints.filter((endpoint) => endpoint.acceptsMethod());
		if (filteredEndpoints.length === 0) {
			return respond(httpResponse, {
				status: 405,
				headers: [],
				payload: []
			});
		}
		let endpoint = filteredEndpoints[0];
		try {
			let valid = await endpoint.validateRequest();
			try {
				let handled = await valid.handleRequest();
				try {
					let raw = await handled.validateResponse();
					return await respond(httpResponse, raw);
				} catch (error) {
					let payload = serializeStringPayload(String(error));
					return respond(httpResponse, {
						status: 500,
						headers: [],
						payload: payload
					});
				}
			} catch (error) {
				let response: RawResponse = {
					status: 500,
					headers: [],
					payload: []
				};
				if (Number.isInteger(error) && error >= 100 && error <= 999) {
					response.status = error;
				} else if (error instanceof EndpointError) {
					response = error.getResponse();
				}
				return respond(httpResponse, response);
			}
		} catch (error) {
			let payload = serializeStringPayload(String(error));
			return respond(httpResponse, {
				status: 400,
				headers: [],
				payload: payload
			});
		}
	} catch (error) {
		let payload = serializeStringPayload(String(error));
		return respond(httpResponse, {
			status: 400,
			headers: [],
			payload: payload
		});
	}
};

export function parseRangeHeader(value: JSON, size: number): {
	status: number,
	offset: number,
	length: number
	size: number
} {
	if (value === undefined) {
		return {
			status: 200,
			offset: 0,
			length: size,
			size: size
		};
	}
	let s416 = {
		status: 416,
		offset: 0,
		length: 0,
		size: size
	};
	let parts: RegExpExecArray | undefined;
	parts = /^bytes[=]([0-9]+)[-]$/.exec(String(value)) ?? undefined;
	if (parts !== undefined) {
		let one = Number.parseInt(parts[1], 10);
		if (one >= size) {
			return s416;
		}
		return {
			status: 206,
			offset: one,
			length: size - one,
			size: size
		};
	}
	parts = /^bytes[=]([0-9]+)[-]([0-9]+)$/.exec(String(value)) ?? undefined;
	if (parts !== undefined) {
		let one = Number.parseInt(parts[1], 10);
		let two = Number.parseInt(parts[2], 10);
		if (two < one) {
			return s416;
		}
		if (one >= size) {
			return s416;
		}
		if (two >= size) {
			two = size - 1;
		}
		return {
			status: 206,
			offset: one,
			length: two - one + 1,
			size: size
		};
	}
	parts = /^bytes[=][-]([0-9]+)$/.exec(String(value)) ?? undefined;
	if (parts !== undefined) {
		let one = Number.parseInt(parts[1], 10);
		if (one < 1) {
			return s416;
		}
		if (size < 1) {
			return s416;
		}
		if (one > size) {
			one = size;
		}
		return {
			status: 206,
			offset: size - one,
			length: one,
			size: size
		};
	}
	return s416;
};

export function getContentTypeFromExtension(extension: string): string | undefined {
	let extensions: Record<string, string | undefined> = {
		".css": "text/css",
		".htm": "text/html",
		".html": "text/html",
		".jpg": "image/jpeg",
		".jpeg": "image/jpeg",
		".js": "text/javascript",
		".json": "application/json",
		".png": "image/png"
	};
	return extensions[extension];
};

export function makeReadStreamResponse(pathPrefix: string, pathSuffix: string, request: ClientRequest<EndpointRequest>): EndpointResponse & { payload: Binary } {
	let libfs = require("fs") as typeof import("fs");
	let libpath = require("path") as typeof import("path");
	if (libpath.normalize(pathSuffix).split(libpath.sep)[0] === "..") {
		throw 400;
	}
	let path = libpath.join(pathPrefix, pathSuffix);
	while (libfs.existsSync(path) && libfs.statSync(path).isDirectory()) {
		path = libpath.join(path, "index.html");
	}
	if (!libfs.existsSync(path)) {
		throw 404;
	}
	let range = parseRangeHeader(request.headers().range, libfs.statSync(path).size);
	let stream = libfs.createReadStream(path, {
		start: range.offset,
		end: range.offset + range.length
	});
	return {
		status: range.status,
		headers: {
			"Accept-Ranges": "bytes",
			"Content-Length": `${range.length}`,
			"Content-Range": range.length > 0 ? `bytes ${range.offset}-${range.offset+range.length-1}/${range.size}` : `bytes */${range.size}`,
			"Content-Type": getContentTypeFromExtension(libpath.extname(path))
		},
		payload: stream
	};
};
