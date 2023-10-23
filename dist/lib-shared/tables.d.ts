type ExpansionOf<A> = A extends infer B ? {
    [C in keyof B]: B[C];
} : never;
type IntersectionOfUnion<A> = (A extends any ? (_: A) => void : never) extends ((_: infer B) => void) ? B : never;
type Entry = {
    key: string;
    value: number | string;
};
type Entries = readonly Entry[];
type Keys<A extends Entries> = readonly [
    ...{
        [B in keyof A]: A[B]["key"];
    }
];
type Values<A extends Entries> = readonly [
    ...{
        [B in keyof A]: A[B]["value"];
    }
];
type KeyToValueMap<A extends Entries> = ExpansionOf<IntersectionOfUnion<{
    [B in keyof A]: {
        readonly [C in A[B]["key"]]: A[B]["value"];
    };
}[number]>>;
type ValueToKeyMap<A extends Entries> = ExpansionOf<IntersectionOfUnion<{
    [B in keyof A]: {
        readonly [C in A[B]["value"]]: A[B]["key"];
    };
}[number]>>;
export declare function createKeys<A extends Entries>(entries: A): Keys<A>;
export declare function createValues<A extends Entries>(entries: A): Values<A>;
export declare function createKeyToValueMap<A extends Entries>(entries: A): KeyToValueMap<A>;
export declare function createValueToKeyMap<A extends Entries>(entries: A): ValueToKeyMap<A>;
export {};
