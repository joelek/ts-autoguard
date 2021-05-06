import * as shared from "../shared";
import * as tokenization from "../tokenization";
export declare type Typename = "Array" | "Intersection" | "Union";
export interface Type {
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
}
export declare const Type: {
    parse(tokenizer: tokenization.Tokenizer, ...exclude: Typename[]): Type;
};
export declare class AnyType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static readonly INSTANCE: AnyType;
    static parse(tokenizer: tokenization.Tokenizer): AnyType;
}
export declare class ArrayType implements Type {
    type: Type;
    constructor(type: Type);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static parse(tokenizer: tokenization.Tokenizer, ...exclude: Typename[]): ArrayType;
}
export declare class Binary implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): shared.Import[];
    static readonly INSTANCE: Binary;
    static parse(tokenizer: tokenization.Tokenizer): UndefinedType;
}
export declare class BooleanType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static readonly INSTANCE: BooleanType;
    static parse(tokenizer: tokenization.Tokenizer): BooleanType;
}
export declare class BooleanLiteralType implements Type {
    value: boolean;
    constructor(value: boolean);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static readonly INSTANCE_TRUE: BooleanLiteralType;
    static readonly INSTANCE_FALSE: BooleanLiteralType;
    static parse(tokenizer: tokenization.Tokenizer): BooleanLiteralType;
}
export declare class GroupType implements Type {
    type: Type;
    constructor(type: Type);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static parse(tokenizer: tokenization.Tokenizer): GroupType;
}
export declare class IntersectionType implements Type {
    types: Set<Type>;
    constructor(types?: Iterable<Type>);
    add(type: Type): this;
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static parse(tokenizer: tokenization.Tokenizer, ...exclude: Typename[]): Type;
}
export declare class NullType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static readonly INSTANCE: NullType;
    static parse(tokenizer: tokenization.Tokenizer): NullType;
}
export declare class NumberType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static readonly INSTANCE: NumberType;
    static parse(tokenizer: tokenization.Tokenizer): NumberType;
}
export declare class NumberLiteralType implements Type {
    value: number;
    constructor(value: number);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static parse(tokenizer: tokenization.Tokenizer): NumberLiteralType;
}
export declare type ObjectMember = {
    type: Type;
    optional: boolean;
};
export declare class ObjectType implements Type {
    members: Map<string, ObjectMember>;
    constructor(members?: Iterable<[string, ObjectMember]>);
    add(key: string, value: ObjectMember): this;
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static parse(tokenizer: tokenization.Tokenizer): ObjectType;
}
export declare class RecordType implements Type {
    type: Type;
    constructor(type: Type);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static parse(tokenizer: tokenization.Tokenizer): RecordType;
}
export declare class ReferenceType implements Type {
    path: string[];
    typename: string;
    constructor(path: string[], typename: string);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static parse(tokenizer: tokenization.Tokenizer): ReferenceType;
}
export declare class StringType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static readonly INSTANCE: StringType;
    static parse(tokenizer: tokenization.Tokenizer): StringType;
}
export declare class StringLiteralType implements Type {
    value: string;
    constructor(value: string);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static parse(tokenizer: tokenization.Tokenizer): StringLiteralType;
}
export declare class TupleType implements Type {
    types: Array<Type>;
    constructor(types?: Iterable<Type>);
    add(type: Type): this;
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static parse(tokenizer: tokenization.Tokenizer): TupleType;
}
export declare class UndefinedType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static readonly INSTANCE: UndefinedType;
    static parse(tokenizer: tokenization.Tokenizer): UndefinedType;
}
export declare class UnionType implements Type {
    types: Set<Type>;
    constructor(types?: Iterable<Type>);
    add(type: Type): this;
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): Array<shared.Import>;
    static parse(tokenizer: tokenization.Tokenizer, ...exclude: Array<Typename>): Type;
}
export declare class Headers implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): shared.Import[];
    static readonly INSTANCE: Headers;
}
export declare class Options implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getImports(): shared.Import[];
    static readonly INSTANCE: Options;
}
