import * as tokenization from "./tokenization";

export type Typename = "Array" | "Intersection" | "Union";

export type Options = {
	eol: string;
	standalone: boolean;
};

export interface Type {
	generateType(options: Options): string;
	generateTypeGuard(options: Options): string;
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

	generateType(options: Options): string {
		return "any";
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		if (options.standalone) {
			lines.push("(subject, path) => {");
			lines.push("	return subject;");
			lines.push("}");
		} else {
			lines.push("autoguard.Any");
		}
		return lines.join(options.eol);
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
	private type: Type;

	constructor(type: Type) {
		this.type = type;
	}

	generateType(options: Options): string {
		return this.type.generateType(options) + "[]";
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		if (options.standalone) {
			lines.push("(subject, path) => {");
			lines.push("	if ((subject != null) && (subject.constructor === globalThis.Array)) {");
			lines.push("		for (let i = 0; i < subject.length; i++) {");
			lines.push("			(" + this.type.generateTypeGuard({ ...options, eol: options.eol + "\t\t\t" }) + ")(subject[i], path + \"[\" + i + \"]\");");
			lines.push("		}");
			lines.push("		return subject;");
			lines.push("	}");
			lines.push("	throw \"Expected an array at \" + path + \"!\";");
			lines.push("}");
		} else {
			lines.push("autoguard.Array.of(" + this.type.generateTypeGuard({ ...options, eol: options.eol }) + ")");
		}
		return lines.join(options.eol);
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

	generateType(options: Options): string {
		return "boolean";
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		if (options.standalone) {
			lines.push("(subject, path) => {");
			lines.push("	if ((subject != null) && (subject.constructor === globalThis.Boolean)) {");
			lines.push("		return subject as boolean;");
			lines.push("	}");
			lines.push("	throw \"Expected a boolean at \" + path + \"!\";");
			lines.push("}");
		} else {
			lines.push("autoguard.Boolean");
		}
		return lines.join(options.eol);
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
	private value: boolean;

	constructor(value: boolean) {
		this.value = value;
	}

	generateType(options: Options): string {
		return "" + this.value;
	}

	static readonly INSTANCE_TRUE = new BooleanLiteralType(true);
	static readonly INSTANCE_FALSE = new BooleanLiteralType(false);

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		if (options.standalone) {
			lines.push("(subject, path) => {");
			lines.push("	if (subject === " + this.generateType({ ...options, eol: options.eol + "\t" }) + ") {");
			lines.push("		return subject;");
			lines.push("	}");
			lines.push("	throw \"Expected " + this.value + " at \" + path + \"!\";");
			lines.push("}");
		} else {
			lines.push("autoguard.BooleanLiteral.of(" + this.generateType({ ...options, eol: options.eol }) + ")");
		}
		return lines.join(options.eol);
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
	private type: Type;

	constructor(type: Type) {
		this.type = type;
	}

	generateType(options: Options): string {
		return "(" + this.type.generateType(options) + ")";
	}

	generateTypeGuard(options: Options): string {
		return this.type.generateTypeGuard(options);
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
	private types: Set<Type>;

	constructor() {
		this.types = new Set<Type>();
	}

	add(type: Type): this {
		this.types.add(type);
		return this;
	}

	generateType(options: Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push(type.generateType(options));
		}
		let string = lines.join(" & ");
		return string
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		if (options.standalone) {
			lines.push("(subject, path) => {");
			for (let type of this.types) {
				lines.push("	(" + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }) + ")(subject, path);");
			}
			lines.push("	return subject;");
			lines.push("}");
			return lines.join(options.eol);
		} else {
			for (let type of this.types) {
				lines.push("	" + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }));
			}
			return "autoguard.Intersection.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
		}
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

