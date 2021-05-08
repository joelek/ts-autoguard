export declare const Options: import("./serialization").MessageGuard<Record<string, string | number | boolean | undefined>>;
export declare type Options = ReturnType<typeof Headers.as>;
export declare const Headers: import("./serialization").MessageGuard<Record<string, string | number | boolean | undefined>>;
export declare type Headers = ReturnType<typeof Headers.as>;
export declare type AsyncBinary = AsyncIterable<Uint8Array>;
export declare const AsyncBinary: {
    as(subject: any, path?: string): AsyncBinary;
    is(subject: any): subject is AsyncBinary;
    ts(eol?: string): string;
};
export declare type SyncBinary = Iterable<Uint8Array>;
export declare const SyncBinary: {
    as(subject: any, path?: string): SyncBinary;
    is(subject: any): subject is SyncBinary;
    ts(eol?: string): string;
};
export declare const Binary: import("./serialization").MessageGuard<AsyncBinary | SyncBinary>;
export declare type Binary = ReturnType<typeof Binary.as>;
export declare type Primitive = boolean | number | string;
export declare type JSON = null | Primitive | JSON[] | {
    [key: string]: JSON;
};
export declare type RequestLike = AsyncBinary & {
    method?: string;
    rawHeaders: string[];
    url?: string;
};
export declare type ResponseLike = {
    end(): void;
    once(type: string, callback: () => void): void;
    setHeader(key: string, value: string): void;
    write(payload: Uint8Array): boolean;
    writeHead(status: number): void;
};
export declare type RequestListener = (request: RequestLike, response: ResponseLike) => Promise<void>;
export declare function serializeComponents(components: Array<string>): string;
export declare function extractKeyValuePairs(record: Record<string, Primitive | undefined>, exclude?: Array<string>): Array<[string, string]>;
export declare function combineKeyValuePairs(pairs: Array<[string, string]>): Record<string, Primitive | undefined>;
export declare function serializeParameters(parameters: Array<[string, string]>): string;
export declare function getStringOption(pairs: Iterable<[string, string]>, key: string): string | undefined;
export declare function getNumberOption(pairs: Iterable<[string, string]>, key: string): number | undefined;
export declare function getBooleanOption(pairs: Iterable<[string, string]>, key: string): boolean | undefined;
export declare type RawRequest = {
    method: string;
    components: Array<string>;
    parameters: Array<[string, string]>;
    headers: Array<[string, string]>;
    payload: Binary;
};
export declare type RawResponse = {
    status: number;
    headers: Array<[string, string]>;
    payload: Binary;
};
export declare type Endpoint = (raw: RawRequest) => {
    acceptsComponents(): boolean;
    acceptsMethod(): boolean;
    validateRequest(): Promise<{
        handleRequest(): Promise<{
            validateResponse(): Promise<EndpointResponse>;
        }>;
    }>;
};
export declare function getComponents(url: string): Array<string>;
export declare function getParameters(url: string): Array<[string, string]>;
export declare function getHeaders(headers: Array<string>): Array<[string, string]>;
export declare type Payload = JSON | Binary | undefined;
export declare type CollectedPayload<A extends Payload> = A extends Binary ? Uint8Array : A;
export declare type EndpointRequest = {
    options?: Record<string, Primitive | undefined>;
    headers?: Record<string, Primitive | undefined>;
    payload?: Payload;
};
export declare type EndpointResponse = {
    status?: number;
    headers?: Record<string, Primitive | undefined>;
    payload?: Payload;
};
export declare class ClientRequest<A extends EndpointRequest> {
    private request;
    constructor(request: A);
    options(): {} & A["options"];
    headers(): {} & A["headers"];
    payload(): Promise<CollectedPayload<A["payload"]>>;
}
export declare class ServerResponse<A extends EndpointResponse> {
    private response;
    constructor(response: A);
    status(): number;
    headers(): {} & A["headers"];
    payload(): Promise<CollectedPayload<A["payload"]>>;
}
export declare type RequestMap<A extends RequestMap<A>> = {
    [B in keyof A]: EndpointRequest;
};
export declare type ResponseMap<A extends ResponseMap<A>> = {
    [B in keyof A]: EndpointResponse;
};
export declare type Client<A extends RequestMap<A>, B extends ResponseMap<B>> = {
    [C in keyof A & keyof B]: (request: A[C]) => Promise<ServerResponse<B[C]>>;
};
export declare type Server<A extends RequestMap<A>, B extends ResponseMap<B>> = {
    [C in keyof A & keyof B]: (request: ClientRequest<A[C]>) => Promise<B[C]>;
};
export declare function collectPayload(binary: Binary): Promise<Uint8Array>;
export declare function serializeStringPayload(string: string): Binary;
export declare function serializePayload(payload: JSON | undefined): Binary;
export declare function deserializeStringPayload(binary: Binary): Promise<string>;
export declare function deserializePayload(binary: Binary): Promise<JSON | undefined>;
export declare function getContentType(payload: Payload): string;
export declare function transformResponse<A extends EndpointResponse>(response: A): RawResponse;
export declare function acceptsComponents(one: Array<string>, two: Array<[string, string]>): boolean;
export declare function acceptsMethod(one: string, two: string): boolean;
export declare function xhr(raw: RawRequest, urlPrefix?: string): Promise<RawResponse>;
export declare function respond(httpResponse: ResponseLike, raw: RawResponse): Promise<void>;
export declare function combineRawHeaders(raw: Array<string>): Array<string>;
export declare function route(endpoints: Array<Endpoint>, httpRequest: RequestLike, httpResponse: ResponseLike): Promise<void>;
