import * as tokenization from "./tokenization";
export declare type Typename = "Array" | "Intersection" | "Union";
export declare type Options = {
    eol: string;
    standalone: boolean;
};
export interface Type {
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
}
export declare const Type: {
    parse(tokenizer: tokenization.Tokenizer, ...exclude: Typename[]): Type;
};
export declare class AnyType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: AnyType;
    static parse(tokenizer: tokenization.Tokenizer): AnyType;
}
export declare class ArrayType implements Type {
    private type;
    constructor(type: Type);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokenizer: tokenization.Tokenizer, ...exclude: Typename[]): ArrayType;
}
export declare class BooleanType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: BooleanType;
    static parse(tokenizer: tokenization.Tokenizer): BooleanType;
}
export declare class BooleanLiteralType implements Type {
    private value;
    constructor(value: boolean);
    generateType(options: Options): string;
    static readonly INSTANCE_TRUE: BooleanLiteralType;
    static readonly INSTANCE_FALSE: BooleanLiteralType;
    generateTypeGuard(options: Options): string;
    static parse(tokenizer: tokenization.Tokenizer): BooleanLiteralType;
}
export declare class GroupType implements Type {
    private type;
    constructor(type: Type);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokenizer: tokenization.Tokenizer): GroupType;
}
export declare class IntersectionType implements Type {
    private types;
    constructor();
    add(type: Type): this;
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokenizer: tokenization.Tokenizer, ...exclude: Typename[]): Type;
}
export declare class NullType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: NullType;
    static parse(tokenizer: tokenization.Tokenizer): NullType;
}
export declare class NumberType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: NumberType;
    static parse(tokenizer: tokenization.Tokenizer): NumberType;
}
export declare class NumberLiteralType implements Type {
    private value;
    constructor(value: number);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokenizer: tokenization.Tokenizer): NumberLiteralType;
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
    static parse(tokenizer: tokenization.Tokenizer): ObjectType;
}
export declare class RecordType implements Type {
    private type;
    constructor(type: Type);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokenizer: tokenization.Tokenizer): RecordType;
}
export declare class ReferenceType implements Type {
    private typename;
    constructor(typename: string);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokenizer: tokenization.Tokenizer): ReferenceType;
}
export declare class StringType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: StringType;
    static parse(tokenizer: tokenization.Tokenizer): StringType;
}
export declare class StringLiteralType implements Type {
    private value;
    constructor(value: string);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokenizer: tokenization.Tokenizer): StringLiteralType;
}
export declare class TupleType implements Type {
    private types;
    constructor();
    add(type: Type): this;
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokenizer: tokenization.Tokenizer): TupleType;
}
export declare class UndefinedType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: UndefinedType;
    static parse(tokenizer: tokenization.Tokenizer): UndefinedType;
}
export declare class UnionType implements Type {
    private types;
    constructor();
    add(type: Type): this;
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokenizer: tokenization.Tokenizer, ...exclude: Array<Typename>): Type;
}
export declare class Schema {
    private types;
    constructor();
    add(key: string, value: Type): this;
    generateModule(options: Options): string;
    static parse(tokenizer: tokenization.Tokenizer): Schema;
}
