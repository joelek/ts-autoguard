export declare type Primitive = boolean | number | string;
export declare type JSON = null | Primitive | JSON[] | {
    [key: string]: JSON;
};
export declare type Binary = AsyncIterable<Uint8Array>;
export declare type RequestLike = {
    [Symbol.asyncIterator](): AsyncIterableIterator<any>;
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
export declare type RequestListener = (request: RequestLike, response: ResponseLike) => void;
export declare function serializeComponents(components: Array<string>): string;
export declare function extractKeyValuePairs(record: Record<string, Primitive | undefined>): Array<[string, string]>;
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
    prepareRequest(): Promise<{
        handleRequest(): Promise<EndpointResponse>;
    }>;
};
export declare function getComponents(url: string): Array<string>;
export declare function getParameters(url: string): Array<[string, string]>;
export declare function getHeaders(headers: Array<string>): Array<[string, string]>;
export declare type EndpointResponse = {
    status?: number;
    headers?: Record<string, Primitive | undefined>;
    payload?: JSON | Binary;
};
export declare function wrapArray(array: Uint8Array): Binary;
export declare function unwrapArray(binary: Binary): Promise<Uint8Array>;
export declare function serializePayload(payload: JSON | undefined): Binary;
export declare function deserializePayload(binary: Binary): Promise<JSON | undefined>;
export declare function transformResponse<A extends EndpointResponse>(response: A): RawResponse;
export declare function acceptsComponents(one: Array<string>, two: Array<[string, string]>): boolean;
export declare function acceptsMethod(one: string, two: string): boolean;
export declare function fetch(method: string, url: string, headers: Array<[string, string]>, payload: Binary): Promise<RawResponse>;
export declare function sendPayload(httpResponse: ResponseLike, payload: Binary): Promise<void>;
export declare function route(endpoints: Array<Endpoint>, httpRequest: RequestLike, httpResponse: ResponseLike): Promise<void>;
