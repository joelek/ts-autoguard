import * as shared from "./shared";
import * as tokenization from "./tokenization";

type Import = {
	path: string[],
	typename: string
};

export type Typename = "Array" | "Intersection" | "Union";

export interface Type {
	generateType(options: shared.Options): string;
	generateTypeGuard(options: shared.Options): string;
	getImports(): Import[];
};

export const Type = {
	parse(tokenizer: tokenization.Tokenizer, ...exclude: Typename[]): Type {
		try {
			return UnionType.parse(tokenizer, ...exclude);
		} catch (error) {}
		try {
			return IntersectionType.parse(tokenizer, ...exclude);
		} catch (error) {}
		try {
			return ArrayType.parse(tokenizer, ...exclude);
		} catch (error) {}
		try {
			return AnyType.parse(tokenizer);
		} catch (error) {}
		try {
			return BooleanType.parse(tokenizer);
		} catch (error) {}
		try {
			return BooleanLiteralType.parse(tokenizer);
		} catch (error) {}
		try {
			return NullType.parse(tokenizer);
		} catch (error) {}
		try {
			return NumberType.parse(tokenizer);
		} catch (error) {}
		try {
			return NumberLiteralType.parse(tokenizer);
		} catch (error) {}
		try {
			return StringType.parse(tokenizer);
		} catch (error) {}
		try {
			return StringLiteralType.parse(tokenizer);
		} catch (error) {}
		try {
			return UndefinedType.parse(tokenizer);
		} catch (error) {}
		try {
			return ReferenceType.parse(tokenizer);
		} catch (error) {}
		try {
			return TupleType.parse(tokenizer);
		} catch (error) {}
		try {
			return ObjectType.parse(tokenizer);
		} catch (error) {}
		try {
			return GroupType.parse(tokenizer);
		} catch (error) {}
		try {
			return RecordType.parse(tokenizer);
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

	generateType(options: shared.Options): string {
		return "any";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Any");
		return lines.join(options.eol);
	}

	getImports(): Import[] {
		return [];
	}

	static readonly INSTANCE = new AnyType();

	static parse(tokenizer: tokenization.Tokenizer): AnyType {
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

	generateType(options: shared.Options): string {
		return this.type.generateType(options) + "[]";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Array.of(" + this.type.generateTypeGuard({ ...options, eol: options.eol }) + ")");
		return lines.join(options.eol);
	}

	getImports(): Import[] {
		return this.type.getImports();
	}

	static parse(tokenizer: tokenization.Tokenizer, ...exclude: Typename[]): ArrayType {
		if (exclude.includes("Array")) {
			throw `Recursion prevention!`;
		}
		return tokenizer.newContext((read, peek) => {
			let type = Type.parse(tokenizer, ...exclude, "Array");
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

export class BooleanType implements Type {
	constructor() {

	}

	generateType(options: shared.Options): string {
		return "boolean";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Boolean");
		return lines.join(options.eol);
	}

	getImports(): Import[] {
		return [];
	}

	static readonly INSTANCE = new BooleanType();

	static parse(tokenizer: tokenization.Tokenizer): BooleanType {
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

	generateType(options: shared.Options): string {
		return "" + this.value;
	}

	static readonly INSTANCE_TRUE = new BooleanLiteralType(true);
	static readonly INSTANCE_FALSE = new BooleanLiteralType(false);

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.BooleanLiteral.of(" + this.generateType({ ...options, eol: options.eol }) + ")");
		return lines.join(options.eol);
	}

	getImports(): Import[] {
		return [];
	}

	static parse(tokenizer: tokenization.Tokenizer): BooleanLiteralType {
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

	generateType(options: shared.Options): string {
		return "(" + this.type.generateType(options) + ")";
	}

	generateTypeGuard(options: shared.Options): string {
		return this.type.generateTypeGuard(options);
	}

	getImports(): Import[] {
		return this.type.getImports();
	}

	static parse(tokenizer: tokenization.Tokenizer): GroupType {
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

	constructor() {
		this.types = new Set<Type>();
	}

	add(type: Type): this {
		this.types.add(type);
		return this;
	}

	generateType(options: shared.Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push(type.generateType(options));
		}
		let string = lines.join(" & ");
		return string
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push("	" + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }));
		}
		return "autoguard.guards.Intersection.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
	}

	getImports(): Import[] {
		let imports = new Array<Import>();
		for (let type of this.types) {
			imports.push(...type.getImports());
		}
		return imports;
	}

	static parse(tokenizer: tokenization.Tokenizer, ...exclude: Typename[]): Type {
		if (exclude.includes("Intersection")) {
			throw `Recursion prevention!`;
		}
		return tokenizer.newContext((read, peek) => {
			let type = Type.parse(tokenizer, ...exclude, "Intersection");
			let instance = new IntersectionType();
			instance.add(type);
			while (true) {
				if (peek()?.value !== "&") {
					break;
				}
				tokenization.expect(read(), "&");
				let type = Type.parse(tokenizer, ...exclude, "Intersection");
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

	generateType(options: shared.Options): string {
		return "null";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Null");
		return lines.join(options.eol);
	}

	getImports(): Import[] {
		return [];
	}

	static readonly INSTANCE = new NullType();

	static parse(tokenizer: tokenization.Tokenizer): NullType {
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "null");
			return NullType.INSTANCE;
		});
	}
};

export class NumberType implements Type {
	constructor() {

	}

	generateType(options: shared.Options): string {
		return "number";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Number");
		return lines.join(options.eol);
	}

	getImports(): Import[] {
		return [];
	}

	static readonly INSTANCE = new NumberType();

	static parse(tokenizer: tokenization.Tokenizer): NumberType {
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

	generateType(options: shared.Options): string {
		return "" + this.value;
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.NumberLiteral.of(" + this.generateType({ ...options, eol: options.eol }) + ")");
		return lines.join(options.eol);
	}

	getImports(): Import[] {
		return [];
	}

	static parse(tokenizer: tokenization.Tokenizer): NumberLiteralType {
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

	constructor() {
		this.members = new Map<string, ObjectMember>();
	}

	add(key: string, value: ObjectMember): this {
		this.members.set(key, value);
		return this;
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

	getImports(): Import[] {
		let imports = new Array<Import>();
		for (let [key, value] of this.members) {
			let type = value.type;
			imports.push(...type.getImports());
		}
		return imports;
	}


	static parse(tokenizer: tokenization.Tokenizer): ObjectType {
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "{");
			let instance = new ObjectType();
			if (peek()?.value !== "}") {
				while (true) {
					let optional = false;
					let token = tokenization.expect(read(), [
						"any",
						"boolean",
						"false",
						"null",
						"number",
						"string",
						"true",
						"undefined",
						"IDENTIFIER",
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

	generateType(options: shared.Options): string {
		return "Record<string, undefined | " + this.type.generateType(options) + ">";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Record.of(" + this.type.generateTypeGuard({ ...options, eol: options.eol }) + ")");
		return lines.join(options.eol);
	}

	getImports(): Import[] {
		return this.type.getImports();
	}

	static parse(tokenizer: tokenization.Tokenizer): RecordType {
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

	generateType(options: shared.Options): string {
		return this.typename;
	}

	generateTypeGuard(options: shared.Options): string {
		return "autoguard.guards.Reference.of(() => " + this.typename + ")";
	}

	getImports(): Import[] {
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

	static parse(tokenizer: tokenization.Tokenizer): ReferenceType {
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

	generateType(options: shared.Options): string {
		return "string";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.String");
		return lines.join(options.eol);
	}

	getImports(): Import[] {
		return [];
	}

	static readonly INSTANCE = new StringType();

	static parse(tokenizer: tokenization.Tokenizer): StringType {
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

	generateType(options: shared.Options): string {
		return "\"" + this.value + "\"";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.StringLiteral.of(\"" + this.value + "\")");
		return lines.join(options.eol);
	}

	getImports(): Import[] {
		return [];
	}

	static parse(tokenizer: tokenization.Tokenizer): StringLiteralType {
		return tokenizer.newContext((read, peek) => {
			let value = tokenization.expect(read(), "STRING_LITERAL").value;
			return new StringLiteralType(value.slice(1, -1));
		});
	}
};

export class TupleType implements Type {
	types: Array<Type>;

	constructor() {
		this.types = new Array<Type>();
	}

	add(type: Type): this {
		this.types.push(type);
		return this;
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

	getImports(): Import[] {
		let imports = new Array<Import>();
		for (let type of this.types) {
			imports.push(...type.getImports());
		}
		return imports;
	}

	static parse(tokenizer: tokenization.Tokenizer): TupleType {
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

	generateType(options: shared.Options): string {
		return "undefined";
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("autoguard.guards.Undefined");
		return lines.join(options.eol);
	}

	getImports(): Import[] {
		return [];
	}

	static readonly INSTANCE = new UndefinedType();

	static parse(tokenizer: tokenization.Tokenizer): UndefinedType {
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "undefined");
			return UndefinedType.INSTANCE;
		});
	}
};

export class UnionType implements Type {
	types: Set<Type>;

	constructor() {
		this.types = new Set<Type>();
	}

	add(type: Type): this {
		this.types.add(type);
		return this;
	}

	generateType(options: shared.Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push(type.generateType(options));
		}
		let string = lines.join(" | ");
		return string
	}

	generateTypeGuard(options: shared.Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push("	" + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }));
		}
		return "autoguard.guards.Union.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
	}

	getImports(): Import[] {
		let imports = new Array<Import>();
		for (let type of this.types) {
			imports.push(...type.getImports());
		}
		return imports;
	}

	static parse(tokenizer: tokenization.Tokenizer, ...exclude: Array<Typename>): Type {
		if (exclude.includes("Union")) {
			throw `Recursion prevention!`;
		}
		return tokenizer.newContext((read, peek) => {
			let type = Type.parse(tokenizer, ...exclude, "Union");
			let instance = new UnionType();
			instance.add(type);
			while (true) {
				if (peek()?.value !== "|") {
					break;
				}
				tokenization.expect(read(), "|");
				let type = Type.parse(tokenizer, ...exclude, "Union");
				instance.add(type);
			}
			if (instance.types.size === 1) {
				return type;
			}
			return instance;
		});
	}
};

export class Schema {
	types: Map<string, Type>;

	private getImports(): Import[] {
		let imports = new Map<string, string[]>();
		for (let [key, value] of this.types) {
			let entries = value.getImports();
			for (let entry of entries) {
				imports.set(entry.typename, entry.path);
			}
		}
		return Array.from(imports.entries())
			.sort((one, two) => one[0].localeCompare(two[0]))
			.map((entry) => {
				return {
					path: entry[1],
					typename: entry[0]
				};
			});
	}

	constructor() {
		this.types = new Map<string, Type>();
	}

	add(key: string, value: Type): this {
		this.types.set(key, value);
		return this;
	}

	generateModule(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push("// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.");
		lines.push("");
		let imports = this.getImports();
		for (let entry of imports) {
			lines.push("import { " + entry.typename + " } from \"" + entry.path.join("/") + "\";");
		}
		lines.push("import * as autoguard from \"@joelek/ts-autoguard\";");
		lines.push("");
		for (let [key, value] of this.types) {
			lines.push("export type " + key + " = " + value.generateType(options) + ";");
			lines.push("");
			lines.push("export const " + key + " = " + value.generateTypeGuard({ ...options, eol: options.eol }) + ";");
			lines.push("");
		}
		let autoguard = new ObjectType();
		for (let [key, value] of this.types) {
			autoguard.add(key, {
				type: new ReferenceType([], key),
				optional: false
			});
		}
		lines.push("export namespace Autoguard {");
		lines.push("	" + "export type Guards = " + autoguard.generateType({ ...options, eol: options.eol + "\t" }) + ";");
		lines.push("");
		lines.push("	" + "export const Guards = " + autoguard.generateType({ ...options, eol: options.eol + "\t" }) + ";");
		lines.push("};");
		lines.push("");
		return lines.join(options.eol);
	}

	static parse(tokenizer: tokenization.Tokenizer): Schema {
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "{");
			let instance = new Schema();
			if (peek()?.value !== "}") {
				while (true) {
					let identifier = tokenization.expect(read(), "IDENTIFIER").value;
					tokenization.expect(read(), ":");
					let type = Type.parse(tokenizer);
					instance.add(identifier, type);
					if (peek()?.value !== ",") {
						break;
					}
					tokenization.expect(read(), ",");
				}
			}
			tokenization.expect(read(), "}");
			if (peek() != null) {
				throw `Expected end of stream!`;
			}
			return instance;
		});
	}
};
