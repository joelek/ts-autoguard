import * as shared from "./shared";
import * as tokenization from "./tokenization";
export type TypeParser = (tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>) => Type;
export interface Type {
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
}
export declare const Type: {
    parse(tokenizer: tokenization.Tokenizer, options?: Partial<{
        parsers: Array<TypeParser>;
    }>): Type;
};
export declare class AnyType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static readonly INSTANCE: AnyType;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): AnyType;
}
export declare class ArrayType implements Type {
    type: Type;
    constructor(type: Type);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): ArrayType;
}
export declare class BigIntType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): shared.Reference[];
    static readonly INSTANCE: BigIntType;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): BigIntType;
}
export declare class BinaryType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): shared.Reference[];
    static readonly INSTANCE: BinaryType;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): BinaryType;
}
export declare class BooleanType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static readonly INSTANCE: BooleanType;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): BooleanType;
}
export declare class BooleanLiteralType implements Type {
    value: boolean;
    constructor(value: boolean);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static readonly INSTANCE_TRUE: BooleanLiteralType;
    static readonly INSTANCE_FALSE: BooleanLiteralType;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): BooleanLiteralType;
}
export declare class GroupType implements Type {
    type: Type;
    constructor(type: Type);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): GroupType;
}
export declare class IntegerType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static readonly INSTANCE: IntegerType;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): IntegerType;
}
export declare class IntegerLiteralType implements Type {
    value: number;
    constructor(value: number);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): IntegerLiteralType;
}
export declare class IntersectionType implements Type {
    types: Set<Type>;
    constructor(types?: Iterable<Type>);
    add(type: Type): this;
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): Type;
}
export declare class NullType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static readonly INSTANCE: NullType;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): NullType;
}
export declare class NumberType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static readonly INSTANCE: NumberType;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): NumberType;
}
export declare class NumberLiteralType implements Type {
    value: number;
    constructor(value: number);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): NumberLiteralType;
}
export type ObjectMember = {
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
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): ObjectType;
}
export declare class RecordType implements Type {
    type: Type;
    constructor(type: Type);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): RecordType;
}
export declare class ReferenceType implements Type {
    path: string[];
    typename: string;
    members: string[];
    constructor(path: string[], typename: string, members: string[]);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): ReferenceType;
}
export declare class StringType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static readonly INSTANCE: StringType;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): StringType;
}
export declare class StringLiteralType implements Type {
    value: string;
    constructor(value: string);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): StringLiteralType;
}
export declare class TupleType implements Type {
    types: Array<Type>;
    constructor(types?: Iterable<Type>);
    add(type: Type): this;
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): TupleType;
}
export declare class UndefinedType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static readonly INSTANCE: UndefinedType;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): UndefinedType;
}
export declare class UnionType implements Type {
    types: Set<Type>;
    constructor(types?: Iterable<Type>);
    add(type: Type): this;
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): Type;
}
export declare class Headers implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): shared.Reference[];
    static readonly INSTANCE: Headers;
}
export declare class Options implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): shared.Reference[];
    static readonly INSTANCE: Options;
}
export declare class PlainType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): shared.Reference[];
    static readonly INSTANCE: PlainType;
}
