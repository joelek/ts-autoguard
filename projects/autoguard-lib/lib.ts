interface Type {
	generateType(eol: string): string;
	generateTypeGuard(eol: string): string;
}

const Type = {
	parse(string: string): Type {
		string = string.trim();
		try {
			return ArrayType.parse(string);
		} catch (error) {}
		try {
			return BooleanType.parse(string);
		} catch (error) {}
		try {
			return NullType.parse(string);
		} catch (error) {}
		try {
			return NumberType.parse(string);
		} catch (error) {}
		try {
			return ObjectType.parse(string);
		} catch (error) {}
		try {
			return RecordType.parse(string);
		} catch (error) {}
		try {
			return StringType.parse(string);
		} catch (error) {}
		try {
			return UndefinedType.parse(string);
		} catch (error) {}
		try {
			return UnionType.parse(string);
		} catch (error) {}
		try {
			return ReferenceType.parse(string);
		} catch (error) {}
		throw "Not a Type!";
	}
};

class ArrayType implements Type {
	private type: Type;

	constructor(type: Type) {
		this.type = type;
	}

	generateType(eol: string): string {
		return "(" + this.type.generateType(eol) + ")[]";
	}

	generateTypeGuard(eol: string): string {
		let lines = new globalThis.Array<string>();
		lines.push("(subject, path) => {");
		lines.push("	if ((subject != null) && (subject.constructor === globalThis.Array)) {");
		lines.push("		for (let i = 0; i < subject.length; i++) {");
		lines.push("			(" + this.type.generateTypeGuard(eol + "\t\t\t") + ")(subject[i], path + \"[\" + i + \"]\");");
		lines.push("		}");
		lines.push("		return subject;");
		lines.push("	}");
		lines.push("	throw \"Type guard \\\"Array\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(eol);
	}

	static parse(string: string): Type {
		let parts = /^\[(.+)\]$/is.exec(string);
		if (parts !== null) {
			return new ArrayType(Type.parse(parts[1]));
		}
		throw "Not an ArrayType!";
	}
}

class BooleanType implements Type {
	constructor() {

	}

	generateType(eol: string): string {
		return "boolean";
	}

	generateTypeGuard(eol: string): string {
		let lines = new globalThis.Array<string>();
		lines.push("(subject, path) => {");
		lines.push("	if ((subject != null) && (subject.constructor === globalThis.Boolean)) {");
		lines.push("		return subject;");
		lines.push("	}");
		lines.push("	throw \"Type guard \\\"Boolean\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(eol);
	}

	static readonly INSTANCE = new BooleanType();

	static parse(string: string): Type {
		if (string.toLowerCase() === "boolean") {
			return BooleanType.INSTANCE;
		}
		throw "Not a BooleanType!";
	}
}

class NullType implements Type {
	constructor() {

	}

	generateType(eol: string): string {
		return "null";
	}

	generateTypeGuard(eol: string): string {
		let lines = new globalThis.Array<string>();
		lines.push("(subject, path) => {");
		lines.push("	if (subject === null) {");
		lines.push("		return subject;");
		lines.push("	}");
		lines.push("	throw \"Type guard \\\"Null\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(eol);
	}

	static readonly INSTANCE = new NullType();

	static parse(string: string): Type {
		if (string.toLowerCase() === "null") {
			return NullType.INSTANCE;
		}
		throw "Not a NullType!";
	}
}

class NumberType implements Type {
	constructor() {

	}

	generateType(eol: string): string {
		return "number";
	}

	generateTypeGuard(eol: string): string {
		let lines = new globalThis.Array<string>();
		lines.push("(subject, path) => {");
		lines.push("	if ((subject != null) && (subject.constructor === globalThis.Number)) {");
		lines.push("		return subject;");
		lines.push("	}");
		lines.push("	throw \"Type guard \\\"Number\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(eol);
	}

	static readonly INSTANCE = new NumberType();

	static parse(string: string): Type {
		if (string.toLowerCase() === "number") {
			return NumberType.INSTANCE;
		}
		throw "Not a NumberType!";
	}
}

class ObjectType implements Type {
	private members: globalThis.Map<string, Type>;

	constructor() {
		this.members = new globalThis.Map<string, Type>();
	}

	add(key: string, value: Type): this {
		this.members.set(key, value);
		return this;
	}

	generateType(eol: string): string {
		let lines = new globalThis.Array<string>();
		lines.push("{");
		for (let [key, value] of this.members) {
			lines.push("	" + key + ": " + value.generateType(eol + "\t") + ";");
		}
		lines.push("}");
		return lines.join(eol);
	}

