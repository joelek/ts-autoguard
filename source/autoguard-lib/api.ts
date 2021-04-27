import * as guards from "./guards";
import * as is from "./is";

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
	setHeader(key: string, value: string): void;
	write(payload: string): void;
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

export function getOptionalString(pairs: Iterable<[string, string]>, key: string): string | undefined {
	for (let pair of pairs) {
		if (pair[0] === key) {
			let value = pair[1];
			return value;
		}
	}
};

export function getRequiredString(pairs: Iterable<[string, string]>, key: string): string {
	let value = getOptionalString(pairs, key);
	if (is.present(value)) {
		return value;
	}
	throw `Expected a string for key "${key}"!`;
};

export function getOptionalNumber(pairs: Iterable<[string, string]>, key: string): number | undefined {
	for (let pair of pairs) {
		if (pair[0] === key) {
			let value = JSON.parse(pair[1]);
			if (!guards.Number.is(value)) {
				throw `Expected ${value} to be a number!`;
			}
			return value;
		}
	}
};

export function getRequiredNumber(pairs: Iterable<[string, string]>, key: string): number {
	let value = getOptionalNumber(pairs, key);
	if (is.present(value)) {
		return value;
	}
	throw `Expected a number for key "${key}"!`;
};


export function getOptionalBoolean(pairs: Iterable<[string, string]>, key: string): boolean | undefined {
	for (let pair of pairs) {
		if (pair[0] === key) {
			let value = JSON.parse(pair[1]);
			if (!guards.Boolean.is(value)) {
				throw `Expected ${value} to be a boolean!`;
			}
			return value;
		}
	}
};

export function getRequiredBoolean(pairs: Iterable<[string, string]>, key: string): boolean {
	let value = getOptionalBoolean(pairs, key);
	if (is.present(value)) {
		return value;
	}
	throw `Expected a boolean for key "${key}"!`;
};

export type RawRequest = {
	method: string;
	components: Array<string>;
	parameters: Array<[string, string]>;
	headers: Array<[string, string]>;
	payload?: string;
};

export type RawResponse = {
	status: number;
	headers: Array<[string, string]>;
	payload?: string;
};

export type Endpoint = (request: RawRequest) => Promise<RawResponse>;

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

export function transformResponse<A extends {
	status?: number;
	headers?: Record<string, Primitive | undefined>;
	payload?: JSON;
}>(response: A): RawResponse {
	let status = response.status ?? 200;
	let headers = Object.entries(response.headers ?? {}).map<[string, string]>((entry) => {
		return [entry[0], String(entry)];
	});
	let payload = JSON.stringify(response.payload);
	return {
		status: status,
		headers: headers,
		payload: payload
	};
};

export function checkComponents(one: Array<string>, two: Array<[string, string]>): boolean {
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

export function fetch(method: string, url: string, headers: Array<[string, string]>, payload: string | undefined): Promise<RawResponse> {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.onerror = reject;
		xhr.onabort = reject;
		xhr.onload = () => {
			let status = xhr.status;
			let headers = getHeaders(xhr.getAllResponseHeaders().split("\r\n").slice(0, -1));
			let payload = xhr.responseText || undefined;
			resolve({
				status,
				headers,
				payload
			});
		};
		xhr.open(method, url, true);
		for (let header of headers) {
			xhr.setRequestHeader(header[0], header[1]);
		}
		xhr.send(payload);
	});
};

export async function route(endpoints: Array<Endpoint>, httpRequest: RequestLike, httpResponse: ResponseLike): Promise<void> {
	let method = httpRequest.method ?? "GET";
	let url = httpRequest.url ?? "";
	let components = getComponents(url);
	let parameters = getParameters(url);
	let headers = getHeaders(httpRequest.rawHeaders);
	let payload = await (async () => {
		let chunks = new Array<Buffer>();
		for await (let chunk of httpRequest) {
			chunks.push(chunk)
		}
		let buffer = Buffer.concat(chunks);
		return buffer.toString();
	})() || undefined;
	let request = {
		method,
		components,
		parameters,
		headers,
		payload
	};
	for (let endpoint of endpoints) {
		let response = await endpoint(request);
		if (response.status === 404) {
			continue;
		}
		for (let header of response.headers ?? []) {
			httpResponse.setHeader(header[0], header[1]);
		}
		httpResponse.writeHead(response.status);
		httpResponse.write(response.payload ?? "");
		return httpResponse.end();
	}
	httpResponse.writeHead(404);
	return httpResponse.end();
};
