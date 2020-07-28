"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = exports.UnionType = exports.UndefinedType = exports.TupleType = exports.StringLiteralType = exports.StringType = exports.ReferenceType = exports.RecordType = exports.ObjectType = exports.ObjectKey = exports.NumberLiteralType = exports.NumberType = exports.NullType = exports.IntersectionType = exports.BooleanType = exports.ArrayType = exports.AnyType = exports.Type = exports.StringLiteral = exports.Identifier = void 0;
class Identifier {
    static parse(string) {
        let parts = /^([A-Za-z][A-Za-z0-9_]*)$/s.exec(string);
        if (parts !== null) {
            return parts[1];
        }
        throw "Not an Identifier!";
    }
}
exports.Identifier = Identifier;
;
class StringLiteral {
    static parse(string) {
        let parts = /^["]([A-Za-z0-9_-]*)["]$/s.exec(string);
        if (parts !== null) {
            return parts[1];
        }
        throw "Not a StringLiteral!";
    }
}
exports.StringLiteral = StringLiteral;
;
exports.Type = {
    parse(string) {
        try {
            return AnyType.parse(string);
        }
        catch (error) { }
        try {
            return ArrayType.parse(string);
        }
        catch (error) { }
        try {
            return BooleanType.parse(string);
        }
        catch (error) { }
        try {
            return IntersectionType.parse(string);
        }
        catch (error) { }
        try {
            return NullType.parse(string);
        }
        catch (error) { }
        try {
            return NumberType.parse(string);
        }
        catch (error) { }
        try {
            return NumberLiteralType.parse(string);
        }
        catch (error) { }
        try {
            return ObjectType.parse(string);
        }
        catch (error) { }
        try {
            return RecordType.parse(string);
        }
        catch (error) { }
        try {
            return ReferenceType.parse(string);
        }
        catch (error) { }
        try {
            return StringType.parse(string);
        }
        catch (error) { }
        try {
            return StringLiteralType.parse(string);
        }
        catch (error) { }
        try {
            return TupleType.parse(string);
        }
        catch (error) { }
        try {
            return UndefinedType.parse(string);
        }
        catch (error) { }
        try {
            return UnionType.parse(string);
        }
        catch (error) { }
        throw "Not a Type!";
    }
};
class AnyType {
    constructor() {
    }
    generateType(options) {
        return "any";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("(subject, path) => {");
        lines.push("	return subject;");
        lines.push("}");
        return lines.join(options.eol);
    }
    static parse(string) {
        if (/^\s*any\s*$/s.exec(string) !== null) {
            return AnyType.INSTANCE;
        }
        throw "Not an AnyType!";
    }
}
exports.AnyType = AnyType;
AnyType.INSTANCE = new AnyType();
;
class ArrayType {
    constructor(type) {
        this.type = type;
    }
    generateType(options) {
        return this.type.generateType(options) + "[]";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("(subject, path) => {");
        lines.push("	if ((subject != null) && (subject.constructor === globalThis.Array)) {");
        lines.push("		for (let i = 0; i < subject.length; i++) {");
        lines.push("			(" + this.type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t\t" })) + ")(subject[i], path + \"[\" + i + \"]\");");
        lines.push("		}");
        lines.push("		return subject;");
        lines.push("	}");
        lines.push("	throw \"Type guard \\\"Array\\\" failed at \\\"\" + path + \"\\\"!\";");
        lines.push("}");
        return lines.join(options.eol);
    }
    static parse(string) {
        let parts = /^\s*(.+)\s*\[\s*\]\s*$/s.exec(string);
        if (parts !== null) {
            return new ArrayType(exports.Type.parse(parts[1]));
        }
        throw "Not an ArrayType!";
    }
}
exports.ArrayType = ArrayType;
;
class BooleanType {
    constructor() {
    }
    generateType(options) {
        return "boolean";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        if (options.standalone) {
            lines.push("(subject, path) => {");
            lines.push("	if ((subject != null) && (subject.constructor === globalThis.Boolean)) {");
            lines.push("		return subject as boolean;");
            lines.push("	}");
            lines.push("	throw \"Type guard \\\"Boolean\\\" failed at \\\"\" + path + \"\\\"!\";");
            lines.push("}");
        }
        else {
            lines.push("autoguard.guards.Boolean.as");
        }
        return lines.join(options.eol);
    }
    static parse(string) {
        if (/^\s*boolean\s*$/s.exec(string) !== null) {
            return BooleanType.INSTANCE;
        }
        throw "Not a BooleanType!";
    }
}
exports.BooleanType = BooleanType;
BooleanType.INSTANCE = new BooleanType();
;
class IntersectionType {
    constructor() {
        this.types = new Set();
    }
    add(type) {
        this.types.add(type);
        return this;
    }
    generateType(options) {
        let lines = new Array();
        for (let type of this.types) {
            lines.push(type.generateType(options));
        }
        let string = lines.join(" & ");
        if (this.types.size > 1) {
            return "(" + string + ")";
        }
        return string;
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("(subject, path) => {");
        for (let type of this.types) {
            lines.push("	(" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })) + ")(subject, path);");
        }
        lines.push("	return subject;");
        lines.push("}");
        return lines.join(options.eol);
    }
    static parse(string) {
        let parts = /^\s*\(\s*(.+)\s*\)\s*$/s.exec(string);
        if (parts !== null) {
            let instance = new IntersectionType();
            let segments = parts[1].split("&");
            let offset = 0;
            let length = 1;
            while (offset + length <= segments.length) {
                try {
                    let string = segments.slice(offset, offset + length).join("&");
                    let type = exports.Type.parse(string);
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
                }
                catch (error) {
                    length = length + 1;
                }
            }
        }
        throw "Not an IntersectionType!";
    }
}
exports.IntersectionType = IntersectionType;
;
class NullType {
    constructor() {
    }
    generateType(options) {
        return "null";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        if (options.standalone) {
            lines.push("(subject, path) => {");
            lines.push("	if (subject === null) {");
            lines.push("		return subject;");
            lines.push("	}");
            lines.push("	throw \"Type guard \\\"Null\\\" failed at \\\"\" + path + \"\\\"!\";");
            lines.push("}");
        }
        else {
            lines.push("autoguard.guards.Null.as");
        }
        return lines.join(options.eol);
    }
    static parse(string) {
        if (/^\s*null\s*$/s.exec(string) !== null) {
            return NullType.INSTANCE;
        }
        throw "Not a NullType!";
    }
}
exports.NullType = NullType;
NullType.INSTANCE = new NullType();
;
class NumberType {
    constructor() {
    }
    generateType(options) {
        return "number";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        if (options.standalone) {
            lines.push("(subject, path) => {");
            lines.push("	if ((subject != null) && (subject.constructor === globalThis.Number)) {");
            lines.push("		return subject as number;");
            lines.push("	}");
            lines.push("	throw \"Type guard \\\"Number\\\" failed at \\\"\" + path + \"\\\"!\";");
            lines.push("}");
        }
        else {
            lines.push("autoguard.guards.Number.as");
        }
        return lines.join(options.eol);
    }
    static parse(string) {
        if (/^\s*number\s*$/s.exec(string) !== null) {
            return NumberType.INSTANCE;
        }
        throw "Not a NumberType!";
    }
}
exports.NumberType = NumberType;
NumberType.INSTANCE = new NumberType();
;
class NumberLiteralType {
    constructor(value) {
        this.value = value;
    }
    generateType(options) {
        return "" + this.value;
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("(subject, path) => {");
        lines.push("	if (subject === " + this.generateType(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })) + ") {");
        lines.push("		return subject;");
        lines.push("	}");
        lines.push("	throw \"Type guard \\\"NumberLiteral\\\" failed at \\\"\" + path + \"\\\"!\";");
        lines.push("}");
        return lines.join(options.eol);
    }
    static parse(string) {
        let parts = /^\s*([0-9]|([1-9][0-9]*))\s*$/s.exec(string);
        if (parts !== null) {
            let value = Number.parseInt(parts[1]);
            return new NumberLiteralType(value);
        }
        throw "Not a NumberLiteralType!";
    }
}
exports.NumberLiteralType = NumberLiteralType;
;
class ObjectKey {
    static parse(string) {
        try {
            return Identifier.parse(string);
        }
        catch (error) { }
        try {
            return StringLiteral.parse(string);
        }
        catch (error) { }
        throw "Not an ObjectKey!";
    }
}
exports.ObjectKey = ObjectKey;
;
class ObjectType {
    constructor() {
        this.members = new Map();
    }
    add(key, value) {
        this.members.set(key, value);
        return this;
    }
    generateType(options) {
        if (this.members.size === 0) {
            return "{}";
        }
        let lines = new Array();
        for (let [key, value] of this.members) {
            lines.push("	\"" + key + "\"" + (value.optional ? "?" : "") + ": " + value.type.generateType(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
        }
        return "{" + options.eol + lines.join("," + options.eol) + options.eol + "}";
    }
    generateTypeGuard(options) {
        let lines = new Array();
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
            lines.push("		(" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" })) + ")(subject[\"" + key + "\"], path + \"[\\\"" + key + "\\\"]\");");
        }
        lines.push("		return subject;");
        lines.push("	}");
        lines.push("	throw \"Type guard \\\"Object\\\" failed at \\\"\" + path + \"\\\"!\";");
        lines.push("}");
        return lines.join(options.eol);
    }
    [Symbol.iterator]() {
        return this.members[Symbol.iterator]();
    }
    static parse(string) {
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
                    let type = exports.Type.parse(parts[3]);
                    instance.add(key, {
                        type,
                        optional
                    });
                    offset = offset + length;
                    length = 1;
                    if (offset >= segments.length) {
                        return instance;
                    }
                }
                catch (error) {
                    length = length + 1;
                }
            }
        }
        throw "Not an ObjectType!";
    }
}
exports.ObjectType = ObjectType;
;
class RecordType {
    constructor(type) {
        this.type = type;
    }
    generateType(options) {
        return "{ [key: string]: undefined | " + this.type.generateType(options) + " }";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("(subject, path) => {");
        lines.push("	if ((subject != null) && (subject.constructor === globalThis.Object)) {");
        lines.push("		for (let key of globalThis.Object.keys(subject)) {");
        lines.push("			(" + this.type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t\t" })) + ")(subject[key], path + \"[\\\"\" + key + \"\\\"]\");");
        lines.push("		}");
        lines.push("		return subject;");
        lines.push("	}");
        lines.push("	throw \"Type guard \\\"Record\\\" failed at \\\"\" + path + \"\\\"!\";");
        lines.push("}");
        return lines.join(options.eol);
    }
    static parse(string) {
        let parts = /^\s*\{\s*(.+)\s*\}\s*$/s.exec(string);
        if (parts !== null) {
            return new RecordType(exports.Type.parse(parts[1]));
        }
        throw "Not a RecordType!";
    }
}
exports.RecordType = RecordType;
;
class ReferenceType {
    constructor(typename) {
        this.typename = typename;
    }
    generateType(options) {
        return this.typename;
    }
    generateTypeGuard(options) {
        return this.typename + ".as";
    }
    static parse(string) {
        let parts = /^\s*@([A-Za-z][A-Za-z0-9_]*)\s*$/s.exec(string);
        if (parts !== null) {
            return new ReferenceType(parts[1]);
        }
        throw "Not a ReferenceType!";
    }
}
exports.ReferenceType = ReferenceType;
;
class StringType {
    constructor() {
    }
    generateType(options) {
        return "string";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        if (options.standalone) {
            lines.push("(subject, path) => {");
            lines.push("	if ((subject != null) && (subject.constructor === globalThis.String)) {");
            lines.push("		return subject as string;");
            lines.push("	}");
            lines.push("	throw \"Type guard \\\"String\\\" failed at \\\"\" + path + \"\\\"!\";");
            lines.push("}");
        }
        else {
            lines.push("autoguard.guards.String.as");
        }
        return lines.join(options.eol);
    }
    static parse(string) {
        if (/^\s*string\s*$/s.exec(string) !== null) {
            return StringType.INSTANCE;
        }
        throw "Not a StringType!";
    }
}
exports.StringType = StringType;
StringType.INSTANCE = new StringType();
;
class StringLiteralType {
    constructor(value) {
        this.value = value;
    }
    generateType(options) {
        return "\"" + this.value + "\"";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("(subject, path) => {");
        lines.push("	if (subject === " + this.generateType(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })) + ") {");
        lines.push("		return subject;");
        lines.push("	}");
        lines.push("	throw \"Type guard \\\"StringLiteral\\\" failed at \\\"\" + path + \"\\\"!\";");
        lines.push("}");
        return lines.join(options.eol);
    }
    static parse(string) {
        let parts = /^\s*"([A-Za-z0-9_-]*)"\s*$/s.exec(string);
        if (parts !== null) {
            let value = parts[1];
            return new StringLiteralType(value);
        }
        throw "Not a StringLiteralType!";
    }
}
exports.StringLiteralType = StringLiteralType;
;
class TupleType {
    constructor() {
        this.types = new Array();
    }
    add(type) {
        this.types.push(type);
        return this;
    }
    generateType(options) {
        let strings = new Array();
        for (let type of this.types) {
            strings.push("	" + type.generateType(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
        }
        return "[" + options.eol + strings.join("," + options.eol) + options.eol + "]";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("(subject, path) => {");
        lines.push("	if ((subject != null) && (subject.constructor === globalThis.Array)) {");
        for (let i = 0; i < this.types.length; i++) {
            let type = this.types[i];
            lines.push("		(" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" })) + ")(subject[" + i + "], path + \"[" + i + "]\");");
        }
        lines.push("		return subject;");
        lines.push("	}");
        lines.push("	throw \"Type guard \\\"Tuple\\\" failed at \\\"\" + path + \"\\\"!\";");
        lines.push("}");
        return lines.join(options.eol);
    }
    static parse(string) {
        let parts = /^\s*\[\s*(.+)\s*\]\s*$/s.exec(string);
        if (parts !== null) {
            let instance = new TupleType();
            let segments = parts[1].split(",");
            let offset = 0;
            let length = 1;
            while (offset + length <= segments.length) {
                try {
                    let string = segments.slice(offset, offset + length).join(",");
                    let type = exports.Type.parse(string);
                    instance.add(type);
                    offset = offset + length;
                    length = 1;
                    if (offset >= segments.length) {
                        return instance;
                    }
                }
                catch (error) {
                    length = length + 1;
                }
            }
        }
        throw "Not a TupleType!";
    }
}
exports.TupleType = TupleType;
;
class UndefinedType {
    constructor() {
    }
    generateType(options) {
        return "undefined";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        if (options.standalone) {
            lines.push("(subject, path) => {");
            lines.push("	if (subject === undefined) {");
            lines.push("		return subject;");
            lines.push("	}");
            lines.push("	throw \"Type guard \\\"Undefined\\\" failed at \\\"\" + path + \"\\\"!\";");
            lines.push("}");
        }
        else {
            lines.push("autoguard.guards.Undefined.as");
        }
        return lines.join(options.eol);
    }
    static parse(string) {
        if (/^\s*undefined\s*$/s.exec(string) !== null) {
            return UndefinedType.INSTANCE;
        }
        throw "Not an UndefinedType!";
    }
}
exports.UndefinedType = UndefinedType;
UndefinedType.INSTANCE = new UndefinedType();
;
class UnionType {
    constructor() {
        this.types = new Set();
    }
    add(type) {
        this.types.add(type);
        return this;
    }
    generateType(options) {
        let lines = new Array();
        for (let type of this.types) {
            lines.push(type.generateType(options));
        }
        let string = lines.join(" | ");
        if (this.types.size > 1) {
            return "(" + string + ")";
        }
        return string;
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("(subject, path) => {");
        for (let type of this.types) {
            lines.push("	try {");
            lines.push("		return (" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" })) + ")(subject, path);");
            lines.push("	} catch (error) {}");
        }
        lines.push("	throw \"Type guard \\\"Union\\\" failed at \\\"\" + path + \"\\\"!\";");
        lines.push("}");
        return lines.join(options.eol);
    }
    static parse(string) {
        let parts = /^\s*\(\s*(.+)\s*\)\s*$/s.exec(string);
        if (parts !== null) {
            let instance = new UnionType();
            let segments = parts[1].split("|");
            let offset = 0;
            let length = 1;
            while (offset + length <= segments.length) {
                try {
                    let string = segments.slice(offset, offset + length).join("|");
                    let type = exports.Type.parse(string);
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
                }
                catch (error) {
                    length = length + 1;
                }
            }
        }
        throw "Not a UnionType!";
    }
}
exports.UnionType = UnionType;
;
class Schema {
    constructor() {
        this.types = new Map();
    }
    add(key, value) {
        this.types.set(key, value);
        return this;
    }
    generateModule(options) {
        let lines = new Array();
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
            lines.push("		return (" + value.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" })) + ")(subject, path);");
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
    static parse(string) {
        let schema = ObjectType.parse(string);
        let instance = new Schema();
        for (let [key, value] of schema) {
            instance.add(key, value.type);
        }
        return instance;
    }
}
exports.Schema = Schema;
;
