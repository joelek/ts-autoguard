import * as shared from "../lib-shared";
export * from "../lib-shared/api";
export declare class ServerResponse<A extends shared.api.EndpointResponse> {
    private response;
    private collect;
    private collectedPayload?;
    constructor(response: A, collect: boolean);
    status(): number;
    headers(): {} & A["headers"];
    payload(): Promise<shared.api.CollectedPayload<A["payload"]>>;
}
export declare type Client<A extends shared.api.RequestMap<A>, B extends shared.api.ResponseMap<B>> = {
    [C in keyof A & keyof B]: (request: A[C]) => Promise<ServerResponse<B[C]>>;
};
export declare function xhr(raw: shared.api.RawRequest, urlPrefix?: string): Promise<shared.api.RawResponse>;
