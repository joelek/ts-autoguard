import * as guards from "./guards";

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
	}
};

export const Binary = guards.Union.of(
	AsyncBinary,
	SyncBinary
);

export type Binary = ReturnType<typeof Binary.as>;

export type Primitive = boolean | number | string;
export type JSON = null | Primitive | JSON[] | { [key: string]: JSON };

export type RequestLike = {
	[Symbol.asyncIterator](): AsyncIterableIterator<any>;
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

export type RequestListener = (request: RequestLike, response: ResponseLike) => void;

export function serializeComponents(components: Array<string>): string {
	return "/" + components
		.map((component) => {
			return encodeURIComponent(component);
		})
		.join("/");
};

export function extractKeyValuePairs(record: Record<string, Primitive | undefined>): Array<[string, string]> {
	let pairs = new Array<[string, string]>();
	for (let [key, value] of Object.entries(record)) {
		if (value !== undefined) {
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
			let value = pair[1];
			if (guards.String.is(value)) {
				return value;
			}
		}
	}
};

export function getNumberOption(pairs: Iterable<[string, string]>, key: string): number | undefined {
	for (let pair of pairs) {
		if (pair[0] === key) {
			let value = JSON.parse(pair[1]);
			if (guards.Number.is(value)) {
				return value;
			}
		}
	}
};

export function getBooleanOption(pairs: Iterable<[string, string]>, key: string): boolean | undefined {
	for (let pair of pairs) {
		if (pair[0] === key) {
			let value = JSON.parse(pair[1]);
			if (guards.Boolean.is(value)) {
				return value;
			}
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
	prepareRequest(): Promise<{
		handleRequest(): Promise<EndpointResponse>;
	}>
};

export function getComponents(url: string): Array<string> {
	return url.split("?")[0].split("/").map((part) => {
		return decodeURIComponent(part);
	}).slice(1);
};

export function getParameters(url: string): Array<[string, string]> {
	return url.split("?").slice(1).join("?").split("&").map((part) => {
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
			let key = parts[0];
			let value = "";
			return [key, value];
		} else {
			let key = parts[0];
			let value = parts.slice(1).join(":").trim();
			return [key, value];
		}
	});
};

export type EndpointResponse = {
	status?: number;
	headers?: Record<string, Primitive | undefined>;
	payload?: JSON | Binary;
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

export function serializePayload(payload: JSON | undefined): Binary {
	let string = JSON.stringify(payload ?? "");
	let encoder = new TextEncoder();
	let array = encoder.encode(string);
	return [array];
};

export async function deserializePayload(binary: Binary): Promise<JSON | undefined> {
	let buffer = await collectPayload(binary);
	let decoder = new TextDecoder();
	let string = decoder.decode(buffer);
	return string === "" ? undefined : JSON.parse(string);
};

export function transformResponse<A extends EndpointResponse>(response: A): RawResponse {
	let status = response.status ?? 200;
	let headers = extractKeyValuePairs(response.headers ?? {});
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

export function fetch(method: string, url: string, headers: Array<[string, string]>, payload: Binary): Promise<RawResponse> {
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
		xhr.open(method, url, true);
		xhr.responseType = "arraybuffer";
		for (let header of headers) {
			xhr.setRequestHeader(header[0], header[1]);
		}
		xhr.send(await collectPayload(payload));
	});
};

export async function sendPayload(httpResponse: ResponseLike, payload: Binary): Promise<void> {
	for await (let chunk of payload) {
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

export async function route(endpoints: Array<Endpoint>, httpRequest: RequestLike, httpResponse: ResponseLike): Promise<void> {
	let method = httpRequest.method ?? "GET";
	let url = httpRequest.url ?? "";
	let components = getComponents(url);
	let parameters = getParameters(url);
	let headers = new Array<[string, string]>();
	for (let i = 0; i < httpRequest.rawHeaders.length; i += 2) {
		headers.push([httpRequest.rawHeaders[i+0], httpRequest.rawHeaders[i+1]]);
	}
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
		httpResponse.writeHead(404);
		httpResponse.end();
		return;
	}
	filteredEndpoints = filteredEndpoints.filter((endpoint) => endpoint.acceptsMethod());
	if (filteredEndpoints.length === 0) {
		httpResponse.writeHead(405);
		httpResponse.end();
		return;
	}
	let endpoint = filteredEndpoints[0];
	try {
		let prepared = await endpoint.prepareRequest();
		try {
			let response = await prepared.handleRequest();
			let { status, headers, payload } = transformResponse(response);
			for (let header of headers) {
				httpResponse.setHeader(header[0], header[1]);
			}
			httpResponse.writeHead(status);
			await sendPayload(httpResponse, payload);
			return;
		} catch (error) {
			let status = 500;
			if (Number.isInteger(error) && error >= 100 && error <= 999) {
				status = error;
			}
			httpResponse.writeHead(status);
			httpResponse.end();
			return;
		}
	} catch (error) {
		httpResponse.writeHead(400);
		let payload = serializePayload(String(error));
		await sendPayload(httpResponse, payload);
		return;
	}
};
