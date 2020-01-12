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
define("autoguard-lib/native", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.Any = {
        as: function (subject, path) {
            if (path === void 0) { path = ""; }
            return subject;
        },
        is: function (subject) {
            return true;
        }
    };
    exports.Array = {
        as: function (subject, guard, path) {
            if (path === void 0) { path = ""; }
            if ((subject != null) && (subject.constructor === globalThis.Array)) {
                if (guard !== exports.Any.as) {
                    for (var i = 0; i < subject.length; i++) {
                        guard(subject[i], path + "[" + i + "]");
                    }
                }
                return subject;
            }
            throw "Type guard \"Array\" failed at \"" + path + "\"!";
        },
        is: function (subject, guard) {
            try {
                exports.Array.as(subject, guard);
            }
            catch (error) {
                return false;
            }
            return true;
        }
    };
    exports.Boolean = {
        as: function (subject, path) {
            if (path === void 0) { path = ""; }
            if ((subject != null) && (subject.constructor === globalThis.Boolean)) {
                return subject;
            }
            throw "Type guard \"Boolean\" failed at \"" + path + "\"!";
        },
        is: function (subject) {
            try {
                exports.Boolean.as(subject);
            }
            catch (error) {
                return false;
            }
            return true;
        }
    };
    exports.Null = {
        as: function (subject, path) {
            if (path === void 0) { path = ""; }
            if (subject === null) {
                return subject;
            }
            throw "Type guard \"Null\" failed at \"" + path + "\"!";
        },
        is: function (subject) {
            try {
                exports.Null.as(subject);
            }
            catch (error) {
                return false;
            }
            return true;
        }
    };
    exports.Number = {
        as: function (subject, path) {
            if (path === void 0) { path = ""; }
            if ((subject != null) && (subject.constructor === globalThis.Number)) {
                return subject;
            }
            throw "Type guard \"Number\" failed at \"" + path + "\"!";
        },
        is: function (subject) {
            try {
                exports.Number.as(subject);
            }
            catch (error) {
                return false;
            }
            return true;
        }
    };
    exports.Object = {
        as: function (subject, guard, path) {
            var e_1, _a;
            if (path === void 0) { path = ""; }
            if ((subject != null) && (subject.constructor === globalThis.Object)) {
                try {
                    for (var _b = __values(globalThis.Object.keys(guard)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var key = _c.value;
                        guard[key](subject[key], path + "." + key);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return subject;
            }
            throw "Type guard \"Object\" failed at \"" + path + "\"!";
        },
        is: function (subject, guard) {
            try {
                exports.Object.as(subject, guard);
            }
            catch (error) {
                return false;
            }
            return true;
        }
    };
    exports.Record = {
        as: function (subject, guard, path) {
            var e_2, _a;
            if (path === void 0) { path = ""; }
            if ((subject != null) && (subject.constructor === globalThis.Object)) {
                try {
                    for (var _b = __values(globalThis.Object.keys(subject)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var key = _c.value;
                        guard(subject[key], path + "[\"" + key + "\"]");
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                return subject;
            }
            throw "Type guard \"Record\" failed at \"" + path + "\"!";
        },
        is: function (subject, guard) {
            try {
                exports.Record.as(subject, guard);
            }
            catch (error) {
                return false;
            }
            return true;
        }
    };
    exports.String = {
        as: function (subject, path) {
            if (path === void 0) { path = ""; }
            if ((subject != null) && (subject.constructor === globalThis.String)) {
                return subject;
            }
            throw "Type guard \"String\" failed at \"" + path + "\"!";
        },
        is: function (subject) {
            try {
                exports.String.as(subject);
            }
            catch (error) {
                return false;
            }
            return true;
        }
    };
    exports.Undefined = {
        as: function (subject, path) {
            if (path === void 0) { path = ""; }
            if (subject === undefined) {
                return subject;
            }
            throw "Type guard \"Undefined\" failed at \"" + path + "\"!";
        },
        is: function (subject) {
            try {
                exports.Undefined.as(subject);
            }
            catch (error) {
                return false;
            }
            return true;
        }
    };
    exports.Union = {
        as: function (subject, guard, path) {
            if (path === void 0) { path = ""; }
            for (var i = 0; i < guard.length; i++) {
                try {
                    return guard[i](subject, path);
                }
                catch (error) { }
            }
            throw "Type guard \"Union\" failed at \"" + path + "\"!";
        },
        is: function (subject, guard) {
            try {
                exports.Union.as(subject, guard);
            }
            catch (error) {
                return false;
            }
            return true;
        }
    };
});
define("autoguard-lib/api", ["require", "exports"], function (require, exports) {
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
            lines.push("	return Array.as(subject, " + this.type.generateTypeGuard(eol + "\t") + ", path);");
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
            return "Boolean.as";
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
            return "Null.as";
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
            return "Number.as";
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
            var e_3, _a;
            var lines = new globalThis.Array();
            lines.push("{");
            try {
                for (var _b = __values(this.members), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                    lines.push("	" + key + ": " + value.generateType(eol + "\t") + ";");
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            lines.push("}");
            return lines.join(eol);
        };
        ObjectType.prototype.generateTypeGuard = function (eol) {
            var e_4, _a;
            var guards = new globalThis.Array();
            try {
                for (var _b = __values(this.members), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                    guards.push(key + ": " + value.generateTypeGuard(eol + "\t\t"));
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            var lines = new globalThis.Array();
            lines.push("(subject, path) => {");
            lines.push("	return Object.as(subject, {");
            lines.push("		" + guards.join("," + eol + "\t\t"));
            lines.push("	}, path);");
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
            lines.push("	return Record.as(subject, " + this.type.generateTypeGuard(eol + "\t") + ", path);");
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
            return "String.as";
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
            return "Undefined.as";
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
            var e_5, _a;
            var lines = new globalThis.Array();
            try {
                for (var _b = __values(this.types), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var type = _c.value;
                    lines.push(type.generateType(eol));
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return lines.join(" | ");
        };
        UnionType.prototype.generateTypeGuard = function (eol) {
            var e_6, _a;
            var types = new globalThis.Array();
            var guards = new globalThis.Array();
            try {
                for (var _b = __values(this.types), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var type = _c.value;
                    types.push(type.generateType(eol + "\t"));
                    guards.push(type.generateTypeGuard(eol + "\t"));
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                }
                finally { if (e_6) throw e_6.error; }
            }
            var lines = new globalThis.Array();
            lines.push("(subject, path) => {");
            lines.push("	return Union.as<" + types.join(" | ") + ">(subject, [");
            lines.push("		" + guards.join(", " + eol + "\t\t"));
            lines.push("	], path);");
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
            var e_7, _a;
            var lines = new globalThis.Array();
            lines.push("// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.");
            lines.push("");
            lines.push("import { Any, Array, Boolean, Null, Number, Object, Record, String, Undefined, Union } from \"autoguard-lib/native\";");
            lines.push("");
            lines.push("export * from \"autoguard-lib/native\";");
            try {
                for (var _b = __values(this.types), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                    lines.push("");
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
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                }
                finally { if (e_7) throw e_7.error; }
            }
            return lines.join("\n");
        };
        Schema.parse = function (string) {
            var e_8, _a;
            var schema = ObjectType.parse(string.trim());
            var instance = new Schema();
            try {
                for (var schema_1 = __values(schema), schema_1_1 = schema_1.next(); !schema_1_1.done; schema_1_1 = schema_1.next()) {
                    var _b = __read(schema_1_1.value, 2), key = _b[0], value = _b[1];
                    instance.add(key, value);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (schema_1_1 && !schema_1_1.done && (_a = schema_1["return"])) _a.call(schema_1);
                }
                finally { if (e_8) throw e_8.error; }
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
