/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import * as libhttp from "http";
import * as libhttps from "https";
import * as libnet from "net";
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
        }>;
    }>;
};
export declare class EndpointError {
    private response;
    constructor(response: Partial<shared.api.RawResponse>);
    getResponse(): shared.api.RawResponse;
}
export declare class ClientRequest<A extends shared.api.EndpointRequest> {
    private request;
    private collect;
    private auxillary;
    private collectedPayload?;
    constructor(request: A, collect: boolean, auxillary: Auxillary);
    options(): {} & A["options"];
    headers(): {} & A["headers"];
    payload(): Promise<shared.api.CollectedPayload<A["payload"]>>;
    socket(): Auxillary["socket"];
}
export type Server<A extends shared.api.RequestMap<A>, B extends shared.api.ResponseMap<B>> = {
    [C in keyof A & keyof B]: (request: ClientRequest<A[C]>) => Promise<B[C]>;
};
export interface RouteMatcher {
    acceptComponent(component: string): boolean;
    getValue(): shared.api.JSON;
    isSatisfied(): boolean;
}
export declare class StaticRouteMatcher implements RouteMatcher {
    private string;
    private accepted;
    constructor(string: string);
    acceptComponent(component: string): boolean;
    getValue(): shared.api.JSON;
    isSatisfied(): boolean;
}
export declare class DynamicRouteMatcher<A> implements RouteMatcher {
    private minOccurences;
    private maxOccurences;
    private plain;
    private guard;
    private values;
    constructor(minOccurences: number, maxOccurences: number, plain: boolean, guard: shared.serialization.MessageGuard<A>);
    acceptComponent(component: string): boolean;
    getValue(): shared.api.JSON;
    isSatisfied(): boolean;
}
export declare function combineNodeRawHeaders(raw: Array<string>): Array<string>;
export type NodeRequestHandlerOptions = Partial<Omit<libhttps.RequestOptions, keyof libhttp.RequestOptions>>;
export declare function makeNodeRequestHandler(options?: NodeRequestHandlerOptions): shared.api.RequestHandler;
export declare function acceptsComponents(components: Array<string>, matchers: Array<RouteMatcher>): boolean;
export declare function acceptsMethod(one: string, two: string): boolean;
export declare function finalizeResponse(raw: shared.api.RawResponse, defaultHeaders: Array<[string, string]>): Promise<shared.api.RawResponse>;
export declare function respond(httpResponse: ResponseLike, raw: Partial<shared.api.RawResponse>, serverOptions?: shared.api.ServerOptions): Promise<void>;
export declare function route(endpoints: Array<Endpoint>, httpRequest: RequestLike, httpResponse: ResponseLike, serverOptions?: shared.api.ServerOptions): Promise<void>;
export declare function parseRangeHeader(value: shared.api.JSON, size: number): {
    status: number;
    offset: number;
    length: number;
    size: number;
};
export declare function getContentTypeFromExtension(extension: string): string | undefined;
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
export declare function makeDirectoryListing(pathPrefix: string, pathSuffix: string, request: ClientRequest<shared.api.EndpointRequest>): DirectoryListing;
export declare function makeReadStreamResponse(pathPrefix: string, pathSuffix: string, request: ClientRequest<shared.api.EndpointRequest>): shared.api.EndpointResponse & {
    payload: shared.api.Binary;
};
