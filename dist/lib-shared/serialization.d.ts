import * as stdlib from "@joelek/ts-stdlib";
export declare type Message = stdlib.routing.Message;
export declare type MessageMap<A> = stdlib.routing.MessageMap<A>;
export declare type MessageGuard<A extends stdlib.routing.Message> = {
    as(subject: any, path?: string): A;
    is(subject: any, path?: string): subject is A;
    ts(eol?: string): string;
};
export interface MessageCodec {
    decode(buffer: Uint8Array): Message;
    encode(subject: Message): Uint8Array;
}
export declare abstract class MessageGuardBase<A extends Message> implements MessageGuard<A> {
    constructor();
    abstract as(subject: any, path?: string): A;
    abstract ts(eol?: string): string;
    is(subject: any, path?: string): subject is A;
    decode(codec: MessageCodec, buffer: Uint8Array): A;
    encode(codec: MessageCodec, subject: A): Uint8Array;
}
export declare class MessageGuardError<A extends Message> {
    private guard;
    private subject;
    private path;
    constructor(guard: MessageGuard<A>, subject: any, path: string);
    private getSubjectType;
    toString(): string;
}
export declare type MessageGuardTuple<A extends stdlib.routing.Message[]> = {
    [B in keyof A]: MessageGuard<A[B]>;
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
