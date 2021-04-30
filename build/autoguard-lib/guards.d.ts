import * as serialization from "./serialization";
declare type IntersectionOf<A extends any[]> = IntersectionOfUnion<UnionOf<A>>;
declare type IntersectionOfUnion<A> = (A extends any ? (_: A) => void : never) extends ((_: infer B) => void) ? B : never;
declare type TupleOf<A extends any[]> = [...A];
declare type UnionOf<A extends any[]> = A[number];
declare type RequiredKeys<A> = {
    [B in keyof A]: undefined extends A[B] ? never : B;
}[keyof A];
declare type OptionalKeys<A> = {
    [B in keyof A]: undefined extends A[B] ? B : never;
}[keyof A];
declare type MakeUndefinedOptional<A> = {
    [B in RequiredKeys<A>]: A[B];
} & {
    [B in OptionalKeys<A>]?: A[B];
};
export declare type Binary = AsyncIterable<Uint8Array> & {};
export declare const Any: {
    as(subject: any, path?: string): any;
    is(subject: any): subject is any;
};
export declare const Array: {
    of<A extends unknown>(guard: serialization.MessageGuard<A>): serialization.MessageGuard<A[]>;
};
export declare const Binary: {
    as(subject: any, path?: string): AsyncIterable<Uint8Array>;
    is(subject: any): subject is AsyncIterable<Uint8Array>;
};
export declare const Boolean: {
    as(subject: any, path?: string): boolean;
    is(subject: any): subject is boolean;
};
export declare const BooleanLiteral: {
    of<A extends boolean>(value: A): serialization.MessageGuard<A>;
};
export declare const Intersection: {
    of<A extends any[]>(...guards_0: serialization.MessageGuardTuple<A>): serialization.MessageGuard<IntersectionOfUnion<UnionOf<A>>>;
};
export declare const Null: {
    as(subject: any, path?: string): null;
    is(subject: any): subject is null;
};
export declare const Number: {
    as(subject: any, path?: string): number;
    is(subject: any): subject is number;
};
export declare const NumberLiteral: {
    of<A extends number>(value: A): serialization.MessageGuard<A>;
};
export declare const Object: {
    of<A extends import("@joelek/ts-stdlib/build/routing").MessageMap<A>>(guards: serialization.MessageGuardMap<A>): serialization.MessageGuard<MakeUndefinedOptional<A>>;
};
export declare const Record: {
    of<A extends unknown>(guard: serialization.MessageGuard<A>): serialization.MessageGuard<Record<string, A | undefined>>;
};
export declare const Reference: {
    of<A extends unknown>(guard: () => serialization.MessageGuard<A>): serialization.MessageGuard<A>;
};
export declare const String: {
    as(subject: any, path?: string): string;
    is(subject: any): subject is string;
};
export declare const StringLiteral: {
    of<A extends string>(value: A): serialization.MessageGuard<A>;
};
export declare const Tuple: {
    of<A extends any[]>(...guards_0: serialization.MessageGuardTuple<A>): serialization.MessageGuard<[...A]>;
};
export declare const Undefined: {
    as(subject: any, path?: string): undefined;
    is(subject: any): subject is undefined;
};
export declare const Union: {
    of<A extends any[]>(...guards_0: serialization.MessageGuardTuple<A>): serialization.MessageGuard<UnionOf<A>>;
};
export {};
