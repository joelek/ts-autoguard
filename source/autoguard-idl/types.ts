import * as shared from "./shared";
import * as tokenization from "./tokenization";

export const Typenames = (<A extends string[]>(...tuple: A): [...A] => tuple)(
	"Any",
	"Array",
	"Boolean",
	"BooleanLiteral",
	"Group",
	"Intersection",
	"Null",
	"Number",
	"NumberLiteral",
	"Object",
	"Record",
	"Reference",
	"String",
	"StringLiteral",
	"Tuple",
	"Undefined",
	"Union"
);

export type Typename = typeof Typenames[number];

export type TypenameMap = {
	[A in Typename]?: boolean;
};

export function makeInclude(): TypenameMap {
	return Typenames.reduce((include, typename) => ({ ...include, [typename]: true }), {} as TypenameMap);
};

export interface Type {
	generateSchema(options: shared.Options): string;
	generateType(options: shared.Options): string;
	generateTypeGuard(options: shared.Options): string;
	getImports(): Array<shared.Import>;
};

export const Type = {
	parse(tokenizer: tokenization.Tokenizer, include: TypenameMap = makeInclude(), exclude: TypenameMap = {}): Type {
		try {
			return UnionType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return IntersectionType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return ArrayType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return AnyType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return BooleanType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return BooleanLiteralType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return NullType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return NumberType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return NumberLiteralType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return StringType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return StringLiteralType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return UndefinedType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return ReferenceType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return TupleType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return ObjectType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return GroupType.parse(tokenizer, include, exclude);
		} catch (error) {}
		try {
			return RecordType.parse(tokenizer, include, exclude);
		} catch (error) {}
		return tokenizer.newContext((read, peek) => {
			let token = read();
			throw `Unexpected ${token.family} at row ${token.row}, col ${token.col}!`;
		});
	}
};

export class AnyType implements Type {
	constructor() {

	}

	generateSchema(options: shared.Options): string {
		return "any";
	}

	generateType(options: shared.Options): string {
		return "any";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Any");
		return lines.join(options.eol);
	}

	getImports(): Array<shared.Import> {
		return [];
	}

	static readonly INSTANCE = new AnyType();

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): AnyType {
		if (!include.Any || exclude.Any) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "any");
			return AnyType.INSTANCE;
		});
	}
};

export class ArrayType implements Type {
	type: Type;

	constructor(type: Type) {
		this.type = type;
	}

	generateSchema(options: shared.Options): string {
		return this.type.generateSchema(options) + "[]";
	}

	generateType(options: shared.Options): string {
		return this.type.generateType(options) + "[]";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Array.of(" + this.type.generateTypeGuard({ ...options, eol: options.eol }) + ")");
		return lines.join(options.eol);
	}

	getImports(): Array<shared.Import> {
		return this.type.getImports();
	}

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): ArrayType {
		if (!include.Array || exclude.Array) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			let type = Type.parse(tokenizer, include, {
				...exclude,
				Array: true
			});
			tokenization.expect(read(), "[");
			tokenization.expect(read(), "]");
			let array = new ArrayType(type);
			while (true) {
				try {
					tokenizer.newContext((read, peek) => {
						tokenization.expect(read(), "[");
						tokenization.expect(read(), "]");
						array = new ArrayType(array);
					});
				} catch (error) {
					break;
				}
			}
			return array;
		});
	}
};

export class Binary implements Type {
	constructor() {

	}

	generateSchema(options: shared.Options): string {
		return "binary";
	}

	generateType(options: shared.Options): string {
		return "autoguard.api.Binary";
	}

	generateTypeGuard(options: shared.Options): string {
		return "autoguard.api.Binary";
	}

	getImports(): shared.Import[] {
		return [];
	}

	static readonly INSTANCE = new Binary();

	static parse(tokenizer: tokenization.Tokenizer): UndefinedType {
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "binary");
			return Binary.INSTANCE;
		});
	}
};

