import * as shared from "../lib-shared";

export * from "../lib-shared/api";

export class ServerResponse<A extends shared.api.EndpointResponse> {
	private response: A;
	private collect: boolean;
	private collectedPayload?: shared.api.CollectedPayload<A["payload"]>;

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

	async payload(maxByteLength?: number): Promise<shared.api.CollectedPayload<A["payload"]>> {
		if (this.collectedPayload !== undefined) {
			return this.collectedPayload;
		}
		let payload = this.response.payload;
		let collectedPayload = (this.collect ? await shared.api.collectPayload(payload as shared.api.Binary, maxByteLength) : payload) as any;
		this.collectedPayload = collectedPayload;
		return collectedPayload;
	}
};

export type Client<A extends shared.api.RequestMap<A>, B extends shared.api.ResponseMap<B>> = {
	[C in keyof A & keyof B]: (request: A[C], requestOptions?: shared.api.RequestOptions) => Promise<ServerResponse<B[C]>>;
};

type XHRProgressEvent = {
	lengthComputable: boolean;
	loaded: number;
	total: number;
};

export function xhr(raw: shared.api.RawRequest, clientOptions?: shared.api.ClientOptions, requestOptions?: shared.api.RequestOptions): Promise<shared.api.RawResponse> {
	return new Promise(async (resolve, reject) => {
		// @ts-ignore
		let xhr = new XMLHttpRequest();
		xhr.onerror = reject;
		xhr.onabort = reject;
		xhr.onload = () => {
			let status = xhr.status;
			// Header values for the same header name are joined by he XHR implementation.
			let headers = shared.api.splitHeaders(xhr.getAllResponseHeaders().split("\r\n").slice(0, -1));
			let payload = [new Uint8Array(xhr.response as ArrayBuffer)];
			let raw: shared.api.RawResponse = {
				status,
				headers,
				payload
			};
			resolve(raw);
		};
		xhr.onprogress = (event: XHRProgressEvent) => {
			if (event.lengthComputable) {
				requestOptions?.onprogress?.(event.loaded / event.total);
			}
		};
		let url = clientOptions?.urlPrefix ?? "";
		url += shared.api.combineComponents(raw.components);
		url += shared.api.combineParameters(raw.parameters);
		xhr.open(raw.method, url, true);
		xhr.responseType = "arraybuffer";
		for (let header of raw.headers) {
			// Header values for the same header name are joined by he XHR implementation.
			xhr.setRequestHeader(header[0], header[1]);
		}
		xhr.send(await shared.api.collectPayload(raw.payload));
	});
};

export function finalizeRequest(raw: shared.api.RawRequest, defaultHeaders: Array<[string, string]>): shared.api.RawRequest {
	let headersToAppend = defaultHeaders.filter((defaultHeader) => {
		let found = raw.headers.find((header) => header[0].toLowerCase() === defaultHeader[0].toLowerCase());
		return found === undefined;
	});
	return {
		...raw,
		headers: [
			...raw.headers,
			...headersToAppend
		]
	};
};
