import * as shared from "./shared";
import * as tokenization from "./tokenization";

export type TypeParser = (tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>) => Type;

export interface Type {
	generateSchema(options: shared.Options): string;
	generateTypeGuard(options: shared.Options): string;
	getReferences(): Array<shared.Reference>;
};

export const Type = {
	parse(tokenizer: tokenization.Tokenizer, options?: Partial<{ parsers: Array<TypeParser> }>): Type {
		return tokenizer.newContext((read, peek) => {
			let parsers = options?.parsers ?? [
				UnionType.parse,
				IntersectionType.parse,
				ArrayType.parse,
				AnyType.parse,
				BooleanType.parse,
				BooleanLiteralType.parse,
				NullType.parse,
				NumberType.parse,
				NumberLiteralType.parse,
				StringType.parse,
				StringLiteralType.parse,
				UndefinedType.parse,
				ReferenceType.parse,
				TupleType.parse,
				ObjectType.parse,
				GroupType.parse,
				RecordType.parse
			];
			let errors = new Array<any>();
			for (let parser of parsers) {
				try {
					return parser(tokenizer, parsers);
				} catch (error) {
					errors.push(error);
				}
			}
			throw tokenization.SyntaxError.getError(tokenizer, errors);
		});
	}
};

export class AnyType implements Type {
	constructor() {

	}

	generateSchema(options: shared.Options): string {
		return "any";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Any");
		return lines.join(options.eol);
	}

	getReferences(): Array<shared.Reference> {
		return [];
	}

