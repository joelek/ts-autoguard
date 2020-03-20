export class Identifier {
	static parse(string: string): string {
		let parts = /^([A-Za-z][A-Za-z0-9_]*)$/s.exec(string);
		if (parts !== null) {
			return parts[1];
		}
		throw "Not an Identifier!";
	}
};

export class StringLiteral {
	static parse(string: string): string {
		let parts = /^["]([A-Za-z0-9_-]*)["]$/s.exec(string);
		if (parts !== null) {
			return parts[1];
		}
		throw "Not a StringLiteral!";
	}
}

export type Options = {
	eol: string;
	standalone: boolean;
};

export interface Type {
	generateType(options: Options): string;
	generateTypeGuard(options: Options): string;
};

export const Type = {
	parse(string: string): Type {
		try {
			return AnyType.parse(string);
		} catch (error) {}
		try {
			return ArrayType.parse(string);
		} catch (error) {}
		try {
			return BooleanType.parse(string);
		} catch (error) {}
		try {
			return IntersectionType.parse(string);
		} catch (error) {}
		try {
			return NullType.parse(string);
		} catch (error) {}
		try {
			return NumberType.parse(string);
		} catch (error) {}
		try {
			return NumberLiteralType.parse(string);
		} catch (error) {}
		try {
			return ObjectType.parse(string);
		} catch (error) {}
		try {
			return RecordType.parse(string);
		} catch (error) {}
		try {
			return ReferenceType.parse(string);
		} catch (error) {}
		try {
			return StringType.parse(string);
		} catch (error) {}
		try {
			return StringLiteralType.parse(string);
		} catch (error) {}
		try {
			return TupleType.parse(string);
		} catch (error) {}
		try {
			return UndefinedType.parse(string);
		} catch (error) {}
		try {
			return UnionType.parse(string);
		} catch (error) {}
		throw "Not a Type!";
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
		lines.push("(subject, path) => {");
		lines.push("	return subject;");
		lines.push("}");
		return lines.join(options.eol);
	}

	static readonly INSTANCE = new AnyType();

	static parse(string: string): Type {
		if (/^\s*any\s*$/s.exec(string) !== null) {
			return AnyType.INSTANCE;
		}
		throw "Not an AnyType!";
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
		lines.push("(subject, path) => {");
		lines.push("	if ((subject != null) && (subject.constructor === globalThis.Array)) {");
		lines.push("		for (let i = 0; i < subject.length; i++) {");
		lines.push("			(" + this.type.generateTypeGuard({ ...options, eol: options.eol + "\t\t\t" }) + ")(subject[i], path + \"[\" + i + \"]\");");
		lines.push("		}");
		lines.push("		return subject;");
		lines.push("	}");
		lines.push("	throw \"Type guard \\\"Array\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(options.eol);
	}

	static parse(string: string): Type {
		let parts = /^\s*(.+)\s*\[\s*\]\s*$/s.exec(string);
		if (parts !== null) {
			return new ArrayType(Type.parse(parts[1]));
		}
		throw "Not an ArrayType!";
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
			lines.push("		return subject;");
			lines.push("	}");
			lines.push("	throw \"Type guard \\\"Boolean\\\" failed at \\\"\" + path + \"\\\"!\";");
			lines.push("}");
		} else {
			lines.push("autoguard.guards.Boolean.as");
		}
		return lines.join(options.eol);
	}

	static readonly INSTANCE = new BooleanType();

	static parse(string: string): Type {
		if (/^\s*boolean\s*$/s.exec(string) !== null) {
			return BooleanType.INSTANCE;
		}
		throw "Not a BooleanType!";
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
		if (this.types.size > 1) {
			return "(" + string + ")";
		}
		return string
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		lines.push("(subject, path) => {");
		for (let type of this.types) {
			lines.push("	(" + type.generateTypeGuard({ ...options, eol: options.eol + "\t" }) + ")(subject, path);");
		}
		lines.push("	return subject;");
		lines.push("}");
		return lines.join(options.eol);
	}

	static parse(string: string): Type {
		let parts = /^\s*\(\s*(.+)\s*\)\s*$/s.exec(string);
		if (parts !== null) {
			let instance = new IntersectionType();
			let segments = parts[1].split("&");
			let offset = 0;
			let length = 1;
			while (offset + length <= segments.length) {
				try {
					let string = segments.slice(offset, offset + length).join("&");
					let type = Type.parse(string);
					instance.add(type);
					offset = offset + length;
					length = 1;
					if (offset >= segments.length) {
						if (instance.types.size === 1) {
							return type;
						}
						if (instance.types.size > 1) {
							return instance;
						}
					}
				} catch (error) {
					length = length + 1;
				}
			}
		}
		throw "Not an IntersectionType!";
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
			lines.push("	throw \"Type guard \\\"Null\\\" failed at \\\"\" + path + \"\\\"!\";");
			lines.push("}");
		} else {
			lines.push("autoguard.guards.Null.as");
		}
		return lines.join(options.eol);
	}

	static readonly INSTANCE = new NullType();

	static parse(string: string): Type {
		if (/^\s*null\s*$/s.exec(string) !== null) {
			return NullType.INSTANCE;
		}
		throw "Not a NullType!";
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
			lines.push("		return subject;");
			lines.push("	}");
			lines.push("	throw \"Type guard \\\"Number\\\" failed at \\\"\" + path + \"\\\"!\";");
			lines.push("}");
		} else {
			lines.push("autoguard.guards.Number.as");
		}
		return lines.join(options.eol);
	}

	static readonly INSTANCE = new NumberType();

	static parse(string: string): Type {
		if (/^\s*number\s*$/s.exec(string) !== null) {
			return NumberType.INSTANCE;
		}
		throw "Not a NumberType!";
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
		lines.push("(subject, path) => {");
		lines.push("	if (subject === " + this.generateType({ ...options, eol: options.eol + "\t" }) + ") {");
		lines.push("		return subject;");
		lines.push("	}");
		lines.push("	throw \"Type guard \\\"NumberLiteral\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(options.eol);
	}

	static parse(string: string): Type {
		let parts = /^\s*([0-9]|([1-9][0-9]*))\s*$/s.exec(string);
		if (parts !== null) {
			let value = Number.parseInt(parts[1]);
			return new NumberLiteralType(value);
		}
		throw "Not a NumberLiteralType!";
	}
};

