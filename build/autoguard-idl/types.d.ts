import * as shared from "./shared";
import * as tokenization from "./tokenization";
export declare const Typenames: ["Any", "Array", "Boolean", "BooleanLiteral", "Group", "Intersection", "Null", "Number", "NumberLiteral", "Object", "Record", "Reference", "String", "StringLiteral", "Tuple", "Undefined", "Union"];
export declare type Typename = typeof Typenames[number];
export declare type TypenameMap = {
    [A in Typename]?: boolean;
};
export declare function makeInclude(): TypenameMap;
export interface Type {
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
}
export declare const Type: {
    parse(tokenizer: tokenization.Tokenizer, include?: TypenameMap, exclude?: TypenameMap): Type;
};
export declare class AnyType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static readonly INSTANCE: AnyType;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): AnyType;
}
export declare class ArrayType implements Type {
    type: Type;
    constructor(type: Type);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): ArrayType;
}
export declare class Binary implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): shared.Reference[];
    static readonly INSTANCE: Binary;
    static parse(tokenizer: tokenization.Tokenizer): UndefinedType;
}
export declare class BooleanType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static readonly INSTANCE: BooleanType;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): BooleanType;
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
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): BooleanLiteralType;
}
export declare class GroupType implements Type {
    type: Type;
    constructor(type: Type);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): GroupType;
}
export declare class IntersectionType implements Type {
    types: Set<Type>;
    constructor(types?: Iterable<Type>);
    add(type: Type): this;
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): Type;
}
export declare class NullType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static readonly INSTANCE: NullType;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): NullType;
}
export declare class NumberType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static readonly INSTANCE: NumberType;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): NumberType;
}
export declare class NumberLiteralType implements Type {
    value: number;
    constructor(value: number);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): NumberLiteralType;
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
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): ObjectType;
}
export declare class RecordType implements Type {
    type: Type;
    constructor(type: Type);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): RecordType;
}
export declare class ReferenceType implements Type {
    path: string[];
    typename: string;
    constructor(path: string[], typename: string);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): ReferenceType;
}
export declare class StringType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static readonly INSTANCE: StringType;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): StringType;
}
export declare class StringLiteralType implements Type {
    value: string;
    constructor(value: string);
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): StringLiteralType;
}
export declare class TupleType implements Type {
    types: Array<Type>;
    constructor(types?: Iterable<Type>);
    add(type: Type): this;
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): TupleType;
}
export declare class UndefinedType implements Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static readonly INSTANCE: UndefinedType;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): UndefinedType;
}
export declare class UnionType implements Type {
    types: Set<Type>;
    constructor(types?: Iterable<Type>);
    add(type: Type): this;
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): Array<shared.Reference>;
    static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): Type;
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
