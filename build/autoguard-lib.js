var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
define("autoguard-lib/lib", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Type = {
        parse: function (string) {
            string = string.trim();
            try {
                return ArrayType.parse(string);
            }
            catch (error) { }
            try {
                return BooleanType.parse(string);
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
                return ObjectType.parse(string);
            }
            catch (error) { }
            try {
                return RecordType.parse(string);
            }
            catch (error) { }
            try {
                return StringType.parse(string);
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
            try {
                return ReferenceType.parse(string);
            }
            catch (error) { }
            throw "Not a Type!";
        }
    };
    var ArrayType = /** @class */ (function () {
        function ArrayType(type) {
            this.type = type;
        }
        ArrayType.prototype.generateType = function (eol) {
            return "(" + this.type.generateType(eol) + ")[]";
        };
        ArrayType.prototype.generateTypeGuard = function (eol) {
            var lines = new globalThis.Array();
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
        };
        ArrayType.parse = function (string) {
            var parts = /^\[(.+)\]$/is.exec(string);
            if (parts !== null) {
                return new ArrayType(Type.parse(parts[1]));
            }
            throw "Not an ArrayType!";
        };
        return ArrayType;
    }());
    var BooleanType = /** @class */ (function () {
        function BooleanType() {
        }
        BooleanType.prototype.generateType = function (eol) {
            return "boolean";
        };
        BooleanType.prototype.generateTypeGuard = function (eol) {
            var lines = new globalThis.Array();
            lines.push("(subject, path) => {");
            lines.push("	if ((subject != null) && (subject.constructor === globalThis.Boolean)) {");
            lines.push("		return subject;");
            lines.push("	}");
            lines.push("	throw \"Type guard \\\"Boolean\\\" failed at \\\"\" + path + \"\\\"!\";");
            lines.push("}");
            return lines.join(eol);
        };
        BooleanType.parse = function (string) {
            if (string.toLowerCase() === "boolean") {
                return BooleanType.INSTANCE;
            }
            throw "Not a BooleanType!";
        };
        BooleanType.INSTANCE = new BooleanType();
        return BooleanType;
    }());
    var NullType = /** @class */ (function () {
        function NullType() {
        }
        NullType.prototype.generateType = function (eol) {
            return "null";
        };
        NullType.prototype.generateTypeGuard = function (eol) {
            var lines = new globalThis.Array();
            lines.push("(subject, path) => {");
            lines.push("	if (subject === null) {");
            lines.push("		return subject;");
            lines.push("	}");
            lines.push("	throw \"Type guard \\\"Null\\\" failed at \\\"\" + path + \"\\\"!\";");
            lines.push("}");
            return lines.join(eol);
        };
        NullType.parse = function (string) {
            if (string.toLowerCase() === "null") {
                return NullType.INSTANCE;
            }
            throw "Not a NullType!";
        };
        NullType.INSTANCE = new NullType();
        return NullType;
    }());
    var NumberType = /** @class */ (function () {
        function NumberType() {
        }
        NumberType.prototype.generateType = function (eol) {
            return "number";
        };
        NumberType.prototype.generateTypeGuard = function (eol) {
            var lines = new globalThis.Array();
            lines.push("(subject, path) => {");
            lines.push("	if ((subject != null) && (subject.constructor === globalThis.Number)) {");
            lines.push("		return subject;");
            lines.push("	}");
            lines.push("	throw \"Type guard \\\"Number\\\" failed at \\\"\" + path + \"\\\"!\";");
            lines.push("}");
            return lines.join(eol);
        };
        NumberType.parse = function (string) {
            if (string.toLowerCase() === "number") {
                return NumberType.INSTANCE;
            }
            throw "Not a NumberType!";
        };
        NumberType.INSTANCE = new NumberType();
        return NumberType;
    }());
    var ObjectType = /** @class */ (function () {
        function ObjectType() {
            this.members = new globalThis.Map();
        }
        ObjectType.prototype.add = function (key, value) {
            this.members.set(key, value);
            return this;
        };
        ObjectType.prototype.generateType = function (eol) {
            var e_1, _a;
            var lines = new globalThis.Array();
            lines.push("{");
            try {
                for (var _b = __values(this.members), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                    lines.push("	" + key + ": " + value.generateType(eol + "\t") + ";");
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            lines.push("}");
            return lines.join(eol);
        };
        ObjectType.prototype.generateTypeGuard = function (eol) {
            var e_2, _a;
            var lines = new globalThis.Array();
            lines.push("(subject, path) => {");
            lines.push("	if ((subject != null) && (subject.constructor === globalThis.Object)) {");
            try {
                for (var _b = __values(this.members), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                    lines.push("		(" + value.generateTypeGuard(eol + "\t\t") + ")(subject." + key + ", path + \".\" + \"" + key + "\");");
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            lines.push("		return subject;");
            lines.push("	}");
            lines.push("	throw \"Type guard \\\"Object\\\" failed at \\\"\" + path + \"\\\"!\";");
            lines.push("}");
            return lines.join(eol);
        };
        ObjectType.prototype[Symbol.iterator] = function () {
            return this.members[Symbol.iterator]();
        };
        ObjectType.parse = function (string) {
            var parts = /^\{\s*(.*)\s*\}$/is.exec(string);
            if (parts !== null) {
                var instance = new ObjectType();
                if (/^\s*$/is.test(parts[1])) {
                    return instance;
                }
                var segments = parts[1].split(",");
                var offset = 0;
                var length = 1;
                while (offset + length <= segments.length) {
                    try {
                        var string_1 = segments.slice(offset, offset + length).join(",");
                        var parts_1 = /^\s*([a-z][a-z0-9_]*)\s*\:(.+)$/is.exec(string_1);
                        if (parts_1 === null) {
                            break;
                        }
                        var type = Type.parse(parts_1[2]);
                        instance.add(parts_1[1], type);
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
        };
        return ObjectType;
    }());
    var RecordType = /** @class */ (function () {
        function RecordType(type) {
            this.type = type;
        }
        RecordType.prototype.generateType = function (eol) {
            return "{ [key: string]: " + this.type.generateType(eol) + " }";
        };
        RecordType.prototype.generateTypeGuard = function (eol) {
            var lines = new globalThis.Array();
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
        };
        RecordType.parse = function (string) {
            var parts = /^\{(.+)\}$/is.exec(string);
            if (parts !== null) {
                return new RecordType(Type.parse(parts[1]));
            }
            throw "Not a RecordType!";
        };
        return RecordType;
    }());
    var ReferenceType = /** @class */ (function () {
        function ReferenceType(typename) {
            this.typename = typename;
        }
        ReferenceType.prototype.generateType = function (eol) {
            return this.typename;
        };
        ReferenceType.prototype.generateTypeGuard = function (eol) {
            return this.typename + ".as";
        };
        ReferenceType.parse = function (string) {
            if (/^[a-z][a-z0-9_]*$/is.test(string)) {
                return new ReferenceType(string);
            }
            throw "Not a ReferenceType!";
        };
        return ReferenceType;
    }());
    var StringType = /** @class */ (function () {
        function StringType() {
        }
        StringType.prototype.generateType = function (eol) {
            return "string";
        };
        StringType.prototype.generateTypeGuard = function (eol) {
            var lines = new globalThis.Array();
            lines.push("(subject, path) => {");
            lines.push("	if ((subject != null) && (subject.constructor === globalThis.String)) {");
            lines.push("		return subject;");
            lines.push("	}");
            lines.push("	throw \"Type guard \\\"String\\\" failed at \\\"\" + path + \"\\\"!\";");
            lines.push("}");
            return lines.join(eol);
        };
        StringType.parse = function (string) {
            if (string.toLowerCase() === "string") {
                return StringType.INSTANCE;
            }
            throw "Not a StringType!";
        };
        StringType.INSTANCE = new StringType();
        return StringType;
    }());
    var UndefinedType = /** @class */ (function () {
        function UndefinedType() {
        }
        UndefinedType.prototype.generateType = function (eol) {
            return "undefined";
        };
        UndefinedType.prototype.generateTypeGuard = function (eol) {
            var lines = new globalThis.Array();
            lines.push("(subject, path) => {");
            lines.push("	if (subject === undefined) {");
            lines.push("		return subject;");
            lines.push("	}");
            lines.push("	throw \"Type guard \\\"Undefined\\\" failed at \\\"\" + path + \"\\\"!\";");
            lines.push("}");
            return lines.join(eol);
        };
        UndefinedType.parse = function (string) {
            if (string.toLowerCase() === "undefined") {
                return UndefinedType.INSTANCE;
            }
            throw "Not an UndefinedType!";
        };
        UndefinedType.INSTANCE = new UndefinedType();
        return UndefinedType;
    }());
    var UnionType = /** @class */ (function () {
        function UnionType() {
            this.types = new globalThis.Set();
        }
        UnionType.prototype.add = function (type) {
            this.types.add(type);
            return this;
        };
        UnionType.prototype.generateType = function (eol) {
            var e_3, _a;
            var lines = new globalThis.Array();
            try {
                for (var _b = __values(this.types), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var type = _c.value;
                    lines.push(type.generateType(eol));
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return lines.join(" | ");
        };
        UnionType.prototype.generateTypeGuard = function (eol) {
            var e_4, _a;
            var lines = new globalThis.Array();
            lines.push("(subject, path) => {");
            try {
                for (var _b = __values(this.types), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var type = _c.value;
                    lines.push("	try {");
                    lines.push("		return (" + type.generateTypeGuard(eol + "\t\t") + ")(subject, path);");
                    lines.push("	} catch (error) {}");
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            lines.push("	throw \"Type guard \\\"Union\\\" failed at \\\"\" + path + \"\\\"!\";");
            lines.push("}");
            return lines.join(eol);
        };
        UnionType.parse = function (string) {
            var instance = new UnionType();
            var segments = string.split("/");
            var offset = 0;
            var length = 1;
            while (offset + length <= segments.length) {
                try {
                    var string_2 = segments.slice(offset, offset + length).join("/");
                    var type = Type.parse(string_2);
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
            throw "Not a UnionType!";
        };
        return UnionType;
    }());
    var Schema = /** @class */ (function () {
        function Schema() {
            this.types = new globalThis.Map();
        }
        Schema.prototype.add = function (key, value) {
            this.types.set(key, value);
            return this;
        };
        Schema.prototype.generateModule = function () {
            var e_5, _a;
            var lines = new globalThis.Array();
            lines.push("// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.");
            lines.push("");
            try {
                for (var _b = __values(this.types), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
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
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return lines.join("\n");
        };
        Schema.parse = function (string) {
            var e_6, _a;
            var schema = ObjectType.parse(string.trim());
            var instance = new Schema();
            try {
                for (var schema_1 = __values(schema), schema_1_1 = schema_1.next(); !schema_1_1.done; schema_1_1 = schema_1.next()) {
                    var _b = __read(schema_1_1.value, 2), key = _b[0], value = _b[1];
                    instance.add(key, value);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (schema_1_1 && !schema_1_1.done && (_a = schema_1["return"])) _a.call(schema_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
            return instance;
        };
        return Schema;
    }());
    function transform(string) {
        return Schema.parse(string).generateModule();
    }
    exports.transform = transform;
});
