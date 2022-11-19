import * as libfs from "fs";
import * as libhttp from "http";
import * as libhttps from "https";
import * as libnet from "net";
import * as libpath from "path";
import * as libtls from "tls";
import * as shared from "../lib-shared";

export * from "../lib-shared/api";

export type RequestLike = shared.api.AsyncBinary & {
	method?: string;
	rawHeaders: string[];
	socket: libnet.Socket | libtls.TLSSocket;
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

export type Auxillary = {
	socket: RequestLike["socket"];
};

export type Endpoint = (raw: shared.api.RawRequest, auxillary: Auxillary) => {
	acceptsComponents(): boolean;
	acceptsMethod(): boolean;
	validateRequest(): Promise<{
		handleRequest(): Promise<{
			validateResponse(): Promise<shared.api.RawResponse>;
		}>
	}>
};

export class EndpointError {
	private response: Partial<shared.api.RawResponse>;

	constructor(response: Partial<shared.api.RawResponse>) {
		this.response = response;
	}

	getResponse(): shared.api.RawResponse {
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

export class ClientRequest<A extends shared.api.EndpointRequest> {
	private request: A;
	private collect: boolean;
	private auxillary: Auxillary;
	private collectedPayload?: shared.api.CollectedPayload<A["payload"]>;

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

	async payload(): Promise<shared.api.CollectedPayload<A["payload"]>> {
		if (this.collectedPayload !== undefined) {
			return this.collectedPayload;
		}
		let payload = this.request.payload;
		let collectedPayload = (this.collect ? await shared.api.collectPayload(payload as shared.api.Binary) : payload) as any;
		this.collectedPayload = collectedPayload;
		return collectedPayload;
	}

	socket(): Auxillary["socket"] {
		return this.auxillary.socket;
	}
};

export type Server<A extends shared.api.RequestMap<A>, B extends shared.api.ResponseMap<B>> = {
	[C in keyof A & keyof B]: (request: ClientRequest<A[C]>) => Promise<B[C]>;
};

export interface RouteMatcher {
	acceptComponent(component: string): boolean;
	getValue(): shared.api.JSON;
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

	getValue(): shared.api.JSON {
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
	private guard: shared.serialization.MessageGuard<A>;
	private values: Array<shared.api.JSON>;

	constructor(minOccurences: number, maxOccurences: number, plain: boolean, guard: shared.serialization.MessageGuard<A>) {
		this.minOccurences = minOccurences;
		this.maxOccurences = maxOccurences;
		this.plain = plain;
		this.guard = guard;
		this.values = new Array<shared.api.JSON>();
	}

	acceptComponent(component: string): boolean {
		if (this.values.length >= this.maxOccurences) {
			return false;
		}
		try {
			let value = shared.api.deserializeValue(component, this.plain);
			if (this.guard.is(value)) {
				this.values.push(value);
				return true;
			}
		} catch (error) {}
		return false;
	}

	getValue(): shared.api.JSON {
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

export function combineNodeRawHeaders(raw: Array<string>): Array<string> {
	let headers = new Array<string>();
	for (let i = 0; i < raw.length; i += 2) {
		headers.push(`${raw[i+0]}: ${raw[i+1]}`);
	}
	return headers;
};

export type NodeRequestHandlerOptions = Partial<Omit<libhttps.RequestOptions, keyof libhttp.RequestOptions>>;

export function makeNodeRequestHandler(options?: NodeRequestHandlerOptions): shared.api.RequestHandler {
	return (raw, clientOptions) => {
		let urlPrefix = clientOptions?.urlPrefix ?? "";
		let lib = urlPrefix.startsWith("https:") ? libhttps : libhttp;
		return new Promise(async (resolve, reject) => {
			let payload = await shared.api.collectPayload(raw.payload);
			let headers: Record<string, string | Array<string> | undefined> = {
				"Content-Length": `${payload.length}`
			};
			for (let header of raw.headers) {
				let key = header[0];
				let value = header[1];
				let values = headers[key];
				if (values === undefined) {
					headers[key] = value;
				} else if (Array.isArray(values)) {
					values.push(value);
				} else {
					headers[key] = [values, value];
				}
			}
			let url = urlPrefix;
			url += shared.api.combineComponents(raw.components);
			url += shared.api.combineParameters(raw.parameters);
			let request = lib.request(url, {
				...options,
				method: raw.method,
				headers: headers
			}, (response) => {
				let status = response.statusCode ?? 200;
				let headers = shared.api.splitHeaders(combineNodeRawHeaders(response.rawHeaders));
				let payload = {
					[Symbol.asyncIterator]: () => response[Symbol.asyncIterator]()
				};
				let raw: shared.api.RawResponse = {
					status,
					headers,
					payload
				};
				resolve(raw);
			});
			request.on("abort", reject);
			request.on("error", reject);
			request.write(payload);
			request.end();
		});
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
	if (currentMatcher >= matchers.length) {
		return false;
	}
	for (let matcher of matchers.slice(currentMatcher)) {
		if (!matcher.isSatisfied()) {
			return false;
		}
	}
	return true;
};

export function acceptsMethod(one: string, two: string): boolean {
	return one === two;
};

export async function finalizeResponse(raw: shared.api.RawResponse, defaultHeaders: Array<[string, string]>): Promise<shared.api.RawResponse> {
	let payload = raw.payload;
	if (shared.api.SyncBinary.is(payload)) {
		let collectedPayload = await shared.api.collectPayload(payload);
		defaultHeaders.push(["Content-Length", `${collectedPayload.length}`]);
		payload = [collectedPayload];
	}
	let headersToAppend = defaultHeaders.filter((defaultHeader) => {
		let found = raw.headers.find((header) => header[0].toLowerCase() === defaultHeader[0].toLowerCase());
		return found === undefined;
	});
	return {
		...raw,
		headers: [
			...raw.headers,
			...headersToAppend
		],
		payload
	};
};

export async function respond(httpResponse: ResponseLike, raw: Partial<shared.api.RawResponse>, serverOptions?: shared.api.ServerOptions): Promise<void> {
	let rawHeaders = new Array<string>();
	for (let header of raw.headers ?? []) {
		rawHeaders.push(...header);
	}
	httpResponse.writeHead(raw.status ?? 200, rawHeaders);
	for await (let chunk of raw.payload ?? []) {
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

export async function route(endpoints: Array<Endpoint>, httpRequest: RequestLike, httpResponse: ResponseLike, serverOptions?: shared.api.ServerOptions): Promise<void> {
	let urlPrefix = serverOptions?.urlPrefix ?? "";
	let method = httpRequest.method ?? "GET";
	let url = httpRequest.url ?? "";
	if (!url.startsWith(urlPrefix)) {
		throw `Expected url "${url}" to have prefix "${urlPrefix}"!`;
	}
	url = url.slice(urlPrefix.length);
	try {
		let components = shared.api.splitComponents(url);
		let parameters = shared.api.splitParameters(url);
		let headers = shared.api.splitHeaders(combineNodeRawHeaders(httpRequest.rawHeaders));
		let payload = {
			[Symbol.asyncIterator]: () => httpRequest[Symbol.asyncIterator]()
		};
		let socket = httpRequest.socket;
		let raw: shared.api.RawRequest = {
			method,
			components,
			parameters,
			headers,
			payload
		};
		let auxillary: Auxillary = {
			socket
		};
		let allEndpoints = endpoints.map((endpoint) => endpoint(raw, auxillary));
		let endpointsAcceptingComponents = allEndpoints.filter((endpoint) => endpoint.acceptsComponents());
		if (endpointsAcceptingComponents.length === 0) {
			return respond(httpResponse, {
				status: 404
			}, serverOptions);
		}
		let endpointsAcceptingComponentsAndMethod = endpointsAcceptingComponents.filter((endpoint) => endpoint.acceptsMethod());
		if (endpointsAcceptingComponentsAndMethod.length === 0) {
			return respond(httpResponse, {
				status: 405
			}, serverOptions);
		}
		let endpoint = endpointsAcceptingComponentsAndMethod[0];
		let valid = await endpoint.validateRequest();
		try {
			let handled = await valid.handleRequest();
			try {
				let raw = await handled.validateResponse();
				return await respond(httpResponse, raw, serverOptions);
			} catch (error) {
				return respond(httpResponse, {
					status: 500,
					payload: shared.api.serializeStringPayload(String(error))
				}, serverOptions);
			}
		} catch (error) {
			if (typeof error === "number" && Number.isInteger(error) && error >= 100 && error <= 999) {
				return respond(httpResponse, {
					status: error
				}, serverOptions);
			}
			if (error instanceof EndpointError) {
				let raw = error.getResponse();
				return respond(httpResponse, raw, serverOptions);
			}
			return respond(httpResponse, {
				status: 500
			}, serverOptions);
		}
	} catch (error) {
		return respond(httpResponse, {
			status: 400,
			payload: shared.api.serializeStringPayload(String(error))
		}, serverOptions);
	}
};

// TODO: Move to Nexus in v6.
export function parseRangeHeader(value: shared.api.JSON, size: number): {
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

// TODO: Move to Nexus in v6.
export function getContentTypeFromExtension(extension: string): string | undefined {
	let extensions: Record<string, string | undefined> = {
		".aac": "audio/aac",
		".bmp": "image/bmp",
		".css": "text/css",
		".csv": "text/csv",
		".gif": "image/gif",
		".htm": "text/html",
		".html": "text/html",
		".jpg": "image/jpeg",
		".jpeg": "image/jpeg",
		".js": "text/javascript",
		".json": "application/json",
		".mid": "audio/midi",
		".mp3": "audio/mpeg",
		".mp4": "video/mp4",
		".otf": "font/otf",
		".pdf": "application/pdf",
		".png": "image/png",
		".svg": "image/svg+xml",
		".tif": "image/tiff",
		".tiff": "image/tiff",
		".ttf": "font/ttf",
		".txt": "text/plain",
		".wav": "audio/wav",
		".woff": "font/woff",
		".woff2": "font/woff2",
		".xml": "text/xml"
	};
	return extensions[extension];
};

// TODO: Move to Nexus in v6.
export type DirectoryListing = {
	components: Array<string>;
	directories: Array<{
		name: string;
	}>;
	files: Array<{
		name: string;
		size: number;
		timestamp: number;
	}>;
};

// TODO: Move to Nexus in v6.
export function makeDirectoryListing(pathPrefix: string, pathSuffix: string, request: ClientRequest<shared.api.EndpointRequest>): DirectoryListing {
	let pathSuffixParts = libpath.normalize(pathSuffix).split(libpath.sep);
	if (pathSuffixParts[0] === "..") {
		throw 400;
	}
	if (pathSuffixParts[pathSuffixParts.length - 1] !== "") {
		pathSuffixParts.push("");
	}
	let fullPath = libpath.join(pathPrefix, ...pathSuffixParts);
	if (!libfs.existsSync(fullPath) || !libfs.statSync(fullPath).isDirectory()) {
		throw 404;
	}
	let entries = libfs.readdirSync(fullPath, { withFileTypes: true });
	let directories = entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => {
			return {
				name: entry.name
			};
		})
		.sort((one, two) => one.name.localeCompare(two.name));
	let files = entries
		.filter((entry) => entry.isFile())
		.map((entry) => {
			let stat = libfs.statSync(libpath.join(fullPath, entry.name));
			return {
				name: entry.name,
				size: stat.size,
				timestamp: stat.mtime.valueOf()
			};
		})
		.sort((one, two) => one.name.localeCompare(two.name));
	let components = pathSuffixParts;
	return {
		components,
		directories,
		files
	};
};

// TODO: Move to Nexus in v6.
export function makeReadStreamResponse(pathPrefix: string, pathSuffix: string, request: ClientRequest<shared.api.EndpointRequest>): shared.api.EndpointResponse & { payload: shared.api.Binary } {
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
	let stat = libfs.statSync(path);
	let range = parseRangeHeader(request.headers().range, stat.size);
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
			"Content-Type": getContentTypeFromExtension(libpath.extname(path)),
			"Last-Modified": stat.mtime.toUTCString()
		},
		payload: stream
	};
};
