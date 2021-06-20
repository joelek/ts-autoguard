"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlainType = exports.Options = exports.Headers = exports.UnionType = exports.UndefinedType = exports.TupleType = exports.StringLiteralType = exports.StringType = exports.ReferenceType = exports.RecordType = exports.ObjectType = exports.NumberLiteralType = exports.NumberType = exports.NullType = exports.IntersectionType = exports.GroupType = exports.BooleanLiteralType = exports.BooleanType = exports.Binary = exports.ArrayType = exports.AnyType = exports.Type = exports.makeInclude = exports.Typenames = void 0;
const tokenization = require("./tokenization");
exports.Typenames = ((...tuple) => tuple)("Any", "Array", "Boolean", "BooleanLiteral", "Group", "Intersection", "Null", "Number", "NumberLiteral", "Object", "Record", "Reference", "String", "StringLiteral", "Tuple", "Undefined", "Union");
function makeInclude() {
    return exports.Typenames.reduce((include, typename) => (Object.assign(Object.assign({}, include), { [typename]: true })), {});
}
exports.makeInclude = makeInclude;
;
;
exports.Type = {
    parse(tokenizer, include = makeInclude(), exclude = {}) {
        try {
            return UnionType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return IntersectionType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return ArrayType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return AnyType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return BooleanType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return BooleanLiteralType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return NullType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return NumberType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return NumberLiteralType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return StringType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return StringLiteralType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return UndefinedType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return ReferenceType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return TupleType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return ObjectType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return GroupType.parse(tokenizer, include, exclude);
        }
        catch (error) { }
        try {
            return RecordType.parse(tokenizer, include, exclude);
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
    generateSchema(options) {
        return "any";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("autoguard.guards.Any");
        return lines.join(options.eol);
    }
    getReferences() {
        return [];
    }
    static parse(tokenizer, include, exclude) {
        if (!include.Any || exclude.Any) {
            throw `Type not included!`;
        }
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
    generateSchema(options) {
        return this.type.generateSchema(options) + "[]";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("autoguard.guards.Array.of(" + this.type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol })) + ")");
        return lines.join(options.eol);
    }
    getReferences() {
        return this.type.getReferences();
    }
    static parse(tokenizer, include, exclude) {
        if (!include.Array || exclude.Array) {
            throw `Type not included!`;
        }
        return tokenizer.newContext((read, peek) => {
            let type = exports.Type.parse(tokenizer, include, Object.assign(Object.assign({}, exclude), { Array: true }));
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
class Binary {
    constructor() {
    }
    generateSchema(options) {
        return "binary";
    }
    generateTypeGuard(options) {
        return "autoguard.api.Binary";
    }
    getReferences() {
        return [];
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            tokenization.expect(read(), "binary");
            return Binary.INSTANCE;
        });
    }
}
exports.Binary = Binary;
Binary.INSTANCE = new Binary();
;
class BooleanType {
    constructor() {
    }
    generateSchema(options) {
        return "boolean";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("autoguard.guards.Boolean");
        return lines.join(options.eol);
    }
    getReferences() {
        return [];
    }
    static parse(tokenizer, include, exclude) {
        if (!include.Boolean || exclude.Boolean) {
            throw `Type not included!`;
        }
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
    generateSchema(options) {
        return "" + this.value;
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("autoguard.guards.BooleanLiteral.of(" + this.value + ")");
        return lines.join(options.eol);
    }
    getReferences() {
        return [];
    }
    static parse(tokenizer, include, exclude) {
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
    generateSchema(options) {
        return "(" + this.type.generateSchema(options) + ")";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("autoguard.guards.Group.of(" + this.type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol })) + ")");
        return lines.join(options.eol);
    }
    getReferences() {
        return this.type.getReferences();
    }
    static parse(tokenizer, include, exclude) {
        if (!include.Group || exclude.Group) {
            throw `Type not included!`;
        }
        return tokenizer.newContext((read, peek) => {
            tokenization.expect(read(), "(");
            let type = exports.Type.parse(tokenizer, include);
            tokenization.expect(read(), ")");
            return new GroupType(type);
        });
    }
}
exports.GroupType = GroupType;
;
class IntersectionType {
    constructor(types = []) {
        this.types = new Set(types);
    }
    add(type) {
        this.types.add(type);
        return this;
    }
    generateSchema(options) {
        let lines = new Array();
        for (let type of this.types) {
            lines.push(type.generateSchema(options));
        }
        let string = lines.join(" & ");
        return string;
    }
    generateTypeGuard(options) {
        let lines = new Array();
        for (let type of this.types) {
            lines.push("	" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
        }
        return "autoguard.guards.Intersection.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
    }
    getReferences() {
        let references = new Array();
        for (let type of this.types) {
            references.push(...type.getReferences());
        }
        return references;
    }
    static parse(tokenizer, include, exclude) {
        if (!include.Intersection || exclude.Intersection) {
            throw `Type not included!`;
        }
        return tokenizer.newContext((read, peek) => {
            var _a;
            let type = exports.Type.parse(tokenizer, include, Object.assign(Object.assign({}, exclude), { Intersection: true }));
            let instance = new IntersectionType();
            instance.add(type);
            while (true) {
                if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "&") {
                    break;
                }
                tokenization.expect(read(), "&");
                let type = exports.Type.parse(tokenizer, include, Object.assign(Object.assign({}, exclude), { Intersection: true }));
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
    generateSchema(options) {
        return "null";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("autoguard.guards.Null");
        return lines.join(options.eol);
    }
    getReferences() {
        return [];
    }
    static parse(tokenizer, include, exclude) {
        if (!include.Null || exclude.Null) {
            throw `Type not included!`;
        }
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
    generateSchema(options) {
        return "number";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("autoguard.guards.Number");
        return lines.join(options.eol);
    }
    getReferences() {
        return [];
    }
    static parse(tokenizer, include, exclude) {
        if (!include.Number || exclude.Number) {
            throw `Type not included!`;
        }
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
    generateSchema(options) {
        return "" + this.value;
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("autoguard.guards.NumberLiteral.of(" + this.value + ")");
        return lines.join(options.eol);
    }
    getReferences() {
        return [];
    }
    static parse(tokenizer, include, exclude) {
        if (!include.NumberLiteral || exclude.NumberLiteral) {
            throw `Type not included!`;
        }
        return tokenizer.newContext((read, peek) => {
            let value = tokenization.expect(read(), "NUMBER_LITERAL").value;
            return new NumberLiteralType(Number.parseInt(value));
        });
    }
}
exports.NumberLiteralType = NumberLiteralType;
;
class ObjectType {
    constructor(members = []) {
        this.members = new Map(members);
    }
    add(key, value) {
        this.members.set(key, value);
        return this;
    }
    generateSchema(options) {
        if (this.members.size === 0) {
            return "{}";
        }
        let lines = new Array();
        for (let [key, value] of this.members) {
            lines.push("	\"" + key + "\"" + (value.optional ? "?" : "") + ": " + value.type.generateSchema(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
        }
        let string = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
        return "{" + string + "}";
    }
    generateTypeGuard(options) {
        let lines = new Array();
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
        let guard = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
        return "autoguard.guards.Object.of({" + guard + "})";
    }
    getReferences() {
        let references = new Array();
        for (let [key, value] of this.members) {
            let type = value.type;
            references.push(...type.getReferences());
        }
        return references;
    }
    static parse(tokenizer, include, exclude) {
        if (!include.Object || exclude.Object) {
            throw `Type not included!`;
        }
        return tokenizer.newContext((read, peek) => {
            var _a, _b, _c;
            tokenization.expect(read(), "{");
            let instance = new ObjectType();
            if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "}") {
                while (true) {
                    let optional = false;
                    let token = tokenization.expect(read(), [
                        ...tokenization.IdentifierFamilies,
                        "STRING_LITERAL"
                    ]);
                    let key = token.family === "STRING_LITERAL" ? token.value.slice(1, -1) : token.value;
                    if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.value) === "?") {
                        read();
                        optional = true;
                    }
                    tokenization.expect(read(), ":");
                    let type = exports.Type.parse(tokenizer, include);
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
    generateSchema(options) {
        return "{ " + this.type.generateSchema(options) + " }";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("autoguard.guards.Record.of(" + this.type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol })) + ")");
        return lines.join(options.eol);
    }
    getReferences() {
        return this.type.getReferences();
    }
    static parse(tokenizer, include, exclude) {
        if (!include.Record || exclude.Record) {
            throw `Type not included!`;
        }
        return tokenizer.newContext((read, peek) => {
            tokenization.expect(read(), "{");
            let type = exports.Type.parse(tokenizer, include);
            tokenization.expect(read(), "}");
            return new RecordType(type);
        });
    }
}
exports.RecordType = RecordType;
;
class ReferenceType {
    constructor(path, typename) {
        this.path = path;
        this.typename = typename;
    }
    generateSchema(options) {
        return [...this.path, ""].join("/") + this.typename;
    }
    generateTypeGuard(options) {
        return "autoguard.guards.Reference.of(() => " + this.typename + ")";
    }
    getReferences() {
        return [
            {
                path: this.path,
                typename: this.typename
            }
        ];
    }
    static parse(tokenizer, include, exclude) {
        if (!include.Reference || exclude.Reference) {
            throw `Type not included!`;
        }
        return tokenizer.newContext((read, peek) => {
            var _a;
            let tokens = new Array();
            while (true) {
                let token = read();
                tokenization.expect(token, [".", "..", "IDENTIFIER"]);
                tokens.push(token);
                if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.family) !== "/") {
                    break;
                }
                tokenization.expect(read(), "/");
            }
            let last = tokens.pop();
            tokenization.expect(last, "IDENTIFIER");
            return new ReferenceType(tokens.map((token) => token.value), last.value);
        });
    }
}
exports.ReferenceType = ReferenceType;
;
class StringType {
    constructor() {
    }
    generateSchema(options) {
        return "string";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("autoguard.guards.String");
        return lines.join(options.eol);
    }
    getReferences() {
        return [];
    }
    static parse(tokenizer, include, exclude) {
        if (!include.String || exclude.String) {
            throw `Type not included!`;
        }
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
    generateSchema(options) {
        return "\"" + this.value + "\"";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("autoguard.guards.StringLiteral.of(\"" + this.value + "\")");
        return lines.join(options.eol);
    }
    getReferences() {
        return [];
    }
    static parse(tokenizer, include, exclude) {
        if (!include.StringLiteral || exclude.StringLiteral) {
            throw `Type not included!`;
        }
        return tokenizer.newContext((read, peek) => {
            let value = tokenization.expect(read(), "STRING_LITERAL").value;
            return new StringLiteralType(value.slice(1, -1));
        });
    }
}
exports.StringLiteralType = StringLiteralType;
;
class TupleType {
    constructor(types = []) {
        this.types = Array.from(types);
    }
    add(type) {
        this.types.push(type);
        return this;
    }
    generateSchema(options) {
        let strings = new Array();
        for (let type of this.types) {
            strings.push("	" + type.generateSchema(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
        }
        let string = strings.length > 0 ? options.eol + strings.join("," + options.eol) + options.eol : "";
        return "[" + string + "]";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        for (let type of this.types) {
            lines.push("	" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
        }
        let string = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
        return "autoguard.guards.Tuple.of(" + string + ")";
    }
    getReferences() {
        let references = new Array();
        for (let type of this.types) {
            references.push(...type.getReferences());
        }
        return references;
    }
    static parse(tokenizer, include, exclude) {
        if (!include.Tuple || exclude.Tuple) {
            throw `Type not included!`;
        }
        return tokenizer.newContext((read, peek) => {
            var _a, _b;
            tokenization.expect(read(), "[");
            let instance = new TupleType();
            if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "]") {
                while (true) {
                    let type = exports.Type.parse(tokenizer, include);
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
    generateSchema(options) {
        return "undefined";
    }
    generateTypeGuard(options) {
        let lines = new Array();
        lines.push("autoguard.guards.Undefined");
        return lines.join(options.eol);
    }
    getReferences() {
        return [];
    }
    static parse(tokenizer, include, exclude) {
        if (!include.Undefined || exclude.Undefined) {
            throw `Type not included!`;
        }
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
    constructor(types = []) {
        this.types = new Set(types);
    }
    add(type) {
        this.types.add(type);
        return this;
    }
    generateSchema(options) {
        let lines = new Array();
        for (let type of this.types) {
            lines.push(type.generateSchema(options));
        }
        let string = lines.join(" | ");
        return string;
    }
    generateTypeGuard(options) {
        let lines = new Array();
        for (let type of this.types) {
            lines.push("	" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
        }
        return "autoguard.guards.Union.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
    }
    getReferences() {
        let references = new Array();
        for (let type of this.types) {
            references.push(...type.getReferences());
        }
        return references;
    }
    static parse(tokenizer, include, exclude) {
        if (!include.Union || exclude.Union) {
            throw `Type not included!`;
        }
        return tokenizer.newContext((read, peek) => {
            var _a;
            let type = exports.Type.parse(tokenizer, include, Object.assign(Object.assign({}, exclude), { Union: true }));
            let instance = new UnionType();
            instance.add(type);
            while (true) {
                if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "|") {
                    break;
                }
                tokenization.expect(read(), "|");
                let type = exports.Type.parse(tokenizer, include, Object.assign(Object.assign({}, exclude), { Union: true }));
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
class Headers {
    constructor() {
    }
    generateSchema(options) {
        throw `Method not implemented!`;
    }
    generateTypeGuard(options) {
        return "autoguard.api.Headers";
    }
    getReferences() {
        return [];
    }
}
exports.Headers = Headers;
Headers.INSTANCE = new Headers();
;
class Options {
    constructor() {
    }
    generateSchema(options) {
        throw `Method not implemented!`;
    }
    generateTypeGuard(options) {
        return "autoguard.api.Options";
    }
    getReferences() {
        return [];
    }
}
exports.Options = Options;
Options.INSTANCE = new Options();
;
class PlainType {
    constructor() {
    }
    generateSchema(options) {
        throw `plain`;
    }
    generateTypeGuard(options) {
        return "autoguard.guards.String";
    }
    getReferences() {
        return [];
    }
}
exports.PlainType = PlainType;
PlainType.INSTANCE = new PlainType();
;
