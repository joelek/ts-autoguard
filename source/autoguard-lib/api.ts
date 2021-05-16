import * as guards from "./guards";
import * as is from "./is";

export const Options = guards.Record.of(guards.Union.of(
	guards.Boolean,
	guards.Number,
	guards.String
));

export type Options = ReturnType<typeof Headers.as>;

export const Headers = guards.Record.of(guards.Union.of(
	guards.Boolean,
	guards.Number,
	guards.String
));

export type Headers = ReturnType<typeof Headers.as>;

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

export type Primitive = boolean | number | string;
export type JSON = null | Primitive | JSON[] | { [key: string]: JSON };

export type RequestLike = AsyncBinary & {
	method?: string;
	rawHeaders: string[];
	url?: string;
};

export type ResponseLike = {
	end(): void;
	once(type: string, callback: () => void): void;
	setHeader(key: string, value: string): void;
	write(payload: Uint8Array): boolean;
	writeHead(status: number): void;
};

export type RequestListener = (request: RequestLike, response: ResponseLike) => Promise<void>;

export function serializeComponents(components: Array<string>): string {
	return "/" + components
		.map((component) => {
			return encodeURIComponent(component);
		})
		.join("/");
};

export function extractKeyValuePairs(record: Record<string, Primitive | undefined>, exclude: Array<string> = []): Array<[string, string]> {
	let pairs = new Array<[string, string]>();
	for (let [key, value] of Object.entries(record)) {
		if (value !== undefined && !exclude.includes(key)) {
			pairs.push([key, String(value)]);
		}
	}
	return pairs;
};

export function combineKeyValuePairs(pairs: Array<[string, string]>): Record<string, Primitive | undefined> {
	let record: Record<string, Primitive | undefined> = {};
	for (let pair of pairs) {
		record[pair[0]] = pair[1];
	}
	return record;
};

export function serializeParameters(parameters: Array<[string, string]>): string {
	let parts = parameters.map((parameters) => {
			let key = encodeURIComponent(parameters[0]);
			let value = encodeURIComponent(parameters[1]);
			return `${key}=${value}`;
		});
	if (parts.length === 0) {
		return "";
	}
	return `?${parts.join("&")}`;
};

export function getStringOption(pairs: Iterable<[string, string]>, key: string): string | undefined {
	for (let pair of pairs) {
		if (pair[0] === key) {
			try {
				let value = pair[1];
				if (guards.String.is(value)) {
					return value;
				}
			} catch (error) {}
		}
	}
};

export function getNumberOption(pairs: Iterable<[string, string]>, key: string): number | undefined {
	for (let pair of pairs) {
		if (pair[0] === key) {
			try {
				let value = JSON.parse(pair[1]);
				if (guards.Number.is(value)) {
					return value;
				}
			} catch (error) {}
		}
	}
};

export function getBooleanOption(pairs: Iterable<[string, string]>, key: string): boolean | undefined {
	for (let pair of pairs) {
		if (pair[0] === key) {
			try {
				let value = JSON.parse(pair[1]);
				if (guards.Boolean.is(value)) {
					return value;
				}
			} catch (error) {}
		}
	}
};

export type RawRequest = {
	method: string;
	components: Array<string>;
	parameters: Array<[string, string]>;
	headers: Array<[string, string]>;
	payload: Binary;
};

export type RawResponse = {
	status: number;
	headers: Array<[string, string]>;
	payload: Binary;
};

export type Endpoint = (raw: RawRequest) => {
	acceptsComponents(): boolean;
	acceptsMethod(): boolean;
	validateRequest(): Promise<{
		handleRequest(): Promise<{
			validateResponse(): Promise<EndpointResponse>;
		}>
	}>
};

export function getComponents(url: string): Array<string> {
	return url.split("?")[0].split("/").map((part) => {
		return decodeURIComponent(part);
	}).slice(1);
};

export function getParameters(url: string): Array<[string, string]> {
	let query = url.split("?").slice(1).join("?");
	return query === "" ? [] : query.split("&").map((part) => {
		let parts = part.split("=");
		if (parts.length === 1) {
			let key = decodeURIComponent(parts[0]);
			let value = "";
			return [key, value];
		} else {
			let key = decodeURIComponent(parts[0]);
			let value = decodeURIComponent(parts.slice(1).join("="));
			return [key, value];
		}
	});
};

