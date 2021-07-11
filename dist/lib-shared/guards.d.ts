import * as serialization from "./serialization";
declare type IntersectionOf<A extends any[]> = ExpansionOf<Unwrap<IntersectionOfUnion<ValuesOf<Wrap<A>>>>>;
declare type IntersectionOfUnion<A> = (A extends any ? (_: A) => void : never) extends ((_: infer B) => void) ? B : never;
declare type TupleOf<A extends any[]> = [...A];
declare type UnionOf<A extends any[]> = A[number];
declare type RequiredKeys<A> = {
    [B in keyof A]: undefined extends A[B] ? never : B;
}[keyof A];
declare type OptionalKeys<A> = {
    [B in keyof A]: undefined extends A[B] ? B : never;
}[keyof A];
declare type MakeUndefinedOptional<A> = ExpansionOf<{
    [B in RequiredKeys<A>]: A[B];
} & {
    [B in OptionalKeys<A>]?: A[B];
}>;
declare type IndicesOfTuple<A extends any[]> = Exclude<keyof A, keyof []>;
declare type Wrap<A extends any[]> = {
    [B in IndicesOfTuple<A>]: {
        wrappee: A[B];
    };
};
declare type Unwrap<A> = A extends {
    wrappee: any;
} ? A["wrappee"] : never;
declare type ValuesOf<A> = A[keyof A];
declare type ExpansionOf<A> = A extends infer B ? {
    [C in keyof B]: B[C];
} : never;
export declare const Any: {
    as(subject: any, path?: string): any;
    is(subject: any): subject is any;
    ts(eol?: string): string;
};
export declare const Array: {
    of<A extends unknown>(guard: serialization.MessageGuard<A>): serialization.MessageGuard<A[]>;
};
export declare const Boolean: {
    as(subject: any, path?: string): boolean;
    is(subject: any): subject is boolean;
    ts(eol?: string): string;
};
export declare const BooleanLiteral: {
    of<A extends boolean>(value: A): serialization.MessageGuard<A>;
};
export declare const Group: {
    of<A extends unknown>(guard: serialization.MessageGuard<A>, name?: string | undefined): serialization.MessageGuard<A>;
};
export declare const Intersection: {
    of<A extends any[]>(...guards_0: serialization.MessageGuardTuple<A>): serialization.MessageGuard<ExpansionOf<Unwrap<IntersectionOfUnion<ValuesOf<Wrap<A>>>>>>;
};
export declare const Null: {
    as(subject: any, path?: string): null;
    is(subject: any): subject is null;
    ts(eol?: string): string;
};
export declare const Number: {
    as(subject: any, path?: string): number;
    is(subject: any): subject is number;
    ts(eol?: string): string;
};
export declare const NumberLiteral: {
    of<A extends number>(value: A): serialization.MessageGuard<A>;
};
export declare const Object: {
    of<A extends import("@joelek/ts-stdlib/dist/lib/routing").MessageMap<A>>(guards: serialization.MessageGuardMap<A>): serialization.MessageGuard<ExpansionOf<{ [B in RequiredKeys<A>]: A[B]; } & { [B_1 in OptionalKeys<A>]?: A[B_1] | undefined; }>>;
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
    ts(eol?: string): string;
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
    ts(eol?: string): string;
};
export declare const Union: {
    of<A extends any[]>(...guards_0: serialization.MessageGuardTuple<A>): serialization.MessageGuard<UnionOf<A>>;
};
export {};
