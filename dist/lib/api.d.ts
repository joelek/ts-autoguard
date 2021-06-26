import * as serialization from "./serialization";
export declare function decodeURIComponent(string: string): string | undefined;
export declare function splitComponents(url: string): Array<string>;
export declare function combineComponents(components: Array<string>): string;
export declare function splitParameters(url: string): Array<[string, string]>;
export declare function combineParameters(parameters: Array<[string, string]>): string;
export declare function splitHeaders(lines: Array<string>): Array<[string, string]>;
export declare function escapeHeaderKey(string: string, alwaysEncode?: string): string;
export declare function escapeHeaderValue(string: string, alwaysEncode?: string): string;
export declare function encodeHeaderPairs(key: string, values: Array<JSON>, plain: boolean): Array<[string, string]>;
export declare function encodeUndeclaredHeaderPairs(record: Record<string, JSON>, exclude: Array<string>): Array<[string, string]>;
export declare function escapeComponent(string: string): string;
export declare function encodeComponents(values: Array<JSON>, plain: boolean): Array<string>;
export declare function escapeParameterKey(string: string): string;
export declare function escapeParameterValue(string: string): string;
export declare function encodeParameterPairs(key: string, values: Array<JSON>, plain: boolean): Array<[string, string]>;
export declare function encodeUndeclaredParameterPairs(record: Record<string, JSON>, exclude: Array<string>): Array<[string, string]>;
export declare function decodeParameterValues(pairs: Iterable<[string, string]>, key: string, plain: boolean): Array<JSON>;
export declare function decodeParameterValue(pairs: Iterable<[string, string]>, key: string, plain: boolean): JSON;
export declare function decodeUndeclaredParameters(pairs: Array<[string, string]>, exclude: Array<string>): Record<string, JSON>;
export declare function decodeHeaderValues(pairs: Iterable<[string, string]>, key: string, plain: boolean): Array<JSON>;
export declare function decodeHeaderValue(pairs: Iterable<[string, string]>, key: string, plain: boolean): JSON;
export declare function decodeUndeclaredHeaders(pairs: Array<[string, string]>, exclude: Array<string>): Record<string, JSON>;
export interface RouteMatcher {
    acceptComponent(component: string): boolean;
    getValue(): JSON;
    isSatisfied(): boolean;
}
export declare class StaticRouteMatcher implements RouteMatcher {
    private string;
    private accepted;
    constructor(string: string);
    acceptComponent(component: string): boolean;
    getValue(): JSON;
    isSatisfied(): boolean;
}
export declare class DynamicRouteMatcher<A> implements RouteMatcher {
    private minOccurences;
    private maxOccurences;
    private plain;
    private guard;
    private values;
    constructor(minOccurences: number, maxOccurences: number, plain: boolean, guard: serialization.MessageGuard<A>);
    acceptComponent(component: string): boolean;
    getValue(): JSON;
    isSatisfied(): boolean;
}
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
export declare const Binary: serialization.MessageGuard<AsyncBinary | SyncBinary>;
export declare type Binary = ReturnType<typeof Binary.as>;
export declare type Primitive = boolean | number | string | undefined;
export declare const Primitive: serialization.MessageGuard<Primitive>;
export declare type JSON = boolean | null | number | string | JSON[] | {
    [key: string]: JSON;
} | undefined;
export declare const JSON: serialization.MessageGuard<JSON>;
export declare const Options: serialization.MessageGuard<Record<string, JSON>>;
export declare const Headers: serialization.MessageGuard<Record<string, JSON>>;
export declare type RequestLike = AsyncBinary & {
    method?: string;
    rawHeaders: string[];
    socket: import("net").Socket | import("tls").TLSSocket;
    url?: string;
};
export declare type ResponseLike = {
    end(): void;
    once(type: string, callback: () => void): void;
    setHeader(key: string, value: string | Array<string>): void;
    write(payload: Uint8Array): boolean;
    writeHead(status: number, headers?: Record<string, string | Array<string>> | Array<string>): void;
};
export declare type RequestListener = (request: RequestLike, response: ResponseLike) => Promise<void>;
export declare function serializeValue(value: JSON, plain: boolean): string | undefined;
export declare function deserializeValue(value: string | undefined, plain: boolean): JSON;
export declare type RawRequest = {
    method: string;
    components: Array<string>;
    parameters: Array<[string, string]>;
    headers: Array<[string, string]>;
    payload: Binary;
};
export declare type Auxillary = {
    socket: RequestLike["socket"];
};
export declare type RawResponse = {
    status: number;
    headers: Array<[string, string]>;
    payload: Binary;
};
export declare type Endpoint = (raw: RawRequest, auxillary: Auxillary) => {
    acceptsComponents(): boolean;
    acceptsMethod(): boolean;
    validateRequest(): Promise<{
        handleRequest(): Promise<{
            validateResponse(): Promise<RawResponse>;
        }>;
    }>;
};
export declare type Payload = JSON | Binary;
export declare type CollectedPayload<A extends Payload> = A extends Binary ? Uint8Array : A;
export declare type EndpointRequest = {
    options?: Record<string, JSON>;
    headers?: Record<string, JSON>;
    payload?: Payload;
};
export declare type EndpointResponse = {
    status?: number;
    headers?: Record<string, JSON>;
    payload?: Payload;
};
export declare class ClientRequest<A extends EndpointRequest> {
    private request;
    private collect;
    private auxillary;
    private collectedPayload?;
    constructor(request: A, collect: boolean, auxillary: Auxillary);
    options(): {} & A["options"];
    headers(): {} & A["headers"];
    payload(): Promise<CollectedPayload<A["payload"]>>;
    socket(): Auxillary["socket"];
}
export declare class ServerResponse<A extends EndpointResponse> {
    private response;
    private collect;
    private collectedPayload?;
    constructor(response: A, collect: boolean);
    status(): number;
    headers(): {} & A["headers"];
    payload(): Promise<CollectedPayload<A["payload"]>>;
}
export declare class EndpointError {
    private response;
    constructor(response: Partial<RawResponse>);
    getResponse(): RawResponse;
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
export declare function serializePayload(payload: JSON): Binary;
export declare function compareArrays(one: Uint8Array, two: Uint8Array): boolean;
export declare function deserializeStringPayload(binary: Binary): Promise<string>;
export declare function deserializePayload(binary: Binary): Promise<JSON>;
export declare function finalizeResponse(raw: RawResponse, defaultContentType: string): RawResponse;
export declare function acceptsComponents(components: Array<string>, matchers: Array<RouteMatcher>): boolean;
export declare function acceptsMethod(one: string, two: string): boolean;
export declare type RequestHandler = (raw: RawRequest, urlPrefix?: string) => Promise<RawResponse>;
export declare function xhr(raw: RawRequest, urlPrefix?: string): Promise<RawResponse>;
export declare type NodeRequestHandlerOptions = Partial<Omit<import("https").RequestOptions, keyof import("http").RequestOptions>>;
export declare function makeNodeRequestHandler(options?: NodeRequestHandlerOptions): RequestHandler;
export declare function respond(httpResponse: ResponseLike, raw: Partial<RawResponse>): Promise<void>;
export declare function combineRawHeaders(raw: Array<string>): Array<string>;
export declare function route(endpoints: Array<Endpoint>, httpRequest: RequestLike, httpResponse: ResponseLike, urlPrefix?: string): Promise<void>;
export declare function parseRangeHeader(value: JSON, size: number): {
    status: number;
    offset: number;
    length: number;
    size: number;
};
export declare function getContentTypeFromExtension(extension: string): string | undefined;
export declare type DirectoryListing = {
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
export declare function makeDirectoryListing(pathPrefix: string, pathSuffix: string, request: ClientRequest<EndpointRequest>): DirectoryListing;
export declare function makeReadStreamResponse(pathPrefix: string, pathSuffix: string, request: ClientRequest<EndpointRequest>): EndpointResponse & {
    payload: Binary;
};