	generateType(options: Options): string {
		return "null";
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		if (options.standalone) {
			lines.push("(subject, path) => {");
			lines.push("	if (subject === null) {");
			lines.push("		return subject;");
			lines.push("	}");
			lines.push("	throw \"Expected null at \" + path + \"!\";");
			lines.push("}");
		} else {
			lines.push("autoguard.Null");
		}
		return lines.join(options.eol);
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

	generateType(options: Options): string {
		return "number";
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		if (options.standalone) {
			lines.push("(subject, path) => {");
			lines.push("	if ((subject != null) && (subject.constructor === globalThis.Number)) {");
			lines.push("		return subject as number;");
			lines.push("	}");
			lines.push("	throw \"Expected a number at \" + path + \"!\";");
			lines.push("}");
		} else {
			lines.push("autoguard.Number");
		}
		return lines.join(options.eol);
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
	private value: number;

	constructor(value: number) {
		this.value = value;
	}

	generateType(options: Options): string {
		return "" + this.value;
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		if (options.standalone) {
			lines.push("(subject, path) => {");
			lines.push("	if (subject === " + this.generateType({ ...options, eol: options.eol + "\t" }) + ") {");
			lines.push("		return subject;");
			lines.push("	}");
			lines.push("	throw \"Expected " + this.value + " at \" + path + \"!\";");
			lines.push("}");
		} else {
			lines.push("autoguard.NumberLiteral.of(" + this.generateType({ ...options, eol: options.eol }) + ")");
		}
		return lines.join(options.eol);
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
	private members: Map<string, ObjectMember>;

	constructor() {
		this.members = new Map<string, ObjectMember>();
	}

	add(key: string, value: ObjectMember): this {
		this.members.set(key, value);
		return this;
	}

	generateType(options: Options): string {
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

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		if (options.standalone) {
			lines.push("(subject, path) => {");
			lines.push("	if ((subject != null) && (subject.constructor === globalThis.Object)) {");
			for (let [key, value] of this.members) {
				let type = value.type;
				if (value.optional) {
					let union = new UnionType();
					union.add(UndefinedType.INSTANCE);
					union.add(type);
					type = union;
				}
				lines.push("		(" + type.generateTypeGuard({ ...options, eol: options.eol + "\t\t" }) + ")(subject[\"" + key + "\"], path + \"[\\\"" + key + "\\\"]\");");
			}
			lines.push("		return subject;");
			lines.push("	}");
			lines.push("	throw \"Expected an object at \" + path + \"!\";");
			lines.push("}");
			return lines.join(options.eol);
		} else {
			let optional = new Array<string>();
			let required = new Array<string>();
			for (let [key, value] of this.members) {
				let type = value.type;
				if (value.optional) {
					let union = new UnionType();
					union.add(UndefinedType.INSTANCE);
					union.add(type);
					type = union;
					optional.push("	\"" + key + "\": " + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }));
				} else {
					required.push("	\"" + key + "\": " + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }));
				}
			}
			let string1 = required.length > 0 ? options.eol + required.join("," + options.eol) + options.eol : "";
			let string2 = optional.length > 0 ? options.eol + optional.join("," + options.eol) + options.eol : "";
			return "autoguard.Object.of({" + string1 + "}, {" + string2 + "})";
		}
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
	private type: Type;

	constructor(type: Type) {
		this.type = type;
	}

	generateType(options: Options): string {
		return "Record<string, undefined | " + this.type.generateType(options) + ">";
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		if (options.standalone) {
			lines.push("(subject, path) => {");
			lines.push("	if ((subject != null) && (subject.constructor === globalThis.Object)) {");
			lines.push("		for (let key of globalThis.Object.keys(subject)) {");
			lines.push("			(" + this.type.generateTypeGuard({ ...options, eol: options.eol + "\t\t\t" }) + ")(subject[key], path + \"[\\\"\" + key + \"\\\"]\");");
			lines.push("		}");
			lines.push("		return subject;");
			lines.push("	}");
			lines.push("	throw \"Expected a record at \" + path + \"!\";");
			lines.push("}");
		} else {
			lines.push("autoguard.Record.of(" + this.type.generateTypeGuard({ ...options, eol: options.eol }) + ")");
		}
		return lines.join(options.eol);
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
	private typename: string;

	constructor(typename: string) {
		this.typename = typename;
	}

	generateType(options: Options): string {
		return this.typename;
	}

	generateTypeGuard(options: Options): string {
		if (options.standalone) {
			return this.typename + ".as";
		} else {
			return this.typename;
		}
	}

	static parse(tokenizer: tokenization.Tokenizer): ReferenceType {
		return tokenizer.newContext((read, peek) => {
			if (peek()?.family === "@") {
				tokenization.expect(read(), "@");
			}
			let value = tokenization.expect(read(), "IDENTIFIER").value;
			return new ReferenceType(value);
		});
	}
};

export class StringType implements Type {
	constructor() {

	}

	generateType(options: Options): string {
		return "string";
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		if (options.standalone) {
			lines.push("(subject, path) => {");
			lines.push("	if ((subject != null) && (subject.constructor === globalThis.String)) {");
			lines.push("		return subject as string;");
			lines.push("	}");
			lines.push("	throw \"Expected a string at \" + path + \"!\";");
			lines.push("}");
		} else {
			lines.push("autoguard.String");
		}
		return lines.join(options.eol);
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
	private value: string;

	constructor(value: string) {
		this.value = value;
	}

	generateType(options: Options): string {
		return "\"" + this.value + "\"";
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		if (options.standalone) {
			lines.push("(subject, path) => {");
			lines.push("	if (subject === " + this.generateType({ ...options, eol: options.eol + "\t" }) + ") {");
			lines.push("		return subject;");
			lines.push("	}");
			lines.push("	throw \"Expected \\\"" + this.value + "\\\" at \" + path + \"!\";");
			lines.push("}");
		} else {
			lines.push("autoguard.StringLiteral.of(\"" + this.value + "\")");
		}
		return lines.join(options.eol);
	}

	static parse(tokenizer: tokenization.Tokenizer): StringLiteralType {
		return tokenizer.newContext((read, peek) => {
			let value = tokenization.expect(read(), "STRING_LITERAL").value;
			return new StringLiteralType(value.slice(1, -1));
		});
	}
};

export class TupleType implements Type {
	private types: Array<Type>;