export class BooleanType implements Type {
	constructor() {

	}

	generateSchema(options: shared.Options): string {
		return "boolean";
	}

	generateType(options: shared.Options): string {
		return "boolean";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Boolean");
		return lines.join(options.eol);
	}

	getImports(): Array<shared.Import> {
		return [];
	}

	static readonly INSTANCE = new BooleanType();

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): BooleanType {
		if (!include.Boolean || exclude.Boolean) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "boolean");
			return BooleanType.INSTANCE;
		});
	}
};

export class BooleanLiteralType implements Type {
	value: boolean;

	constructor(value: boolean) {
		this.value = value;
	}

	generateSchema(options: shared.Options): string {
		return "" + this.value;
	}

	generateType(options: shared.Options): string {
		return "" + this.value;
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.BooleanLiteral.of(" + this.generateType({ ...options, eol: options.eol }) + ")");
		return lines.join(options.eol);
	}

	getImports(): Array<shared.Import> {
		return [];
	}

	static readonly INSTANCE_TRUE = new BooleanLiteralType(true);
	static readonly INSTANCE_FALSE = new BooleanLiteralType(false);

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): BooleanLiteralType {
		if (!include.BooleanLiteral || exclude.BooleanLiteral) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			let token = tokenization.expect(read(), [
				"true",
				"false"
			]);
			if (token.family === "true") {
				return BooleanLiteralType.INSTANCE_TRUE;
			} else {
				return BooleanLiteralType.INSTANCE_FALSE;
			}
		});
	}
};

export class GroupType implements Type {
	type: Type;

	constructor(type: Type) {
		this.type = type;
	}

	generateSchema(options: shared.Options): string {
		return "(" + this.type.generateSchema(options) + ")";
	}

	generateType(options: shared.Options): string {
		return "(" + this.type.generateType(options) + ")";
	}

	generateTypeGuard(options: shared.Options): string {
		return this.type.generateTypeGuard(options);
	}

	getImports(): Array<shared.Import> {
		return this.type.getImports();
	}

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): GroupType {
		if (!include.Group || exclude.Group) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "(");
			let type = Type.parse(tokenizer, include);
			tokenization.expect(read(), ")");
			return new GroupType(type);
		});
	}
};

export class IntersectionType implements Type {
	types: Set<Type>;

	constructor(types: Iterable<Type> = []) {
		this.types = new Set<Type>(types);
	}

	add(type: Type): this {
		this.types.add(type);
		return this;
	}

	generateSchema(options: shared.Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push(type.generateSchema(options));
		}
		let string = lines.join(" & ");
		return string;
	}

	generateType(options: shared.Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push(type.generateType(options));
		}
		let string = lines.join(" & ");
		return string;
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push("	" + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }));
		}
		return "autoguard.guards.Intersection.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
	}

	getImports(): Array<shared.Import> {
		let imports = new Array<shared.Import>();
		for (let type of this.types) {
			imports.push(...type.getImports());
		}
		return imports;
	}

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): Type {
		if (!include.Intersection || exclude.Intersection) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			let type = Type.parse(tokenizer, include, {
				...exclude,
				Intersection: true
			});
			let instance = new IntersectionType();
			instance.add(type);
			while (true) {
				if (peek()?.value !== "&") {
					break;
				}
				tokenization.expect(read(), "&");
				let type = Type.parse(tokenizer, include, {
					...exclude,
					Intersection: true
				});
				instance.add(type);
			}
			if (instance.types.size === 1) {
				return type;
			}
			return instance;
		});
	}
};

export class NullType implements Type {
	constructor() {

	}

	generateSchema(options: shared.Options): string {
		return "null";
	}

	generateType(options: shared.Options): string {
		return "null";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Null");
		return lines.join(options.eol);
	}

	getImports(): Array<shared.Import> {
		return [];
	}

	static readonly INSTANCE = new NullType();

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): NullType {
		if (!include.Null || exclude.Null) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "null");
			return NullType.INSTANCE;
		});
	}
};

