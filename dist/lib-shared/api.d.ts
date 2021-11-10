import * as guards from "./guards";
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
export declare type AsyncBinary = AsyncIterable<Uint8Array>;
export declare const AsyncBinary: serialization.MessageGuard<AsyncBinary>;
export declare type SyncBinary = Iterable<Uint8Array>;
export declare const SyncBinary: serialization.MessageGuard<SyncBinary>;
export declare const Binary: guards.UnionGuard<[AsyncBinary, SyncBinary]>;
export declare type Binary = ReturnType<typeof Binary.as>;
export declare type Primitive = boolean | number | string | undefined;
export declare const Primitive: serialization.MessageGuard<Primitive>;
export declare type JSON = boolean | null | number | string | JSON[] | {
    [key: string]: JSON;
} | undefined;
export declare const JSON: serialization.MessageGuard<JSON>;
export declare const Options: guards.RecordGuard<JSON>;
export declare const Headers: guards.RecordGuard<JSON>;
export declare function serializeValue(value: JSON, plain: boolean): string | undefined;
export declare function deserializeValue(value: string | undefined, plain: boolean): JSON;
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
export declare type RequestMap<A extends RequestMap<A>> = {
    [B in keyof A]: EndpointRequest;
};
export declare type ResponseMap<A extends ResponseMap<A>> = {
    [B in keyof A]: EndpointResponse;
};
export declare function collectPayload(binary: Binary): Promise<Uint8Array>;
export declare function serializeStringPayload(string: string): Binary;
export declare function serializePayload(payload: JSON): Binary;
export declare function compareArrays(one: Uint8Array, two: Uint8Array): boolean;
export declare function deserializeStringPayload(binary: Binary): Promise<string>;
export declare function deserializePayload(binary: Binary): Promise<JSON>;
export declare function wrapMessageGuard<A>(guard: serialization.MessageGuard<A>, log?: boolean): serialization.MessageGuard<A>;
export declare type ClientOptions = {
    urlPrefix?: string;
    requestHandler?: RequestHandler;
    defaultHeaders?: Array<[string, string]>;
    debugMode?: boolean;
};
export declare type ServerOptions = {
    urlPrefix?: string;
    defaultHeaders?: Array<[string, string]>;
    debugMode?: boolean;
};
export declare type RequestHandler = (raw: RawRequest, clientOptions?: ClientOptions) => Promise<RawResponse>;