	constructor() {
		this.types = new Array<Type>();
	}

	add(type: Type): this {
		this.types.push(type);
		return this;
	}

	generateType(options: Options): string {
		let strings = new Array<string>();
		for (let type of this.types) {
			strings.push("	" + type.generateType({ ...options, eol: options.eol + "\t" }));
		}
		let string = strings.length > 0 ? options.eol + strings.join("," + options.eol) + options.eol : "";
		return "[" + string + "]";
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		if (options.standalone) {
			lines.push("(subject, path) => {");
			lines.push("	if ((subject != null) && (subject.constructor === globalThis.Array)) {");
			for (let i = 0; i < this.types.length; i++) {
				let type = this.types[i];
				lines.push("		(" + type.generateTypeGuard({ ...options, eol: options.eol + "\t\t" }) + ")(subject[" + i + "], path + \"[" + i + "]\");");
			}
			lines.push("		return subject as " + this.generateType({ ...options, eol: options.eol + "\t\t" }) + ";");
			lines.push("	}");
			lines.push("	throw \"Expected a tuple at \" + path + \"!\";");
			lines.push("}");
			return lines.join(options.eol);
		} else {
			for (let type of this.types) {
				lines.push("	" + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }));
			}
			let string = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
			return "autoguard.Tuple.of(" + string + ")";
		}
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

	generateType(options: Options): string {
		return "undefined";
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		if (options.standalone) {
			lines.push("(subject, path) => {");
			lines.push("	if (subject === undefined) {");
			lines.push("		return subject;");
			lines.push("	}");
			lines.push("	throw \"Expected undefined at \" + path + \"!\";");
			lines.push("}");
		} else {
			lines.push("autoguard.Undefined");
		}
		return lines.join(options.eol);
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
	private types: Set<Type>;

	constructor() {
		this.types = new Set<Type>();
	}

	add(type: Type): this {
		this.types.add(type);
		return this;
	}

	generateType(options: Options): string {
		let lines = new Array<string>();
		for (let type of this.types) {
			lines.push(type.generateType(options));
		}
		let string = lines.join(" | ");
		return string
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		if (options.standalone) {
			lines.push("(subject, path) => {");
			for (let type of this.types) {
				lines.push("	try {");
				lines.push("		return (" + type.generateTypeGuard({ ...options, eol: options.eol + "\t\t" }) + ")(subject, path);");
				lines.push("	} catch (error) {}");
			}
			lines.push("	throw \"Expected a union at \" + path + \"!\";");
			lines.push("}");
			return lines.join(options.eol);
		} else {
			for (let type of this.types) {
				lines.push("	" + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }));
			}
			return "autoguard.Union.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
		}
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
	private types: Map<string, Type>;

	constructor() {
		this.types = new Map<string, Type>();
	}

	add(key: string, value: Type): this {
		this.types.set(key, value);
		return this;
	}

	generateModule(options: Options): string {
		let lines = new Array<string>();
		lines.push("// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.");
		lines.push("");
		if (!options.standalone) {
			lines.push("import { guards as autoguard } from \"@joelek/ts-autoguard\";");
			lines.push("");
		}
		for (let [key, value] of this.types) {
			lines.push("export type " + key + " = " + value.generateType(options) + ";");
			lines.push("");
			if (options.standalone) {
				lines.push("export const " + key + " = {");
				lines.push("	as(subject: any, path: string = \"\"): " + key + " {");
				lines.push("		return (" + value.generateTypeGuard({ ...options, eol: options.eol + "\t\t" }) + ")(subject, path);");
				lines.push("	},");
				lines.push("	is(subject: any): subject is " + key + " {");
				lines.push("		try {");
				lines.push("			this.as(subject);");
				lines.push("		} catch (error) {");
				lines.push("			return false;");
				lines.push("		}");
				lines.push("		return true;");
				lines.push("	}");
				lines.push("};");
				lines.push("");
			} else {
				lines.push("export const " + key + " = " + value.generateTypeGuard({ ...options, eol: options.eol }) + ";");
				lines.push("");
			}
		}
		let autoguard = new ObjectType();
		for (let [key, value] of this.types) {
			autoguard.add(key, {
				type: new ReferenceType(key),
				optional: false
			});
		}
		lines.push("export type Autoguard = " + autoguard.generateType(options) + ";");
		lines.push("");
		lines.push("export const Autoguard = " + autoguard.generateType(options) + ";");
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