export class NumberType implements Type {
	constructor() {

	}

	generateSchema(options: shared.Options): string {
		return "number";
	}

	generateType(options: shared.Options): string {
		return "number";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Number");
		return lines.join(options.eol);
	}

	getImports(): Array<shared.Import> {
		return [];
	}

	static readonly INSTANCE = new NumberType();

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): NumberType {
		if (!include.Number || exclude.Number) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "number");
			return NumberType.INSTANCE;
		});
	}
};

export class NumberLiteralType implements Type {
	value: number;

	constructor(value: number) {
		this.value = value;
	}

	generateSchema(options: shared.Options): string {
		return "" + this.value;
	}

	generateType(options: shared.Options): string {
		return "" + this.value;
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.NumberLiteral.of(" + this.generateType({ ...options, eol: options.eol }) + ")");
		return lines.join(options.eol);
	}

	getImports(): Array<shared.Import> {
		return [];
	}

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): NumberLiteralType {
		if (!include.NumberLiteral || exclude.NumberLiteral) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			let value = tokenization.expect(read(), "NUMBER_LITERAL").value;
			return new NumberLiteralType(Number.parseInt(value));
		});
	}
};

export type ObjectMember = {
	type: Type;
	optional: boolean;
};

export class ObjectType implements Type {
	members: Map<string, ObjectMember>;

	constructor(members: Iterable<[string, ObjectMember]> = []) {
		this.members = new Map<string, ObjectMember>(members);
	}

	add(key: string, value: ObjectMember): this {
		this.members.set(key, value);
		return this;
	}

	generateSchema(options: shared.Options): string {
		if (this.members.size === 0) {
			return "{}";
		}
		let lines = new Array<string>();
		for (let [key, value] of this.members) {
			lines.push("	\"" + key + "\"" + (value.optional ? "?" : "") + ": " + value.type.generateSchema({ ...options, eol: options.eol + "\t" }));
		}
		let string = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
		return "{" + string + "}";
	}

	generateType(options: shared.Options): string {
		if (this.members.size === 0) {
			return "{}";
		}
		let lines = new Array<string>();
		for (let [key, value] of this.members) {
			lines.push("	\"" + key + "\"" + (value.optional ? "?" : "") + ": " + value.type.generateType({ ...options, eol: options.eol + "\t" }));
		}
		let string = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
		return "{" + string + "}";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		for (let [key, value] of this.members) {
			let type = value.type;
			if (value.optional) {
				let union = new UnionType();
				union.add(UndefinedType.INSTANCE);
				union.add(type);
				type = union;
			}
			lines.push("	\"" + key + "\": " + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }));
		}
		let guard = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
		return "autoguard.guards.Object.of({" + guard + "})";
	}

	getImports(): Array<shared.Import> {
		let imports = new Array<shared.Import>();
		for (let [key, value] of this.members) {
			let type = value.type;
			imports.push(...type.getImports());
		}
		return imports;
	}

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): ObjectType {
		if (!include.Object || exclude.Object) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "{");
			let instance = new ObjectType();
			if (peek()?.value !== "}") {
				while (true) {
					let optional = false;
					let token = tokenization.expect(read(), [
						...tokenization.IdentifierFamilies,
						"STRING_LITERAL"
					]);
					let key = token.family === "STRING_LITERAL" ? token.value.slice(1, -1) : token.value;
					if (peek()?.value === "?") {
						read();
						optional = true;
					}
					tokenization.expect(read(), ":");
					let type = Type.parse(tokenizer, include);
					instance.add(key, {
						type,
						optional
					});
					if (peek()?.value !== ",") {
						break;
					}
					tokenization.expect(read(), ",");
				}
			}
			tokenization.expect(read(), "}");
			return instance;
		});
	}
};

export class RecordType implements Type {
	type: Type;

	constructor(type: Type) {
		this.type = type;
	}

