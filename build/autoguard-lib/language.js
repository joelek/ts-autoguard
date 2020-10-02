"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = exports.UnionType = exports.UndefinedType = exports.TupleType = exports.StringLiteralType = exports.StringType = exports.ReferenceType = exports.RecordType = exports.ObjectType = exports.NumberLiteralType = exports.NumberType = exports.NullType = exports.IntersectionType = exports.GroupType = exports.BooleanLiteralType = exports.BooleanType = exports.ArrayType = exports.AnyType = exports.Type = void 0;
const tokenization = require("./tokenization");
;
exports.Type = {
    parse(tokenizer, ...exclude) {
        try {
            return UnionType.parse(tokenizer, ...exclude);
        }
        catch (error) { }
        try {
            return IntersectionType.parse(tokenizer, ...exclude);
        }
        catch (error) { }
        try {
            return ArrayType.parse(tokenizer, ...exclude);
        }
        catch (error) { }
        try {
            return AnyType.parse(tokenizer);
        }
        catch (error) { }
        try {
            return BooleanType.parse(tokenizer);
        }
        catch (error) { }
        try {
            return BooleanLiteralType.parse(tokenizer);
        }
        catch (error) { }
        try {
            return NullType.parse(tokenizer);
        }
        catch (error) { }
        try {
            return NumberType.parse(tokenizer);
        }
        catch (error) { }
        try {
            return NumberLiteralType.parse(tokenizer);
        }
        catch (error) { }
        try {
            return StringType.parse(tokenizer);
        }
        catch (error) { }
        try {
            return StringLiteralType.parse(tokenizer);
        }
        catch (error) { }
        try {
            return UndefinedType.parse(tokenizer);
        }
        catch (error) { }
        try {
            return ReferenceType.parse(tokenizer);
        }
        catch (error) { }
        try {
            return TupleType.parse(tokenizer);
        }
        catch (error) { }
        try {
            return ObjectType.parse(tokenizer);
        }
        catch (error) { }
        try {
            return GroupType.parse(tokenizer);
        }
        catch (error) { }
        try {
            return RecordType.parse(tokenizer);
        }
        catch (error) { }
        return tokenizer.newContext((read, peek) => {
            let token = read();
            throw `Unexpected ${token.family} at row ${token.row}, col ${token.col}!`;
        });
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
        if (options.standalone) {
            lines.push("(subject, path) => {");
            lines.push("	return subject;");
            lines.push("}");
        }
        else {
            lines.push("autoguard.Any");
        }
        return lines.join(options.eol);
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            tokenization.expect(read(), "any");
            return AnyType.INSTANCE;
        });
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
        if (options.standalone) {
            lines.push("(subject, path) => {");
            lines.push("	if ((subject != null) && (subject.constructor === globalThis.Array)) {");
            lines.push("		for (let i = 0; i < subject.length; i++) {");
            lines.push("			(" + this.type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t\t" })) + ")(subject[i], path + \"[\" + i + \"]\");");
            lines.push("		}");
            lines.push("		return subject;");
            lines.push("	}");
            lines.push("	throw \"Expected an array at \" + path + \"!\";");
            lines.push("}");
        }
        else {
            lines.push("autoguard.Array.of(" + this.type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol })) + ")");
        }
        return lines.join(options.eol);
    }
    static parse(tokenizer, ...exclude) {
        if (exclude.includes("Array")) {
            throw `Recursion prevention!`;
        }
        return tokenizer.newContext((read, peek) => {
            let type = exports.Type.parse(tokenizer, ...exclude, "Array");
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
                }
                catch (error) {
                    break;
                }
            }
            return array;
        });
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
            lines.push("	throw \"Expected a boolean at \" + path + \"!\";");
            lines.push("}");
        }
        else {
            lines.push("autoguard.Boolean");
        }
        return lines.join(options.eol);
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            tokenization.expect(read(), "boolean");
            return BooleanType.INSTANCE;
        });
    }
}
exports.BooleanType = BooleanType;
BooleanType.INSTANCE = new BooleanType();
;
class BooleanLiteralType {
    constructor(value) {
        this.value = value;
    }
    generateType(options) {
        return "" + this.value;
    }
    generateTypeGuard(options) {
        let lines = new Array();
        if (options.standalone) {
            lines.push("(subject, path) => {");
            lines.push("	if (subject === " + this.generateType(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })) + ") {");
            lines.push("		return subject;");
            lines.push("	}");
            lines.push("	throw \"Expected " + this.value + " at \" + path + \"!\";");
            lines.push("}");
        }
        else {
            lines.push("autoguard.BooleanLiteral.of(" + this.generateType(Object.assign(Object.assign({}, options), { eol: options.eol })) + ")");
        }
        return lines.join(options.eol);
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            let token = tokenization.expect(read(), [
                "true",
                "false"
            ]);
            if (token.family === "true") {
                return BooleanLiteralType.INSTANCE_TRUE;
            }
            else {
                return BooleanLiteralType.INSTANCE_FALSE;
            }
        });
    }
}
exports.BooleanLiteralType = BooleanLiteralType;
BooleanLiteralType.INSTANCE_TRUE = new BooleanLiteralType(true);
BooleanLiteralType.INSTANCE_FALSE = new BooleanLiteralType(false);
;
class GroupType {
    constructor(type) {
        this.type = type;
    }
    generateType(options) {
        return "(" + this.type.generateType(options) + ")";
    }
    generateTypeGuard(options) {
        return this.type.generateTypeGuard(options);
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            tokenization.expect(read(), "(");
            let type = exports.Type.parse(tokenizer);
            tokenization.expect(read(), ")");
            return new GroupType(type);
        });
    }
}
exports.GroupType = GroupType;
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
        return string;
    }
    generateTypeGuard(options) {
        let lines = new Array();
        if (options.standalone) {
            lines.push("(subject, path) => {");
            for (let type of this.types) {
                lines.push("	(" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })) + ")(subject, path);");
            }
            lines.push("	return subject;");
            lines.push("}");
            return lines.join(options.eol);
        }
        else {
            for (let type of this.types) {
                lines.push("	" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
            }
            return "autoguard.Intersection.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
        }
    }
    static parse(tokenizer, ...exclude) {
        if (exclude.includes("Intersection")) {
            throw `Recursion prevention!`;
        }
        return tokenizer.newContext((read, peek) => {
            var _a;
            let type = exports.Type.parse(tokenizer, ...exclude, "Intersection");
            let instance = new IntersectionType();
            instance.add(type);
            while (true) {
                if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "&") {
                    break;
                }
                tokenization.expect(read(), "&");
                let type = exports.Type.parse(tokenizer, ...exclude, "Intersection");
                instance.add(type);
            }
            if (instance.types.size === 1) {
                return type;
            }
            return instance;
        });
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
            lines.push("	throw \"Expected null at \" + path + \"!\";");
            lines.push("}");
        }
        else {
            lines.push("autoguard.Null");
        }
        return lines.join(options.eol);
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            tokenization.expect(read(), "null");
            return NullType.INSTANCE;
        });
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
            lines.push("	throw \"Expected a number at \" + path + \"!\";");
            lines.push("}");
        }
        else {
            lines.push("autoguard.Number");
        }
        return lines.join(options.eol);
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            tokenization.expect(read(), "number");
            return NumberType.INSTANCE;
        });
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
        if (options.standalone) {
            lines.push("(subject, path) => {");
            lines.push("	if (subject === " + this.generateType(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })) + ") {");
            lines.push("		return subject;");
            lines.push("	}");
            lines.push("	throw \"Expected " + this.value + " at \" + path + \"!\";");
            lines.push("}");
        }
        else {
            lines.push("autoguard.NumberLiteral.of(" + this.generateType(Object.assign(Object.assign({}, options), { eol: options.eol })) + ")");
        }
        return lines.join(options.eol);
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            let value = tokenization.expect(read(), "NUMBER_LITERAL").value;
            return new NumberLiteralType(Number.parseInt(value));
        });
    }
}
exports.NumberLiteralType = NumberLiteralType;
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
        let string = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
        return "{" + string + "}";
    }
    generateTypeGuard(options) {
        let lines = new Array();
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
                lines.push("		(" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" })) + ")(subject[\"" + key + "\"], path + \"[\\\"" + key + "\\\"]\");");
            }
            lines.push("		return subject;");
            lines.push("	}");
            lines.push("	throw \"Expected an object at \" + path + \"!\";");
            lines.push("}");
            return lines.join(options.eol);
        }
        else {
            for (let [key, value] of this.members) {
                let type = value.type;
                if (value.optional) {
                    let union = new UnionType();
                    union.add(UndefinedType.INSTANCE);
                    union.add(type);
                    type = union;
                }
                lines.push("	\"" + key + "\": " + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
            }
            let type = this.typename != null ? this.typename : this.generateType(options);
            let guard = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
            return "autoguard.Object.of<" + type + ">({" + guard + "})";
        }
    }
    setTypename(typename) {
        this.typename = typename;
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            var _a, _b, _c;
            tokenization.expect(read(), "{");
            let instance = new ObjectType();
            if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "}") {
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
                    if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.value) === "?") {
                        read();
                        optional = true;
                    }
                    tokenization.expect(read(), ":");
                    let type = exports.Type.parse(tokenizer);
                    instance.add(key, {
                        type,
                        optional
                    });
                    if (((_c = peek()) === null || _c === void 0 ? void 0 : _c.value) !== ",") {
                        break;
                    }
                    tokenization.expect(read(), ",");
                }
            }
            tokenization.expect(read(), "}");
            return instance;
        });
    }
}
exports.ObjectType = ObjectType;
;
class RecordType {
    constructor(type) {
        this.type = type;
    }
    generateType(options) {
        return "Record<string, undefined | " + this.type.generateType(options) + ">";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        if (options.standalone) {
            lines.push("(subject, path) => {");
            lines.push("	if ((subject != null) && (subject.constructor === globalThis.Object)) {");
            lines.push("		for (let key of globalThis.Object.keys(subject)) {");
            lines.push("			(" + this.type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t\t" })) + ")(subject[key], path + \"[\\\"\" + key + \"\\\"]\");");
            lines.push("		}");
            lines.push("		return subject;");
            lines.push("	}");
            lines.push("	throw \"Expected a record at \" + path + \"!\";");
            lines.push("}");
        }
        else {
            lines.push("autoguard.Record.of(" + this.type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol })) + ")");
        }
        return lines.join(options.eol);
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            tokenization.expect(read(), "{");
            let type = exports.Type.parse(tokenizer);
            tokenization.expect(read(), "}");
            return new RecordType(type);
        });
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
        if (options.standalone) {
            return this.typename + ".as";
        }
        else {
            return this.typename;
        }
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            var _a;
            if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.family) === "@") {
                tokenization.expect(read(), "@");
            }
            let value = tokenization.expect(read(), "IDENTIFIER").value;
            return new ReferenceType(value);
        });
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
            lines.push("	throw \"Expected a string at \" + path + \"!\";");
            lines.push("}");
        }
        else {
            lines.push("autoguard.String");
        }
        return lines.join(options.eol);
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            tokenization.expect(read(), "string");
            return StringType.INSTANCE;
        });
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
        if (options.standalone) {
            lines.push("(subject, path) => {");
            lines.push("	if (subject === " + this.generateType(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })) + ") {");
            lines.push("		return subject;");
            lines.push("	}");
            lines.push("	throw \"Expected \\\"" + this.value + "\\\" at \" + path + \"!\";");
            lines.push("}");
        }
        else {
            lines.push("autoguard.StringLiteral.of(\"" + this.value + "\")");
        }
        return lines.join(options.eol);
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            let value = tokenization.expect(read(), "STRING_LITERAL").value;
            return new StringLiteralType(value.slice(1, -1));
        });
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
        let string = strings.length > 0 ? options.eol + strings.join("," + options.eol) + options.eol : "";
        return "[" + string + "]";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        if (options.standalone) {
            lines.push("(subject, path) => {");
            lines.push("	if ((subject != null) && (subject.constructor === globalThis.Array)) {");
            for (let i = 0; i < this.types.length; i++) {
                let type = this.types[i];
                lines.push("		(" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" })) + ")(subject[" + i + "], path + \"[" + i + "]\");");
            }
            lines.push("		return subject as " + this.generateType(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" })) + ";");
            lines.push("	}");
            lines.push("	throw \"Expected a tuple at \" + path + \"!\";");
            lines.push("}");
            return lines.join(options.eol);
        }
        else {
            for (let type of this.types) {
                lines.push("	" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
            }
            let string = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
            return "autoguard.Tuple.of(" + string + ")";
        }
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            var _a, _b;
            tokenization.expect(read(), "[");
            let instance = new TupleType();
            if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "]") {
                while (true) {
                    let type = exports.Type.parse(tokenizer);
                    instance.add(type);
                    if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.value) !== ",") {
                        break;
                    }
                    tokenization.expect(read(), ",");
                }
            }
            tokenization.expect(read(), "]");
            return instance;
        });
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
            lines.push("	throw \"Expected undefined at \" + path + \"!\";");
            lines.push("}");
        }
        else {
            lines.push("autoguard.Undefined");
        }
        return lines.join(options.eol);
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            tokenization.expect(read(), "undefined");
            return UndefinedType.INSTANCE;
        });
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
        return string;
    }
    generateTypeGuard(options) {
        let lines = new Array();
        if (options.standalone) {
            lines.push("(subject, path) => {");
            for (let type of this.types) {
                lines.push("	try {");
                lines.push("		return (" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" })) + ")(subject, path);");
                lines.push("	} catch (error) {}");
            }
            lines.push("	throw \"Expected a union at \" + path + \"!\";");
            lines.push("}");
            return lines.join(options.eol);
        }
        else {
            for (let type of this.types) {
                lines.push("	" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
            }
            return "autoguard.Union.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
        }
    }
    static parse(tokenizer, ...exclude) {
        if (exclude.includes("Union")) {
            throw `Recursion prevention!`;
        }
        return tokenizer.newContext((read, peek) => {
            var _a;
            let type = exports.Type.parse(tokenizer, ...exclude, "Union");
            let instance = new UnionType();
            instance.add(type);
            while (true) {
                if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "|") {
                    break;
                }
                tokenization.expect(read(), "|");
                let type = exports.Type.parse(tokenizer, ...exclude, "Union");
                instance.add(type);
            }
            if (instance.types.size === 1) {
                return type;
            }
            return instance;
        });
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
            lines.push("import { guards as autoguard } from \"@joelek/ts-autoguard\";");
            lines.push("");
        }
        for (let [key, value] of this.types) {
            lines.push("export type " + key + " = " + value.generateType(options) + ";");
            lines.push("");
            if (options.standalone) {
                lines.push("export const " + key + " = {");
                lines.push("	as(subject: any, path: string = \"\"): " + key + " {");
                lines.push("		return (" + value.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" })) + ")(subject, path);");
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
            }
            else {
                lines.push("export const " + key + " = " + value.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol })) + ";");
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
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            var _a, _b, _c;
            tokenization.expect(read(), "{");
            let instance = new Schema();
            if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "}") {
                while (true) {
                    let identifier = tokenization.expect(read(), "IDENTIFIER").value;
                    tokenization.expect(read(), ":");
                    let type = exports.Type.parse(tokenizer);
                    (_b = type.setTypename) === null || _b === void 0 ? void 0 : _b.call(type, identifier);
                    instance.add(identifier, type);
                    if (((_c = peek()) === null || _c === void 0 ? void 0 : _c.value) !== ",") {
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
}
exports.Schema = Schema;
;
