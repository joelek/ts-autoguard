export declare class Identifier {
    static parse(string: string): string;
}
export declare class StringLiteral {
    static parse(string: string): string;
}
export declare type Options = {
    eol: string;
    standalone: boolean;
};
export interface Type {
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
}
export declare const Type: {
    parse(string: string): Type;
};
export declare class AnyType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: AnyType;
    static parse(string: string): Type;
}
export declare class ArrayType implements Type {
    private type;
    constructor(type: Type);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(string: string): Type;
}
export declare class BooleanType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: BooleanType;
    static parse(string: string): Type;
}
export declare class BooleanLiteralType implements Type {
    private value;
    constructor(value: boolean);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(string: string): Type;
}
export declare class IntersectionType implements Type {
    private types;
    constructor();
    add(type: Type): this;
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(string: string): Type;
}
export declare class NullType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: NullType;
    static parse(string: string): Type;
}
export declare class NumberType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: NumberType;
    static parse(string: string): Type;
}
export declare class NumberLiteralType implements Type {
    private value;
    constructor(value: number);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(string: string): Type;
}
export declare class ObjectKey {
    static parse(string: string): string;
}
export declare type ObjectMember = {
    type: Type;
    optional: boolean;
};
export declare class ObjectType implements Type {
    private members;
    constructor();
    add(key: string, value: ObjectMember): this;
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    [Symbol.iterator](): Iterator<[string, ObjectMember]>;
    static parse(string: string): ObjectType;
}
export declare class RecordType implements Type {
    private type;
    constructor(type: Type);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(string: string): Type;
}
export declare class ReferenceType implements Type {
    private typename;
    constructor(typename: string);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(string: string): Type;
}
export declare class StringType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: StringType;
    static parse(string: string): Type;
}
export declare class StringLiteralType implements Type {
    private value;
    constructor(value: string);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(string: string): Type;
}
export declare class TupleType implements Type {
    private types;
    constructor();
    add(type: Type): this;
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(string: string): Type;
}
export declare class UndefinedType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: UndefinedType;
    static parse(string: string): Type;
}
export declare class UnionType implements Type {
    private types;
    constructor();
    add(type: Type): this;
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(string: string): Type;
}
export declare class Schema {
    private types;
    constructor();
    add(key: string, value: Type): this;
    generateModule(options: Options): string;
    static parse(string: string): Schema;
}