export class ObjectKey {
	static parse(string: string): string {
		try {
			return Identifier.parse(string);
		} catch (error) {}
		try {
			return StringLiteral.parse(string);
		} catch (error) {}
		throw "Not an ObjectKey!";
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
		lines.push("	throw \"Type guard \\\"Object\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(options.eol);
	}

	[Symbol.iterator](): Iterator<[string, ObjectMember]> {
		return this.members[Symbol.iterator]();
	}

	static parse(string: string): ObjectType {
		let parts = /^\s*\{\s*(.*)\s*\}\s*$/s.exec(string);
		if (parts !== null) {
			let instance = new ObjectType();
			if (/^\s*$/s.test(parts[1])) {
				return instance;
			}
			let segments = parts[1].split(",");
			let offset = 0;
			let length = 1;
			while (offset + length <= segments.length) {
				try {
					let string = segments.slice(offset, offset + length).join(",");
					let parts = /^\s*([^?:]+)\s*([?]?)\s*\:(.+)$/s.exec(string);
					if (parts === null) {
						break;
					}
					let key = ObjectKey.parse(parts[1]);
					let optional = parts[2] === "?";
					let type = Type.parse(parts[3]);
					instance.add(key, {
						type,
						optional
					});
					offset = offset + length;
					length = 1;
					if (offset >= segments.length) {
						return instance;
					}
				} catch (error) {
					length = length + 1;
				}
			}
		}
		throw "Not an ObjectType!";
	}
};

export class RecordType implements Type {
	private type: Type;

	constructor(type: Type) {
		this.type = type;
	}

	generateType(options: Options): string {
		return "{ [key: string]: " + this.type.generateType(options) + " }";
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		lines.push("(subject, path) => {");
		lines.push("	if ((subject != null) && (subject.constructor === globalThis.Object)) {");
		lines.push("		for (let key of globalThis.Object.keys(subject)) {");
		lines.push("			(" + this.type.generateTypeGuard({ ...options, eol: options.eol + "\t\t\t" }) + ")(subject[key], path + \"[\\\"\" + key + \"\\\"]\");");
		lines.push("		}");
		lines.push("		return subject;");
		lines.push("	}");
		lines.push("	throw \"Type guard \\\"Record\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(options.eol);
	}

	static parse(string: string): Type {
		let parts = /^\s*\{\s*(.+)\s*\}\s*$/s.exec(string);
		if (parts !== null) {
			return new RecordType(Type.parse(parts[1]));
		}
		throw "Not a RecordType!";
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
		return this.typename + ".as";
	}

	static parse(string: string): Type {
		let parts = /^\s*@([A-Za-z][A-Za-z0-9_]*)\s*$/s.exec(string);
		if (parts !== null) {
			return new ReferenceType(parts[1]);
		}
		throw "Not a ReferenceType!";
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
			lines.push("		return subject;");
			lines.push("	}");
			lines.push("	throw \"Type guard \\\"String\\\" failed at \\\"\" + path + \"\\\"!\";");
			lines.push("}");
		} else {
			lines.push("autoguard.guards.String.as");
		}
		return lines.join(options.eol);
	}

	static readonly INSTANCE = new StringType();