	generateSchema(options: shared.Options): string {
		return "{ " + this.type.generateSchema(options) + " }";
	}

	generateType(options: shared.Options): string {
		return "Record<string, undefined | " + this.type.generateType(options) + ">";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Record.of(" + this.type.generateTypeGuard({ ...options, eol: options.eol }) + ")");
		return lines.join(options.eol);
	}

	getImports(): Array<shared.Import> {
		return this.type.getImports();
	}

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): RecordType {
		if (!include.Record || exclude.Record) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "{");
			let type = Type.parse(tokenizer, include);
			tokenization.expect(read(), "}");
			return new RecordType(type);
		});
	}
};

export class ReferenceType implements Type {
	path: string[];
	typename: string;

	constructor(path: string[], typename: string) {
		this.path = path;
		this.typename = typename;
	}

	generateSchema(options: shared.Options): string {
		return [...this.path, ""].join("/") + this.typename;
	}

	generateType(options: shared.Options): string {
		return this.typename;
	}

	generateTypeGuard(options: shared.Options): string {
		return "autoguard.guards.Reference.of(() => " + this.typename + ")";
	}

	getImports(): Array<shared.Import> {
		if (this.path.length > 0) {
			return [
				{
					path: this.path,
					typename: this.typename
				}
			];
		}
		return [];
	}

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): ReferenceType {
		if (!include.Reference || exclude.Reference) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			let tokens = new Array<tokenization.Token>();
			while (true) {
				let token = read();
				tokenization.expect(token, [".", "..", "IDENTIFIER"]);
				tokens.push(token);
				if (peek()?.family !== "/") {
					break;
				}
				tokenization.expect(read(), "/");
			}
			let last = tokens.pop() as tokenization.Token;
			tokenization.expect(last, "IDENTIFIER");
			return new ReferenceType(tokens.map((token) => token.value), last.value);
		});
	}
};

export class StringType implements Type {
	constructor() {

	}

	generateSchema(options: shared.Options): string {
		return "string";
	}

	generateType(options: shared.Options): string {
		return "string";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.String");
		return lines.join(options.eol);
	}

	getImports(): Array<shared.Import> {
		return [];
	}

	static readonly INSTANCE = new StringType();

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): StringType {
		if (!include.String || exclude.String) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "string");
			return StringType.INSTANCE;
		});
	}
};

export class StringLiteralType implements Type {
	value: string;

	constructor(value: string) {
		this.value = value;
	}

	generateSchema(options: shared.Options): string {
		return "\"" + this.value + "\"";
	}

	generateType(options: shared.Options): string {
		return "\"" + this.value + "\"";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.StringLiteral.of(\"" + this.value + "\")");
		return lines.join(options.eol);
	}

	getImports(): Array<shared.Import> {
		return [];
	}

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): StringLiteralType {
		if (!include.StringLiteral || exclude.StringLiteral) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			let value = tokenization.expect(read(), "STRING_LITERAL").value;
			return new StringLiteralType(value.slice(1, -1));
		});
	}
};

export class TupleType implements Type {
	types: Array<Type>;

	constructor(types: Iterable<Type> = []) {
		this.types = Array.from(types);
	}

	add(type: Type): this {
		this.types.push(type);
		return this;
	}

	generateSchema(options: shared.Options): string {
		let strings = new Array<string>();
		for (let type of this.types) {
			strings.push("	" + type.generateSchema({ ...options, eol: options.eol + "\t" }));
		}
		let string = strings.length > 0 ? options.eol + strings.join("," + options.eol) + options.eol : "";
		return "[" + string + "]";
	}

