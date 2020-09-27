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
    parse(tokens: Array<tokenization.Token>, ...exclude: Typename[]): Type;
};
export declare class AnyType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: AnyType;
    static parse(tokens: Array<tokenization.Token>): AnyType;
}
export declare class ArrayType implements Type {
    private type;
    constructor(type: Type);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokens: Array<tokenization.Token>, ...exclude: Typename[]): ArrayType;
}
export declare class BooleanType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: BooleanType;
    static parse(tokens: Array<tokenization.Token>): BooleanType;
}
export declare class BooleanLiteralType implements Type {
    private value;
    constructor(value: boolean);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokens: Array<tokenization.Token>): BooleanLiteralType;
}
export declare class GroupType implements Type {
    private type;
    constructor(type: Type);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokens: Array<tokenization.Token>): GroupType;
}
export declare class IntersectionType implements Type {
    private types;
    constructor();
    add(type: Type): this;
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokens: Array<tokenization.Token>, ...exclude: Typename[]): IntersectionType;
}
export declare class NullType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: NullType;
    static parse(tokens: Array<tokenization.Token>): NullType;
}
export declare class NumberType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: NumberType;
    static parse(tokens: Array<tokenization.Token>): NumberType;
}
export declare class NumberLiteralType implements Type {
    private value;
    constructor(value: number);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokens: Array<tokenization.Token>): NumberLiteralType;
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
    static parse(tokens: Array<tokenization.Token>): ObjectType;
}
export declare class RecordType implements Type {
    private type;
    constructor(type: Type);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokens: Array<tokenization.Token>): RecordType;
}
export declare class ReferenceType implements Type {
    private typename;
    constructor(typename: string);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokens: Array<tokenization.Token>): ReferenceType;
}
export declare class StringType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: StringType;
    static parse(tokens: Array<tokenization.Token>): StringType;
}
export declare class StringLiteralType implements Type {
    private value;
    constructor(value: string);
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokens: Array<tokenization.Token>): StringLiteralType;
}
export declare class TupleType implements Type {
    private types;
    constructor();
    add(type: Type): this;
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokens: Array<tokenization.Token>): TupleType;
}
export declare class UndefinedType implements Type {
    constructor();
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static readonly INSTANCE: UndefinedType;
    static parse(tokens: Array<tokenization.Token>): UndefinedType;
}
export declare class UnionType implements Type {
    private types;
    constructor();
    add(type: Type): this;
    generateType(options: Options): string;
    generateTypeGuard(options: Options): string;
    static parse(tokens: Array<tokenization.Token>, ...exclude: Array<Typename>): UnionType;
}
export declare class Schema {
    private types;
    constructor();
    add(key: string, value: Type): this;
    generateModule(options: Options): string;
    static parse(tokens: Array<tokenization.Token>): Schema;
}