	generateTypeGuard(eol: string): string {
		let lines = new globalThis.Array<string>();
		lines.push("(subject, path) => {");
		lines.push("	if ((subject != null) && (subject.constructor === globalThis.Object)) {");
		for (let [key, value] of this.members) {
			lines.push("		(" + value.generateTypeGuard(eol + "\t\t") + ")(subject." + key + ", path + \".\" + \"" + key + "\");");
		}
		lines.push("		return subject;");
		lines.push("	}");
		lines.push("	throw \"Type guard \\\"Object\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(eol);
	}

	[Symbol.iterator](): Iterable<[string, Type]> {
		return this.members[Symbol.iterator]();
	}

	static parse(string: string): ObjectType {
		let parts = /^\{\s*(.*)\s*\}$/is.exec(string);
		if (parts !== null) {
			let instance = new ObjectType();
			if (/^\s*$/is.test(parts[1])) {
				return instance;
			}
			let segments = parts[1].split(",");
			let offset = 0;
			let length = 1;
			while (offset + length <= segments.length) {
				try {
					let string = segments.slice(offset, offset + length).join(",");
					let parts = /^\s*([a-z][a-z0-9_]*)\s*\:(.+)$/is.exec(string);
					if (parts === null) {
						break;
					}
					let type = Type.parse(parts[2]);
					instance.add(parts[1], type);
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
}

class RecordType implements Type {
	private type: Type;

	constructor(type: Type) {
		this.type = type;
	}

	generateType(eol: string): string {
		return "{ [key: string]: " + this.type.generateType(eol) + " }";
	}

	generateTypeGuard(eol: string): string {
		let lines = new globalThis.Array<string>();
		lines.push("(subject, path) => {");
		lines.push("	if ((subject != null) && (subject.constructor === globalThis.Object)) {");
		lines.push("		for (let key of globalThis.Object.keys(subject)) {");
		lines.push("			(" + this.type.generateTypeGuard(eol + "\t\t\t") + ")(subject[key], path + \"[\\\"\" + key + \"\\\"]\");");
		lines.push("		}");
		lines.push("		return subject;");
		lines.push("	}");
		lines.push("	throw \"Type guard \\\"Record\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(eol);
	}

	static parse(string: string): Type {
		let parts = /^\{(.+)\}$/is.exec(string);
		if (parts !== null) {
			return new RecordType(Type.parse(parts[1]));
		}
		throw "Not a RecordType!";
	}
}

class ReferenceType implements Type {
	private typename: string;

	constructor(typename: string) {
		this.typename = typename;
	}

	generateType(eol: string): string {
		return this.typename;
	}

	generateTypeGuard(eol: string): string {
		return this.typename + ".as";
	}

	static parse(string: string): Type {
		if (/^[a-z][a-z0-9_]*$/is.test(string)) {
			return new ReferenceType(string);
		}
		throw "Not a ReferenceType!";
	}
}

class StringType implements Type {
	constructor() {

	}

	generateType(eol: string): string {
		return "string";
	}

	generateTypeGuard(eol: string): string {
		let lines = new globalThis.Array<string>();
		lines.push("(subject, path) => {");
		lines.push("	if ((subject != null) && (subject.constructor === globalThis.String)) {");
		lines.push("		return subject;");
		lines.push("	}");
		lines.push("	throw \"Type guard \\\"String\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(eol);
	}

	static readonly INSTANCE = new StringType();

	static parse(string: string): Type {
		if (string.toLowerCase() === "string") {
			return StringType.INSTANCE;
		}
		throw "Not a StringType!";
	}
}

class UndefinedType implements Type {
	constructor() {

	}

	generateType(eol: string): string {
		return "undefined";
	}

	generateTypeGuard(eol: string): string {
		let lines = new globalThis.Array<string>();
		lines.push("(subject, path) => {");
		lines.push("	if (subject === undefined) {");
		lines.push("		return subject;");
		lines.push("	}");
		lines.push("	throw \"Type guard \\\"Undefined\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(eol);
	}

	static readonly INSTANCE = new UndefinedType();

	static parse(string: string): Type {
		if (string.toLowerCase() === "undefined") {
			return UndefinedType.INSTANCE;
		}
		throw "Not an UndefinedType!";
	}
}

class UnionType implements Type {
	private types: globalThis.Set<Type>;

	constructor() {
		this.types = new globalThis.Set<Type>();
	}

	add(type: Type): this {
		this.types.add(type);
		return this;
	}

	generateType(eol: string): string {
		let lines = new globalThis.Array<string>();
		for (let type of this.types) {
			lines.push(type.generateType(eol));
		}
		return lines.join(" | ");
	}

	generateTypeGuard(eol: string): string {
		let lines = new globalThis.Array<string>();
		lines.push("(subject, path) => {");
		for (let type of this.types) {
			lines.push("	try {");
			lines.push("		return (" + type.generateTypeGuard(eol + "\t\t") + ")(subject, path);");
			lines.push("	} catch (error) {}");
		}
		lines.push("	throw \"Type guard \\\"Union\\\" failed at \\\"\" + path + \"\\\"!\";");
		lines.push("}");
		return lines.join(eol);
	}

	static parse(string: string): Type {
		let instance = new UnionType();
		let segments = string.split("/");
		let offset = 0;
		let length = 1;
		while (offset + length <= segments.length) {
			try {
				let string = segments.slice(offset, offset + length).join("/");
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
		throw "Not a UnionType!";
	}
}

class Schema {
	private types: globalThis.Map<string, Type>;

	constructor() {
		this.types = new globalThis.Map<string, Type>();
	}

	add(key: string, value: Type): this {
		this.types.set(key, value);
		return this;
	}

	generateModule(): string {
		let lines = new globalThis.Array<string>();
		lines.push("// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.");
		lines.push("");
		for (let [key, value] of this.types) {
			lines.push("export type " + key + " = " + value.generateType("\n") + ";");
			lines.push("");
			lines.push("export const " + key + " = {");
			lines.push("	as(subject: any, path: string = \"\"): " + key + " {");
			lines.push("		return (" + value.generateTypeGuard("\n\t\t") + ")(subject, path);");
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
		return lines.join("\n");
	}

	static parse(string: string): Schema {
		let schema = ObjectType.parse(string.trim());
		let instance = new Schema();
		for (let [key, value] of schema) {
			instance.add(key, value);
		}
		return instance;
	}
}

export function transform(string: string): string {
	return Schema.parse(string).generateModule();
}
