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

export const JSON: serialization.MessageGuard<JSON> = guards.Group.of(guards.Union.of(
	guards.Boolean,
	guards.Null,
	guards.Number,
	guards.String,
	guards.Array.of(guards.Reference.of(() => JSON)),
	guards.Record.of(guards.Reference.of(() => JSON)),
	guards.Undefined
), "JSON");

export const Options = guards.Record.of(JSON);
export const Headers = guards.Record.of(JSON);

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

export type RawResponse = {
	status: number;
	headers: Array<[string, string]>;
	payload: Binary;
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

export type RequestMap<A extends RequestMap<A>> = {
	[B in keyof A]: EndpointRequest;
};

export type ResponseMap<A extends ResponseMap<A>> = {
	[B in keyof A]: EndpointResponse;
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
	// @ts-ignore
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
	// @ts-ignore
	let decoder = new TextDecoder();
	let string = decoder.decode(buffer);
	// @ts-ignore
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

export type ClientOptions = {
	urlPrefix?: string;
	requestHandler?: RequestHandler;
	defaultHeaders?: Array<[string, string]>;
};

export type ServerOptions = {
	urlPrefix?: string;
	defaultHeaders?: Array<[string, string]>;
};

export type RequestHandler = (raw: RawRequest, urlPrefix?: string) => Promise<RawResponse>;