	generateType(options: shared.Options): string {
		let strings = new Array<string>();
		for (let type of this.types) {
			strings.push("	" + type.generateType({ ...options, eol: options.eol + "\t" }));
		}
		let string = strings.length > 0 ? options.eol + strings.join("," + options.eol) + options.eol : "";
		return "[" + string + "]";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push("	" + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }));
		}
		let string = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
		return "autoguard.guards.Tuple.of(" + string + ")";
	}

	getImports(): Array<shared.Import> {
		let imports = new Array<shared.Import>();
		for (let type of this.types) {
			imports.push(...type.getImports());
		}
		return imports;
	}

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): TupleType {
		if (!include.Tuple || exclude.Tuple) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "[");
			let instance = new TupleType();
			if (peek()?.value !== "]") {
				while (true) {
					let type = Type.parse(tokenizer, include);
					instance.add(type);
					if (peek()?.value !== ",") {
						break;
					}
					tokenization.expect(read(), ",");
				}
			}
			tokenization.expect(read(), "]");
			return instance;
		});
	}
};

export class UndefinedType implements Type {
	constructor() {

	}

	generateSchema(options: shared.Options): string {
		return "undefined";
	}

	generateType(options: shared.Options): string {
		return "undefined";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Undefined");
		return lines.join(options.eol);
	}

	getImports(): Array<shared.Import> {
		return [];
	}

	static readonly INSTANCE = new UndefinedType();

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): UndefinedType {
		if (!include.Undefined || exclude.Undefined) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "undefined");
			return UndefinedType.INSTANCE;
		});
	}
};

export class UnionType implements Type {
	types: Set<Type>;

	constructor(types: Iterable<Type> = []) {
		this.types = new Set<Type>(types);
	}

	add(type: Type): this {
		this.types.add(type);
		return this;
	}

	generateSchema(options: shared.Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push(type.generateSchema(options));
		}
		let string = lines.join(" | ");
		return string;
	}

	generateType(options: shared.Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push(type.generateType(options));
		}
		let string = lines.join(" | ");
		return string;
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push("	" + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }));
		}
		return "autoguard.guards.Union.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
	}

	getImports(): Array<shared.Import> {
		let imports = new Array<shared.Import>();
		for (let type of this.types) {
			imports.push(...type.getImports());
		}
		return imports;
	}

	static parse(tokenizer: tokenization.Tokenizer, include: TypenameMap, exclude: TypenameMap): Type {
		if (!include.Union || exclude.Union) {
			throw `Type not included!`;
		}
		return tokenizer.newContext((read, peek) => {
			let type = Type.parse(tokenizer, include, {
				...exclude,
				Union: true
			});
			let instance = new UnionType();
			instance.add(type);
			while (true) {
				if (peek()?.value !== "|") {
					break;
				}
				tokenization.expect(read(), "|");
				let type = Type.parse(tokenizer, include, {
					...exclude,
					Union: true
				});
				instance.add(type);
			}
			if (instance.types.size === 1) {
				return type;
			}
			return instance;
		});
	}
};

export class Headers implements Type {
	constructor() {

	}

	generateSchema(options: shared.Options): string {
		throw `Method not implemented!`;
	}

	generateType(options: shared.Options): string {
		return "autoguard.api.Headers";
	}

	generateTypeGuard(options: shared.Options): string {
		return "autoguard.api.Headers";
	}

	getImports(): shared.Import[] {
		return [];
	}

	static readonly INSTANCE = new Headers();
};

export class Options implements Type {
	constructor() {

	}

	generateSchema(options: shared.Options): string {
		throw `Method not implemented!`;
	}

	generateType(options: shared.Options): string {
		return "autoguard.api.Options";
	}

	generateTypeGuard(options: shared.Options): string {
		return "autoguard.api.Options";
	}

	getImports(): shared.Import[] {
		return [];
	}

	static readonly INSTANCE = new Options();
};

export class PlainType implements Type {
	constructor() {

	}

	generateSchema(options: shared.Options): string {
		throw `plain`;
	}

	generateType(options: shared.Options): string {
		return "string";
	}

	generateTypeGuard(options: shared.Options): string {
		return "autoguard.guards.String";
	}

	getImports(): shared.Import[] {
		return [];
	}

	static readonly INSTANCE = new PlainType();
};
