import * as stdlib from "@joelek/ts-stdlib";
export declare type MessageGuard<A extends stdlib.routing.Message> = {
    as(subject: any, path?: string): A;
    is(subject: any, path?: string): subject is A;
};
export declare type MessageGuardMap<A extends stdlib.routing.MessageMap<A>> = {
    [B in keyof A]: MessageGuard<A[B]>;
};
export declare class MessageSerializer<A extends stdlib.routing.MessageMap<A>> {
    private guards;
    constructor(guards: MessageGuardMap<A>);
    deserialize<B extends keyof A>(string: string, cb: {
        (type: B, data: A[B]): void;
    }): void;
    serialize<B extends keyof A>(type: B, data: A[B]): string;
}
