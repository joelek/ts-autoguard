export declare type Primitive = boolean | number | string;
export declare type JSON = null | Primitive | JSON[] | {
    [key: string]: JSON;
};
export declare type RequestLike = {
    [Symbol.asyncIterator](): AsyncIterableIterator<any>;
    method?: string;
    rawHeaders: string[];
    url?: string;
};
export declare type ResponseLike = {
    end(): void;
    setHeader(key: string, value: string): void;
    write(payload: string): void;
    writeHead(status: number): void;
};
export declare type RequestListener = (request: RequestLike, response: ResponseLike) => void;
export declare function serializeComponents(components: Array<string>): string;
export declare function extractKeyValuePairs(record: Record<string, Primitive | undefined>): Array<[string, string]>;
export declare function serializeParameters(parameters: Array<[string, string]>): string;
export declare function getOptionalString(pairs: Iterable<[string, string]>, key: string): string | undefined;
export declare function getRequiredString(pairs: Iterable<[string, string]>, key: string): string;
export declare function getOptionalNumber(pairs: Iterable<[string, string]>, key: string): number | undefined;
export declare function getRequiredNumber(pairs: Iterable<[string, string]>, key: string): number;
export declare function getOptionalBoolean(pairs: Iterable<[string, string]>, key: string): boolean | undefined;
export declare function getRequiredBoolean(pairs: Iterable<[string, string]>, key: string): boolean;
export declare type RawRequest = {
    method: string;
    components: Array<string>;
    parameters: Array<[string, string]>;
    headers: Array<[string, string]>;
    payload?: string;
};
export declare type RawResponse = {
    status: number;
    headers: Array<[string, string]>;
    payload?: string;
};
export declare type Endpoint = (raw: RawRequest) => {
    acceptsComponents(): boolean;
    acceptsMethod(): boolean;
    prepareRequest(): {
        handleRequest(): Promise<EndpointResponse>;
    };
};
export declare function getComponents(url: string): Array<string>;
export declare function getParameters(url: string): Array<[string, string]>;
export declare function getHeaders(headers: Array<string>): Array<[string, string]>;
export declare type EndpointResponse = {
    status?: number;
    headers?: Record<string, Primitive | undefined>;
    payload?: JSON;
};
export declare function transformResponse<A extends EndpointResponse>(response: A): RawResponse;
export declare function acceptsComponents(one: Array<string>, two: Array<[string, string]>): boolean;
export declare function acceptsMethod(one: string, two: string): boolean;
export declare function fetch(method: string, url: string, headers: Array<[string, string]>, payload: string | undefined): Promise<RawResponse>;
export declare function route(endpoints: Array<Endpoint>, httpRequest: RequestLike, httpResponse: ResponseLike): Promise<void>;
