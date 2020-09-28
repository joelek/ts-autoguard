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
	parse(tokens: Array<tokenization.Token>, ...exclude: Typename[]): Type {
		try {
			let copy = tokens.slice();
			let type = UnionType.parse(copy, ...exclude);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = IntersectionType.parse(copy, ...exclude);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = ArrayType.parse(copy, ...exclude);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = AnyType.parse(copy);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = BooleanType.parse(copy);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = BooleanLiteralType.parse(copy);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = NullType.parse(copy);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = NumberType.parse(copy);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = NumberLiteralType.parse(copy);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = StringType.parse(copy);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = StringLiteralType.parse(copy);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = UndefinedType.parse(copy);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = ReferenceType.parse(copy);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = TupleType.parse(copy);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = ObjectType.parse(copy);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = GroupType.parse(copy);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		try {
			let copy = tokens.slice();
			let type = RecordType.parse(copy);
			tokens.splice(0, tokens.length - copy.length);
			return type;
		} catch (error) {}
		let token = tokenization.expect(tokens[0], undefined, undefined);
		throw `Syntax error! Unxpected ${token.value} at row ${token.row}, col ${token.col}!`;
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

	static parse(tokens: Array<tokenization.Token>): AnyType {
		tokenization.expect(tokens.shift(), undefined, "any");
		return AnyType.INSTANCE;
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

	static parse(tokens: Array<tokenization.Token>, ...exclude: Typename[]): ArrayType {
		if (exclude.includes("Array")) {
			throw `Recursion prevention!`;
		}
		let type = Type.parse(tokens, ...exclude, "Array");
		tokenization.expect(tokens.shift(), undefined, "[");
		tokenization.expect(tokens.shift(), undefined, "]");
		let array = new ArrayType(type);
		while (true) {
			if (tokens[0]?.value !== "[") {
				break;
			}
			if (tokens[1]?.value !== "]") {
				break;
			}
			tokenization.expect(tokens.shift(), undefined, "[");
			tokenization.expect(tokens.shift(), undefined, "]");
			array = new ArrayType(array);
		}
		return array;
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

	static parse(tokens: Array<tokenization.Token>): BooleanType {
		tokenization.expect(tokens.shift(), undefined, "boolean");
		return BooleanType.INSTANCE;
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

	static parse(tokens: Array<tokenization.Token>): BooleanLiteralType {
		let value = tokenization.expect(tokens.shift(), undefined, ["true", "false"]).value;
		return new BooleanLiteralType(value === "true");
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

	static parse(tokens: Array<tokenization.Token>): GroupType {
		tokenization.expect(tokens.shift(), undefined, "(");
		let type = Type.parse(tokens);
		tokenization.expect(tokens.shift(), undefined, ")");
		return new GroupType(type);
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

	static parse(tokens: Array<tokenization.Token>, ...exclude: Typename[]): IntersectionType {
		if (exclude.includes("Intersection")) {
			throw `Recursion prevention!`;
		}
		let type = Type.parse(tokens, ...exclude, "Intersection");
		let instance = new IntersectionType();
		instance.add(type);
		while (true) {
			tokenization.expect(tokens.shift(), undefined, "&");
			let type = Type.parse(tokens, ...exclude, "Intersection");
			instance.add(type);
			if (tokens[0]?.value !== "&") {
				break;
			}
		}
		return instance;
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

	static parse(tokens: Array<tokenization.Token>): NullType {
		tokenization.expect(tokens.shift(), undefined, "null");
		return NullType.INSTANCE;
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

	static parse(tokens: Array<tokenization.Token>): NumberType {
		tokenization.expect(tokens.shift(), undefined, "number");
		return NumberType.INSTANCE;
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

	static parse(tokens: Array<tokenization.Token>): NumberLiteralType {
		let value = tokenization.expect(tokens.shift(), "NUMBER_LITERAL", undefined).value;
		return new NumberLiteralType(Number.parseInt(value));
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
		return "{" + options.eol + lines.join("," + options.eol) + options.eol + "}";
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
			return "autoguard.Object.of<" + this.generateType(options) + ">({" + options.eol + lines.join("," + options.eol) + options.eol + "})";
		}
	}

	static parse(tokens: Array<tokenization.Token>): ObjectType {
		tokenization.expect(tokens.shift(), undefined, "{");
		let instance = new ObjectType();
		if (tokens[0]?.value !== "}") {
			while (true) {
				let optional = false;
				let token = tokenization.expect(tokens.shift(), ["IDENTIFIER", "STRING_LITERAL"], undefined);
				let key = token.family === "STRING_LITERAL" ? token.value.slice(1, -1) : token.value;
				if (tokens[0]?.value === "?") {
					tokens.shift();
					optional = true;
				}
				tokenization.expect(tokens.shift(), undefined, ":");
				let type = Type.parse(tokens);
				instance.add(key, {
					type,
					optional
				});
				if (tokens[0]?.value !== ",") {
					break;
				}
				tokenization.expect(tokens.shift(), undefined, ",");
			}
		}
		tokenization.expect(tokens.shift(), undefined, "}");
		return instance;
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

	static parse(tokens: Array<tokenization.Token>): RecordType {
		tokenization.expect(tokens.shift(), undefined, "{");
		let type = Type.parse(tokens);
		tokenization.expect(tokens.shift(), undefined, "}");
		return new RecordType(type);
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

	static parse(tokens: Array<tokenization.Token>): ReferenceType {
		if (tokens[0]?.value === "@") {
			tokenization.expect(tokens.shift(), undefined, "@");
		}
		let value = tokenization.expect(tokens.shift(), "IDENTIFIER", undefined).value;
		return new ReferenceType(value);
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

	static parse(tokens: Array<tokenization.Token>): StringType {
		tokenization.expect(tokens.shift(), undefined, "string");
		return StringType.INSTANCE;
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

	static parse(tokens: Array<tokenization.Token>): StringLiteralType {
		let value = tokenization.expect(tokens.shift(), "STRING_LITERAL", undefined).value;
		return new StringLiteralType(value.slice(1, -1));
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
		return "[" + options.eol + strings.join("," + options.eol) + options.eol + "]";
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
			return "autoguard.Tuple.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
		}
	}

	static parse(tokens: Array<tokenization.Token>): TupleType {
		tokenization.expect(tokens.shift(), undefined, "[");
		let instance = new TupleType();
		if (tokens[0]?.value !== "]") {
			while (true) {
				let type = Type.parse(tokens);
				instance.add(type);
				if (tokens[0]?.value !== ",") {
					break;
				}
				tokenization.expect(tokens.shift(), undefined, ",");
			}
		}
		tokenization.expect(tokens.shift(), undefined, "]");
		return instance;
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

	static parse(tokens: Array<tokenization.Token>): UndefinedType {
		tokenization.expect(tokens.shift(), undefined, "undefined");
		return UndefinedType.INSTANCE;
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

	static parse(tokens: Array<tokenization.Token>, ...exclude: Array<Typename>): UnionType {
		if (exclude.includes("Union")) {
			throw `Recursion prevention!`;
		}
		let type = Type.parse(tokens, ...exclude, "Union");
		let instance = new UnionType();
		instance.add(type);
		while (true) {
			tokenization.expect(tokens.shift(), undefined, "|");
			let type = Type.parse(tokens, ...exclude, "Union");
			instance.add(type);
			if (tokens[0]?.value !== "|") {
				break;
			}
		}
		return instance;
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

	static parse(tokens: Array<tokenization.Token>): Schema {
		tokenization.expect(tokens.shift(), undefined, "{");
		let instance = new Schema();
		if (tokens[0]?.value !== "}") {
			while (true) {
				let identifier = tokenization.expect(tokens.shift(), "IDENTIFIER", undefined).value;
				tokenization.expect(tokens.shift(), undefined, ":");
				let type = Type.parse(tokens);
				instance.add(identifier, type);
				if (tokens[0]?.value !== ",") {
					break;
				}
				tokenization.expect(tokens.shift(), undefined, ",");
			}
		}
		tokenization.expect(tokens.shift(), undefined, "}");
		if (tokens.length > 0) {
			throw `Syntax error! Unxpected ${tokens[0].value} at row ${tokens[0].row}, col ${tokens[0].col}!`;
		}
		return instance;
	}
};