export function getHeaders(headers: Array<string>): Array<[string, string]> {
	return headers.map((part) => {
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

export type Payload = JSON | Binary | undefined;
export type CollectedPayload<A extends Payload> = A extends Binary ? Uint8Array : A;

export type EndpointRequest = {
	options?: Record<string, Primitive | undefined>;
	headers?: Record<string, Primitive | undefined>;
	payload?: Payload;
};

export type EndpointResponse = {
	status?: number;
	headers?: Record<string, Primitive | undefined>;
	payload?: Payload;
};

export class ClientRequest<A extends EndpointRequest> {
	private request: A;

	constructor(request: A) {
		this.request = request;
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
		let payload = this.request.payload;
		return (Binary.is(payload) ? await collectPayload(payload) : payload) as any;
	}
};

export class ServerResponse<A extends EndpointResponse> {
	private response: A;

	constructor(response: A) {
		this.response = response;
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
		let payload = this.response.payload;
		return (Binary.is(payload) ? await collectPayload(payload) : payload) as any;
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

export function serializePayload(payload: JSON | undefined): Binary {
	if (payload === undefined) {
		return [];
	}
	let string = JSON.stringify(payload);
	return serializeStringPayload(string);
};

export async function deserializeStringPayload(binary: Binary): Promise<string> {
	let buffer = await collectPayload(binary);
	let decoder = new TextDecoder();
	let string = decoder.decode(buffer);
	return string;
};

export async function deserializePayload(binary: Binary): Promise<JSON | undefined> {
	let string = await deserializeStringPayload(binary);
	return string === "" ? undefined : JSON.parse(string);
};

export function getContentType(payload: Payload): string {
	if (Binary.is(payload) || payload === undefined) {
		return "application/octet-stream";
	} else {
		return "application/json; charset=utf-8";
	}
};

export function transformResponse<A extends EndpointResponse>(response: A): RawResponse {
	let status = response.status ?? 200;
	let headers = extractKeyValuePairs(response.headers ?? {});
	let contentType = headers.find((header) => {
		return header[0].toLowerCase() === "content-type";
	});
	if (contentType === undefined) {
		headers.push(["Content-Type", getContentType(response.payload)]);
	}
	let payload = Binary.is(response.payload) ? response.payload : serializePayload(response.payload);
	return {
		status: status,
		headers: headers,
		payload: payload
	};
};

export function acceptsComponents(one: Array<string>, two: Array<[string, string]>): boolean {
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
			let headers = getHeaders(xhr.getAllResponseHeaders().split("\r\n").slice(0, -1));
			let payload = [new Uint8Array(xhr.response as ArrayBuffer)];
			resolve({
				status,
				headers,
				payload
			});
		};
		let url = urlPrefix ?? "";
		url += serializeComponents(raw.components);
		url += serializeParameters(raw.parameters);
		xhr.open(raw.method, url, true);
		xhr.responseType = "arraybuffer";
		for (let header of raw.headers) {
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
			let headers: { [key: string]: string } = {};
			for (let header of raw.headers) {
				headers[header[0]] = header[1];
			}
			let url = urlPrefix ?? "";
			url += serializeComponents(raw.components);
			url += serializeParameters(raw.parameters);
			let request = lib.request(url, {
				...options,
				method: raw.method,
				headers: headers,
			}, (response) => {
				let status = response.statusCode ?? 200;
				let headers = getHeaders(combineRawHeaders(response.rawHeaders));
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
	for (let header of raw.headers) {
		httpResponse.setHeader(header[0], header[1]);
	}
	httpResponse.writeHead(raw.status);
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
	let components = getComponents(url);
	let parameters = getParameters(url);
	let headers = getHeaders(combineRawHeaders(httpRequest.rawHeaders));
	let payload = {
		[Symbol.asyncIterator]: () => httpRequest[Symbol.asyncIterator]()
	};
	let raw: RawRequest = {
		method,
		components,
		parameters,
		headers,
		payload
	};
	let filteredEndpoints = endpoints.map((endpoint) => endpoint(raw));
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
				let response = await handled.validateResponse();
				let raw = transformResponse(response);
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
			let status = 500;
			if (Number.isInteger(error) && error >= 100 && error <= 999) {
				status = error;
			}
			return respond(httpResponse, {
				status: status,
				headers: [],
				payload: []
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

export function parseRangeHeader(value: Primitive | undefined, size: number): {
	status: number,
	offset: number,
	length: number
	size: number
} {
	if (is.absent(value)) {
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
	if (is.present(parts)) {
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
	if (is.present(parts)) {
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
	if (is.present(parts)) {
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
			"Content-Type": "unknown"
		},
		payload: stream
	};
};
