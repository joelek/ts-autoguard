"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlainType = exports.Options = exports.Headers = exports.UnionType = exports.UndefinedType = exports.TupleType = exports.StringLiteralType = exports.StringType = exports.ReferenceType = exports.RecordType = exports.ObjectType = exports.NumberLiteralType = exports.NumberType = exports.NullType = exports.IntersectionType = exports.GroupType = exports.BooleanLiteralType = exports.BooleanType = exports.Binary = exports.ArrayType = exports.AnyType = exports.Type = void 0;
const tokenization = require("./tokenization");
;
exports.Type = {
    parse(tokenizer, options) {
        return tokenizer.newContext((read, peek) => {
            var _a;
            let parsers = (_a = options === null || options === void 0 ? void 0 : options.parsers) !== null && _a !== void 0 ? _a : [
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
            let errors = new Array();
            for (let parser of parsers) {
                try {
                    return parser(tokenizer, parsers);
                }
                catch (error) {
                    errors.push(error);
                }
            }
            throw tokenization.SyntaxError.getError(tokenizer, errors);
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
    static parse(tokenizer, parsers) {
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
    static parse(tokenizer, parsers) {
        return tokenizer.newContext((read, peek) => {
            let type = exports.Type.parse(tokenizer, {
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
    static parse(tokenizer, parsers) {
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
    static parse(tokenizer, parsers) {
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
    static parse(tokenizer, parsers) {
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
    static parse(tokenizer, parsers) {
        return tokenizer.newContext((read, peek) => {
            var _a;
            let type = exports.Type.parse(tokenizer, {
                parsers: parsers.filter((parser) => parser !== IntersectionType.parse)
            });
            let instance = new IntersectionType();
            instance.add(type);
            while (true) {
                if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "&") {
                    break;
                }
                tokenization.expect(read(), "&");
                let type = exports.Type.parse(tokenizer, {
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
    static parse(tokenizer, parsers) {
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
    static parse(tokenizer, parsers) {
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
    static parse(tokenizer, parsers) {
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
                union.add(type);
                union.add(UndefinedType.INSTANCE);
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
    static parse(tokenizer, parsers) {
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
    static parse(tokenizer, parsers) {
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
    static parse(tokenizer, parsers) {
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
    static parse(tokenizer, parsers) {
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
    static parse(tokenizer, parsers) {
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
    static parse(tokenizer, parsers) {
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
    static parse(tokenizer, parsers) {
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
    static parse(tokenizer, parsers) {
        return tokenizer.newContext((read, peek) => {
            var _a;
            let type = exports.Type.parse(tokenizer, {
                parsers: parsers.filter((parser) => parser !== UnionType.parse)
            });
            let instance = new UnionType();
            instance.add(type);
            while (true) {
                if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "|") {
                    break;
                }
                tokenization.expect(read(), "|");
                let type = exports.Type.parse(tokenizer, {
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
        return `plain`;
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
