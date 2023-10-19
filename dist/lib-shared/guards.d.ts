import * as serialization from "./serialization";
type IntersectionOf<A extends any[]> = ExpansionOf<Unwrap<IntersectionOfUnion<ValuesOf<Wrap<A>>>>>;
type IntersectionOfUnion<A> = (A extends any ? (_: A) => void : never) extends ((_: infer B) => void) ? B : never;
type TupleOf<A extends any[]> = [...A];
type UnionOf<A extends any[]> = A[number];
type IndicesOfTuple<A extends any[]> = Exclude<keyof A, keyof []>;
type Wrap<A extends any[]> = {
    [B in IndicesOfTuple<A>]: {
        wrappee: A[B];
    };
};
type Unwrap<A> = A extends {
    wrappee: any;
} ? A["wrappee"] : never;
type ValuesOf<A> = A[keyof A];
type ExpansionOf<A> = A extends infer B ? {
    [C in keyof B]: B[C];
} : never;
type ObjectOf<A, B> = ExpansionOf<A & Partial<B>>;
export type Any = any;
export declare class AnyGuard extends serialization.MessageGuardBase<Any> {
    constructor();
    as(subject: any, path?: string): Any;
    ts(eol?: string): string;
}
export declare const Any: AnyGuard;
export type Array<A extends serialization.Message> = globalThis.Array<A>;
export declare class ArrayGuard<A extends serialization.Message> extends serialization.MessageGuardBase<Array<A>> {
    readonly guard: serialization.MessageGuard<A>;
    constructor(guard: serialization.MessageGuard<A>);
    as(subject: any, path?: string): Array<A>;
    ts(eol?: string): string;
}
export declare const Array: {
    of<A extends unknown>(guard: serialization.MessageGuardBase<A>): ArrayGuard<A>;
};
export type BigInt = bigint;
export declare class BigIntGuard extends serialization.MessageGuardBase<BigInt> {
    constructor();
    as(subject: any, path?: string): BigInt;
    ts(eol?: string): string;
}
export declare const BigInt: BigIntGuard;
export type Binary = Uint8Array;
export declare class BinaryGuard extends serialization.MessageGuardBase<Binary> {
    constructor();
    as(subject: any, path?: string): Binary;
    ts(eol?: string): string;
}
export declare const Binary: BinaryGuard;
export type Boolean = boolean;
export declare class BooleanGuard extends serialization.MessageGuardBase<Boolean> {
    constructor();
    as(subject: any, path?: string): Boolean;
    ts(eol?: string): string;
}
export declare const Boolean: BooleanGuard;
export type BooleanLiteral<A extends boolean> = A;
export declare class BooleanLiteralGuard<A extends boolean> extends serialization.MessageGuardBase<BooleanLiteral<A>> {
    readonly value: A;
    constructor(value: A);
    as(subject: any, path?: string): BooleanLiteral<A>;
    ts(eol?: string): string;
}
export declare const BooleanLiteral: {
    of<A extends boolean>(value: A): BooleanLiteralGuard<A>;
};
export type Group<A extends serialization.Message> = A;
export declare class GroupGuard<A extends serialization.Message> extends serialization.MessageGuardBase<Group<A>> {
    readonly guard: serialization.MessageGuard<A>;
    readonly name?: string;
    constructor(guard: serialization.MessageGuard<A>, name?: string);
    as(subject: any, path?: string): Group<A>;
    ts(eol?: string): string;
}
export declare const Group: {
    of<A extends unknown>(guard: serialization.MessageGuard<A>, name?: string): GroupGuard<A>;
};
export type Integer = number;
export declare class IntegerGuard extends serialization.MessageGuardBase<Integer> {
    readonly min?: number;
    readonly max?: number;
    constructor(min?: number, max?: number);
    as(subject: any, path?: string): Integer;
    ts(eol?: string): string;
}
export declare const Integer: IntegerGuard;
export type IntegerLiteral<A extends number> = A;
export declare class IntegerLiteralGuard<A extends number> extends serialization.MessageGuardBase<IntegerLiteral<A>> {
    readonly value: A;
    constructor(value: A);
    as(subject: any, path?: string): IntegerLiteral<A>;
    ts(eol?: string): string;
}
export declare const IntegerLiteral: {
    of<A extends number>(value: A): IntegerLiteralGuard<A>;
};
export type Intersection<A extends TupleOf<serialization.MessageMap<any>[]>> = IntersectionOf<A>;
export declare class IntersectionGuard<A extends TupleOf<serialization.MessageMap<any>[]>> extends serialization.MessageGuardBase<Intersection<A>> {
    readonly guards: TupleOf<serialization.MessageGuardTuple<A>>;
    constructor(...guards: TupleOf<serialization.MessageGuardTuple<A>>);
    as(subject: any, path?: string): Intersection<A>;
    ts(eol?: string): string;
}
export declare const Intersection: {
    of<A extends import("@joelek/ts-stdlib/dist/lib/routing").MessageMap<any>[]>(...guards_0: serialization.MessageGuardTuple<A>): IntersectionGuard<A>;
};
export type Null = null;
export declare class NullGuard extends serialization.MessageGuardBase<Null> {
    constructor();
    as(subject: any, path?: string): Null;
    ts(eol?: string): string;
}
export declare const Null: NullGuard;
export type Number = number;
export declare class NumberGuard extends serialization.MessageGuardBase<Number> {
    readonly min?: number;
    readonly max?: number;
    constructor(min?: number, max?: number);
    as(subject: any, path?: string): Number;
    ts(eol?: string): string;
}
export declare const Number: NumberGuard;
export type NumberLiteral<A extends number> = A;
export declare class NumberLiteralGuard<A extends number> extends serialization.MessageGuardBase<NumberLiteral<A>> {
    readonly value: A;
    constructor(value: A);
    as(subject: any, path?: string): NumberLiteral<A>;
    ts(eol?: string): string;
}
export declare const NumberLiteral: {
    of<A extends number>(value: A): NumberLiteralGuard<A>;
};
export type Object<A extends serialization.MessageMap<A>, B extends serialization.MessageMap<B> = {}> = ObjectOf<A, B>;
export declare class ObjectGuard<A extends serialization.MessageMap<A>, B extends serialization.MessageMap<B> = {}> extends serialization.MessageGuardBase<Object<A, B>> {
    readonly required: serialization.MessageGuardMap<A>;
    readonly optional: serialization.MessageGuardMap<B>;
    constructor(required: serialization.MessageGuardMap<A>, optional: serialization.MessageGuardMap<B>);
    as(subject: any, path?: string): Object<A, B>;
    ts(eol?: string): string;
}
export declare const Object: {
    of<A extends import("@joelek/ts-stdlib/dist/lib/routing").MessageMap<A>, B extends import("@joelek/ts-stdlib/dist/lib/routing").MessageMap<B> = {}>(required: serialization.MessageGuardMap<A>, optional?: serialization.MessageGuardMap<B>): ObjectGuard<A, B>;
};
export type Record<A extends serialization.Message> = globalThis.Record<string, undefined | A>;
export declare class RecordGuard<A extends serialization.Message> extends serialization.MessageGuardBase<Record<A>> {
    readonly guard: serialization.MessageGuard<A>;
    constructor(guard: serialization.MessageGuard<A>);
    as(subject: any, path?: string): Record<A>;
    ts(eol?: string): string;
}
export declare const Record: {
    of<A extends unknown>(guard: serialization.MessageGuard<A>): RecordGuard<A>;
};
export type Reference<A extends serialization.Message> = A;
export declare class ReferenceGuard<A extends serialization.Message> extends serialization.MessageGuardBase<Reference<A>> {
    readonly guard: () => serialization.MessageGuard<A>;
    constructor(guard: () => serialization.MessageGuard<A>);
    as(subject: any, path?: string): Reference<A>;
    ts(eol?: string): string;
}
export declare const Reference: {
    of<A extends unknown>(guard: () => serialization.MessageGuard<A>): ReferenceGuard<A>;
};
export type String = string;
export declare class StringGuard extends serialization.MessageGuardBase<String> {
    readonly pattern?: RegExp;
    constructor(pattern?: RegExp);
    as(subject: any, path?: string): String;
    ts(eol?: string): string;
}
export declare const String: StringGuard;
export type StringLiteral<A extends string> = A;
export declare class StringLiteralGuard<A extends string> extends serialization.MessageGuardBase<StringLiteral<A>> {
    readonly value: A;
    constructor(value: A);
    as(subject: any, path?: string): StringLiteral<A>;
    ts(eol?: string): string;
}
export declare const StringLiteral: {
    of<A extends string>(value: A): StringLiteralGuard<A>;
};
export type Tuple<A extends TupleOf<serialization.Message>> = TupleOf<A>;
export declare class TupleGuard<A extends TupleOf<serialization.Message>> extends serialization.MessageGuardBase<Tuple<A>> {
    readonly guards: TupleOf<serialization.MessageGuardTuple<A>>;
    constructor(...guards: TupleOf<serialization.MessageGuardTuple<A>>);
    as(subject: any, path?: string): Tuple<A>;
    ts(eol?: string): string;
}
export declare const Tuple: {
    of<A extends any[]>(...guards_0: serialization.MessageGuardTuple<A>): TupleGuard<A>;
};
export type Undefined = undefined;
export declare class UndefinedGuard extends serialization.MessageGuardBase<Undefined> {
    constructor();
    as(subject: any, path?: string): Undefined;
    ts(eol?: string): string;
}
export declare const Undefined: UndefinedGuard;
export type Union<A extends TupleOf<serialization.Message>> = UnionOf<A>;
export declare class UnionGuard<A extends TupleOf<serialization.Message>> extends serialization.MessageGuardBase<Union<A>> {
    readonly guards: TupleOf<serialization.MessageGuardTuple<A>>;
    constructor(...guards: TupleOf<serialization.MessageGuardTuple<A>>);
    as(subject: any, path?: string): Union<A>;
    ts(eol?: string): string;
}
export declare const Union: {
    of<A extends any[]>(...guards_0: serialization.MessageGuardTuple<A>): UnionGuard<A>;
};
export {};