	static parse(string: string): Type {
		if (/^\s*string\s*$/s.exec(string) !== null) {
			return StringType.INSTANCE;
		}
		throw "Not a StringType!";
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
		lines.push("(subject, path) => {");
		lines.push("	if (subject === " + this.generateType({ ...options, eol: options.eol + "\t" }) + ") {");
		lines.push("		return subject;");
		lines.push("	}");
		lines.push("	throw \"Type guard \\\"StringLiteral\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(options.eol);
	}

	static parse(string: string): Type {
		let parts = /^\s*"([A-Za-z0-9_-]*)"\s*$/s.exec(string);
		if (parts !== null) {
			let value = parts[1];
			return new StringLiteralType(value);
		}
		throw "Not a StringLiteralType!";
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
		lines.push("(subject, path) => {");
		lines.push("	if ((subject != null) && (subject.constructor === globalThis.Array)) {");
		for (let i = 0; i < this.types.length; i++) {
			let type = this.types[i];
			lines.push("		(" + type.generateTypeGuard({ ...options, eol: options.eol + "\t\t" }) + ")(subject[" + i + "], path + \"[" + i + "]\");");
		}
		lines.push("		return subject;");
		lines.push("	}");
		lines.push("	throw \"Type guard \\\"Tuple\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(options.eol);
	}

	static parse(string: string): Type {
		let parts = /^\s*\[\s*(.+)\s*\]\s*$/s.exec(string);
		if (parts !== null) {
			let instance = new TupleType();
			let segments = parts[1].split(",");
			let offset = 0;
			let length = 1;
			while (offset + length <= segments.length) {
				try {
					let string = segments.slice(offset, offset + length).join(",");
					let type = Type.parse(string);
					instance.add(type);
					offset = offset + length;
					length = 1;
					if (offset >= segments.length) {
						return instance;
					}
				} catch (error) {
					length = length + 1;
				}
			}
		}
		throw "Not a TupleType!";
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
			lines.push("	throw \"Type guard \\\"Undefined\\\" failed at \\\"\" + path + \"\\\"!\";");
			lines.push("}");
		} else {
			lines.push("autoguard.guards.Undefined.as");
		}
		return lines.join(options.eol);
	}

	static readonly INSTANCE = new UndefinedType();

	static parse(string: string): Type {
		if (/^\s*undefined\s*$/s.exec(string) !== null) {
			return UndefinedType.INSTANCE;
		}
		throw "Not an UndefinedType!";
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
		if (this.types.size > 1) {
			return "(" + string + ")";
		}
		return string
	}

	generateTypeGuard(options: Options): string {
		let lines = new Array<string>();
		lines.push("(subject, path) => {");
		for (let type of this.types) {
			lines.push("	try {");
			lines.push("		return (" + type.generateTypeGuard({ ...options, eol: options.eol + "\t\t" }) + ")(subject, path);");
			lines.push("	} catch (error) {}");
		}
		lines.push("	throw \"Type guard \\\"Union\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(options.eol);
	}

	static parse(string: string): Type {
		let parts = /^\s*\(\s*(.+)\s*\)\s*$/s.exec(string);
		if (parts !== null) {
			let instance = new UnionType();
			let segments = parts[1].split("|");
			let offset = 0;
			let length = 1;
			while (offset + length <= segments.length) {
				try {
					let string = segments.slice(offset, offset + length).join("|");
					let type = Type.parse(string);
					instance.add(type);
					offset = offset + length;
					length = 1;
					if (offset >= segments.length) {
						if (instance.types.size === 1) {
							return type;
						}
						if (instance.types.size > 1) {
							return instance;
						}
					}
				} catch (error) {
					length = length + 1;
				}
			}
		}
		throw "Not a UnionType!";
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
			lines.push("import * as autoguard from \"@joelek/ts-autoguard\";");
			lines.push("");
		}
		for (let [key, value] of this.types) {
			lines.push("export type " + key + " = " + value.generateType(options) + ";");
			lines.push("");
			lines.push("export const " + key + " = {");
			lines.push("	as(subject: any, path: string = \"\"): " + key + " {");
			lines.push("		return (" + value.generateTypeGuard({ ...options, eol: options.eol + "\t\t" }) + ")(subject, path);");
			lines.push("	},");
			lines.push("	is(subject: any): subject is " + key + " {");
			lines.push("		try {");
			lines.push("			" + key + ".as(subject);");
			lines.push("		} catch (error) {");
			lines.push("			return false;");
			lines.push("		}");
			lines.push("		return true;");
			lines.push("	}");
			lines.push("};");
			lines.push("");
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

	static parse(string: string): Schema {
		let schema = ObjectType.parse(string);
		let instance = new Schema();
		for (let [key, value] of schema) {
			instance.add(key, value.type);
		}
		return instance;
	}
};
