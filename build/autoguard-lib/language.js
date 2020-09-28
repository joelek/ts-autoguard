"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = exports.UnionType = exports.UndefinedType = exports.TupleType = exports.StringLiteralType = exports.StringType = exports.ReferenceType = exports.RecordType = exports.ObjectType = exports.NumberLiteralType = exports.NumberType = exports.NullType = exports.IntersectionType = exports.GroupType = exports.BooleanLiteralType = exports.BooleanType = exports.ArrayType = exports.AnyType = exports.Type = void 0;
const tokenization = require("./tokenization");
;
exports.Type = {
    parse(tokens, ...exclude) {
        try {
            let copy = tokens.slice();
            let type = ArrayType.parse(copy, ...exclude);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = IntersectionType.parse(copy, ...exclude);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = UnionType.parse(copy, ...exclude);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = AnyType.parse(copy);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = BooleanType.parse(copy);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = BooleanLiteralType.parse(copy);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = NullType.parse(copy);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = NumberType.parse(copy);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = NumberLiteralType.parse(copy);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = StringType.parse(copy);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = StringLiteralType.parse(copy);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = UndefinedType.parse(copy);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = ReferenceType.parse(copy);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = TupleType.parse(copy);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = ObjectType.parse(copy);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = GroupType.parse(copy);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        try {
            let copy = tokens.slice();
            let type = RecordType.parse(copy);
            tokens.splice(0, tokens.length - copy.length);
            return type;
        }
        catch (error) { }
        let token = tokenization.expect(tokens[0], undefined, undefined);
        throw `Syntax error! Unxpected ${token.value} at row ${token.row}, col ${token.col}!`;
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
    static parse(tokens) {
        tokenization.expect(tokens.shift(), undefined, "any");
        return AnyType.INSTANCE;
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
    static parse(tokens, ...exclude) {
        var _a, _b;
        if (exclude.includes("Array")) {
            throw `Recursion prevention!`;
        }
        let type = exports.Type.parse(tokens, ...exclude, "Array");
        tokenization.expect(tokens.shift(), undefined, "[");
        tokenization.expect(tokens.shift(), undefined, "]");
        let array = new ArrayType(type);
        while (true) {
            if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.value) !== "[") {
                break;
            }
            if (((_b = tokens[1]) === null || _b === void 0 ? void 0 : _b.value) !== "]") {
                break;
            }
            tokenization.expect(tokens.shift(), undefined, "[");
            tokenization.expect(tokens.shift(), undefined, "]");
            array = new ArrayType(array);
        }
        return array;
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
    static parse(tokens) {
        tokenization.expect(tokens.shift(), undefined, "boolean");
        return BooleanType.INSTANCE;
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
    static parse(tokens) {
        let value = tokenization.expect(tokens.shift(), undefined, ["true", "false"]).value;
        return new BooleanLiteralType(value === "true");
    }
}
exports.BooleanLiteralType = BooleanLiteralType;
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
    static parse(tokens) {
        tokenization.expect(tokens.shift(), undefined, "(");
        let type = exports.Type.parse(tokens);
        tokenization.expect(tokens.shift(), undefined, ")");
        return new GroupType(type);
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
    static parse(tokens, ...exclude) {
        var _a;
        if (exclude.includes("Intersection")) {
            throw `Recursion prevention!`;
        }
        let type = exports.Type.parse(tokens, ...exclude, "Intersection");
        let instance = new IntersectionType();
        instance.add(type);
        while (true) {
            tokenization.expect(tokens.shift(), undefined, "&");
            let type = exports.Type.parse(tokens, ...exclude, "Intersection");
            instance.add(type);
            if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.value) !== "&") {
                break;
            }
        }
        return instance;
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
    static parse(tokens) {
        tokenization.expect(tokens.shift(), undefined, "null");
        return NullType.INSTANCE;
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
    static parse(tokens) {
        tokenization.expect(tokens.shift(), undefined, "number");
        return NumberType.INSTANCE;
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
    static parse(tokens) {
        let value = tokenization.expect(tokens.shift(), "NUMBER_LITERAL", undefined).value;
        return new NumberLiteralType(Number.parseInt(value));
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
        return "{" + options.eol + lines.join("," + options.eol) + options.eol + "}";
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
            return "autoguard.Object.of<" + this.generateType(options) + ">({" + options.eol + lines.join("," + options.eol) + options.eol + "})";
        }
    }
    static parse(tokens) {
        var _a, _b, _c;
        tokenization.expect(tokens.shift(), undefined, "{");
        let instance = new ObjectType();
        if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.value) !== "}") {
            while (true) {
                let optional = false;
                let token = tokenization.expect(tokens.shift(), ["IDENTIFIER", "STRING_LITERAL"], undefined);
                let key = token.family === "STRING_LITERAL" ? token.value.slice(1, -1) : token.value;
                if (((_b = tokens[0]) === null || _b === void 0 ? void 0 : _b.value) === "?") {
                    tokens.shift();
                    optional = true;
                }
                tokenization.expect(tokens.shift(), undefined, ":");
                let type = exports.Type.parse(tokens);
                instance.add(key, {
                    type,
                    optional
                });
                if (((_c = tokens[0]) === null || _c === void 0 ? void 0 : _c.value) !== ",") {
                    break;
                }
                tokenization.expect(tokens.shift(), undefined, ",");
            }
        }
        tokenization.expect(tokens.shift(), undefined, "}");
        return instance;
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
    static parse(tokens) {
        tokenization.expect(tokens.shift(), undefined, "{");
        let type = exports.Type.parse(tokens);
        tokenization.expect(tokens.shift(), undefined, "}");
        return new RecordType(type);
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
    static parse(tokens) {
        var _a;
        if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.value) === "@") {
            tokenization.expect(tokens.shift(), undefined, "@");
        }
        let value = tokenization.expect(tokens.shift(), "IDENTIFIER", undefined).value;
        return new ReferenceType(value);
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
    static parse(tokens) {
        tokenization.expect(tokens.shift(), undefined, "string");
        return StringType.INSTANCE;
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
    static parse(tokens) {
        let value = tokenization.expect(tokens.shift(), "STRING_LITERAL", undefined).value;
        return new StringLiteralType(value.slice(1, -1));
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
            return "autoguard.Tuple.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
        }
    }
    static parse(tokens) {
        var _a, _b;
        tokenization.expect(tokens.shift(), undefined, "[");
        let instance = new TupleType();
        if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.value) !== "]") {
            while (true) {
                let type = exports.Type.parse(tokens);
                instance.add(type);
                if (((_b = tokens[0]) === null || _b === void 0 ? void 0 : _b.value) !== ",") {
                    break;
                }
                tokenization.expect(tokens.shift(), undefined, ",");
            }
        }
        tokenization.expect(tokens.shift(), undefined, "]");
        return instance;
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
    static parse(tokens) {
        tokenization.expect(tokens.shift(), undefined, "undefined");
        return UndefinedType.INSTANCE;
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
    static parse(tokens, ...exclude) {
        var _a;
        if (exclude.includes("Union")) {
            throw `Recursion prevention!`;
        }
        let type = exports.Type.parse(tokens, ...exclude, "Union");
        let instance = new UnionType();
        instance.add(type);
        while (true) {
            tokenization.expect(tokens.shift(), undefined, "|");
            let type = exports.Type.parse(tokens, ...exclude, "Union");
            instance.add(type);
            if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.value) !== "|") {
                break;
            }
        }
        return instance;
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
    static parse(tokens) {
        var _a, _b;
        tokenization.expect(tokens.shift(), undefined, "{");
        let instance = new Schema();
        if (((_a = tokens[0]) === null || _a === void 0 ? void 0 : _a.value) !== "}") {
            while (true) {
                let identifier = tokenization.expect(tokens.shift(), "IDENTIFIER", undefined).value;
                tokenization.expect(tokens.shift(), undefined, ":");
                let type = exports.Type.parse(tokens);
                instance.add(identifier, type);
                if (((_b = tokens[0]) === null || _b === void 0 ? void 0 : _b.value) !== ",") {
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
}
exports.Schema = Schema;
;