	static readonly INSTANCE = new AnyType();

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): AnyType {
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

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Array.of(" + this.type.generateTypeGuard({ ...options, eol: options.eol }) + ")");
		return lines.join(options.eol);
	}

	getReferences(): Array<shared.Reference> {
		return this.type.getReferences();
	}

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): ArrayType {
		return tokenizer.newContext((read, peek) => {
			let type = Type.parse(tokenizer, {
				parsers: parsers.filter((parser) => parser !== ArrayType.parse)
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

	generateTypeGuard(options: shared.Options): string {
		return "autoguard.api.Binary";
	}

	getReferences(): shared.Reference[] {
		return [];
	}

	static readonly INSTANCE = new Binary();
};

export class BooleanType implements Type {
	constructor() {

	}

	generateSchema(options: shared.Options): string {
		return "boolean";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Boolean");
		return lines.join(options.eol);
	}

	getReferences(): Array<shared.Reference> {
		return [];
	}

	static readonly INSTANCE = new BooleanType();

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): BooleanType {
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

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.BooleanLiteral.of(" + this.value + ")");
		return lines.join(options.eol);
	}

	getReferences(): Array<shared.Reference> {
		return [];
	}

	static readonly INSTANCE_TRUE = new BooleanLiteralType(true);
	static readonly INSTANCE_FALSE = new BooleanLiteralType(false);

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): BooleanLiteralType {
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

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Group.of(" + this.type.generateTypeGuard({ ...options, eol: options.eol }) + ")");
		return lines.join(options.eol);
	}

	getReferences(): Array<shared.Reference> {
		return this.type.getReferences();
	}

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): GroupType {
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "(");
			let type = Type.parse(tokenizer);
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

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push("	" + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }));
		}
		return "autoguard.guards.Intersection.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
	}

	getReferences(): Array<shared.Reference> {
		let references = new Array<shared.Reference>();
		for (let type of this.types) {
			references.push(...type.getReferences());
		}
		return references;
	}

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): Type {
		return tokenizer.newContext((read, peek) => {
			let type = Type.parse(tokenizer, {
				parsers: parsers.filter((parser) => parser !== IntersectionType.parse)
			});
			let instance = new IntersectionType();
			instance.add(type);
			while (true) {
				if (peek()?.value !== "&") {
					break;
				}
				tokenization.expect(read(), "&");
				let type = Type.parse(tokenizer, {
					parsers: parsers.filter((parser) => parser !== IntersectionType.parse)
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

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Null");
		return lines.join(options.eol);
	}

	getReferences(): Array<shared.Reference> {
		return [];
	}

	static readonly INSTANCE = new NullType();

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): NullType {
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

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Number");
		return lines.join(options.eol);
	}

	getReferences(): Array<shared.Reference> {
		return [];
	}

	static readonly INSTANCE = new NumberType();

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): NumberType {
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

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.NumberLiteral.of(" + this.value + ")");
		return lines.join(options.eol);
	}

	getReferences(): Array<shared.Reference> {
		return [];
	}

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): NumberLiteralType {
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

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		for (let [key, value] of this.members) {
			let type = value.type;
			if (value.optional) {
				let union = new UnionType();
				union.add(type);
				union.add(UndefinedType.INSTANCE);
				type = union;
			}
			lines.push("	\"" + key + "\": " + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }));
		}
		let guard = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
		return "autoguard.guards.Object.of({" + guard + "})";
	}

	getReferences(): Array<shared.Reference> {
		let references = new Array<shared.Reference>();
		for (let [key, value] of this.members) {
			let type = value.type;
			references.push(...type.getReferences());
		}
		return references;
	}

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): ObjectType {
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
					let type = Type.parse(tokenizer);
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

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Record.of(" + this.type.generateTypeGuard({ ...options, eol: options.eol }) + ")");
		return lines.join(options.eol);
	}

	getReferences(): Array<shared.Reference> {
		return this.type.getReferences();
	}

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): RecordType {
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "{");
			let type = Type.parse(tokenizer);
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

	generateTypeGuard(options: shared.Options): string {
		return "autoguard.guards.Reference.of(() => " + this.typename + ")";
	}

	getReferences(): Array<shared.Reference> {
		return [
			{
				path: this.path,
				typename: this.typename
			}
		];
	}

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): ReferenceType {
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

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.String");
		return lines.join(options.eol);
	}

	getReferences(): Array<shared.Reference> {
		return [];
	}

	static readonly INSTANCE = new StringType();

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): StringType {
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

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.StringLiteral.of(\"" + this.value + "\")");
		return lines.join(options.eol);
	}

	getReferences(): Array<shared.Reference> {
		return [];
	}

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): StringLiteralType {
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

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push("	" + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }));
		}
		let string = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
		return "autoguard.guards.Tuple.of(" + string + ")";
	}

	getReferences(): Array<shared.Reference> {
		let references = new Array<shared.Reference>();
		for (let type of this.types) {
			references.push(...type.getReferences());
		}
		return references;
	}

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): TupleType {
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "[");
			let instance = new TupleType();
			if (peek()?.value !== "]") {
				while (true) {
					let type = Type.parse(tokenizer);
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

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Undefined");
		return lines.join(options.eol);
	}

	getReferences(): Array<shared.Reference> {
		return [];
	}

	static readonly INSTANCE = new UndefinedType();

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): UndefinedType {
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

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push("	" + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }));
		}
		return "autoguard.guards.Union.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
	}

	getReferences(): Array<shared.Reference> {
		let references = new Array<shared.Reference>();
		for (let type of this.types) {
			references.push(...type.getReferences());
		}
		return references;
	}

	static parse(tokenizer: tokenization.Tokenizer, parsers: Array<TypeParser>): Type {
		return tokenizer.newContext((read, peek) => {
			let type = Type.parse(tokenizer, {
				parsers: parsers.filter((parser) => parser !== UnionType.parse)
			});
			let instance = new UnionType();
			instance.add(type);
			while (true) {
				if (peek()?.value !== "|") {
					break;
				}
				tokenization.expect(read(), "|");
				let type = Type.parse(tokenizer, {
					parsers: parsers.filter((parser) => parser !== UnionType.parse)
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

	generateTypeGuard(options: shared.Options): string {
		return "autoguard.api.Headers";
	}

	getReferences(): shared.Reference[] {
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

	generateTypeGuard(options: shared.Options): string {
		return "autoguard.api.Options";
	}

	getReferences(): shared.Reference[] {
		return [];
	}

	static readonly INSTANCE = new Options();
};

export class PlainType implements Type {
	constructor() {

	}

	generateSchema(options: shared.Options): string {
		return `plain`;
	}

	generateTypeGuard(options: shared.Options): string {
		return "autoguard.guards.String";
	}

	getReferences(): shared.Reference[] {
		return [];
	}

	static readonly INSTANCE = new PlainType();
};
