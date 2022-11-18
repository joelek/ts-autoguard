"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Union = exports.UnionGuard = exports.Undefined = exports.UndefinedGuard = exports.Tuple = exports.TupleGuard = exports.StringLiteral = exports.StringLiteralGuard = exports.String = exports.StringGuard = exports.Reference = exports.ReferenceGuard = exports.Record = exports.RecordGuard = exports.Object = exports.ObjectGuard = exports.NumberLiteral = exports.NumberLiteralGuard = exports.Number = exports.NumberGuard = exports.Null = exports.NullGuard = exports.Intersection = exports.IntersectionGuard = exports.Integer = exports.IntegerGuard = exports.Group = exports.GroupGuard = exports.BooleanLiteral = exports.BooleanLiteralGuard = exports.Boolean = exports.BooleanGuard = exports.Binary = exports.BinaryGuard = exports.BigInt = exports.BigIntGuard = exports.Array = exports.ArrayGuard = exports.Any = exports.AnyGuard = void 0;
const serialization = require("./serialization");
class AnyGuard extends serialization.MessageGuardBase {
    constructor() {
        super();
    }
    as(subject, path = "") {
        return subject;
    }
    ts(eol = "\n") {
        return "any";
    }
}
exports.AnyGuard = AnyGuard;
;
exports.Any = new AnyGuard();
class ArrayGuard extends serialization.MessageGuardBase {
    constructor(guard) {
        super();
        this.guard = guard;
    }
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.Array)) {
            for (let i = 0; i < subject.length; i++) {
                this.guard.as(subject[i], path + "[" + i + "]");
            }
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        return `array<${this.guard.ts(eol)}>`;
    }
}
exports.ArrayGuard = ArrayGuard;
;
exports.Array = {
    of(guard) {
        return new ArrayGuard(guard);
    }
};
class BigIntGuard extends serialization.MessageGuardBase {
    constructor() {
        super();
    }
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.BigInt)) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        return "bigint";
    }
}
exports.BigIntGuard = BigIntGuard;
;
exports.BigInt = new BigIntGuard();
class BinaryGuard extends serialization.MessageGuardBase {
    constructor() {
        super();
    }
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.Uint8Array)) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        return "binary";
    }
}
exports.BinaryGuard = BinaryGuard;
;
exports.Binary = new BinaryGuard();
class BooleanGuard extends serialization.MessageGuardBase {
    constructor() {
        super();
    }
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.Boolean)) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        return "boolean";
    }
}
exports.BooleanGuard = BooleanGuard;
;
exports.Boolean = new BooleanGuard();
class BooleanLiteralGuard extends serialization.MessageGuardBase {
    constructor(value) {
        super();
        this.value = value;
    }
    as(subject, path = "") {
        if (subject === this.value) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        return `${this.value}`;
    }
}
exports.BooleanLiteralGuard = BooleanLiteralGuard;
;
exports.BooleanLiteral = {
    of(value) {
        return new BooleanLiteralGuard(value);
    }
};
class GroupGuard extends serialization.MessageGuardBase {
    constructor(guard, name) {
        super();
        this.guard = guard;
        this.name = name;
    }
    as(subject, path = "") {
        return this.guard.as(subject, path);
    }
    ts(eol = "\n") {
        var _a;
        return (_a = this.name) !== null && _a !== void 0 ? _a : this.guard.ts(eol);
    }
}
exports.GroupGuard = GroupGuard;
;
exports.Group = {
    of(guard, name) {
        return new GroupGuard(guard, name);
    }
};
class IntegerGuard extends serialization.MessageGuardBase {
    constructor() {
        super();
    }
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.Number) && globalThis.Number.isInteger(subject)) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        return "number";
    }
}
exports.IntegerGuard = IntegerGuard;
;
exports.Integer = new IntegerGuard();
class IntersectionGuard extends serialization.MessageGuardBase {
    constructor(...guards) {
        super();
        this.guards = guards;
    }
    as(subject, path = "") {
        for (let guard of this.guards) {
            guard.as(subject, path);
        }
        return subject;
    }
    ts(eol = "\n") {
        let lines = new globalThis.Array();
        for (let guard of this.guards) {
            lines.push("\t" + guard.ts(eol + "\t"));
        }
        return lines.length === 0 ? "intersection<>" : "intersection<" + eol + lines.join("," + eol) + eol + ">";
    }
}
exports.IntersectionGuard = IntersectionGuard;
;
exports.Intersection = {
    of(...guards) {
        return new IntersectionGuard(...guards);
    }
};
class NullGuard extends serialization.MessageGuardBase {
    constructor() {
        super();
    }
    as(subject, path = "") {
        if (subject === null) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        return "null";
    }
}
exports.NullGuard = NullGuard;
;
exports.Null = new NullGuard();
class NumberGuard extends serialization.MessageGuardBase {
    constructor() {
        super();
    }
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.Number)) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        return "number";
    }
}
exports.NumberGuard = NumberGuard;
;
exports.Number = new NumberGuard();
class NumberLiteralGuard extends serialization.MessageGuardBase {
    constructor(value) {
        super();
        this.value = value;
    }
    as(subject, path = "") {
        if (subject === this.value) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        return `${this.value}`;
    }
}
exports.NumberLiteralGuard = NumberLiteralGuard;
;
exports.NumberLiteral = {
    of(value) {
        return new NumberLiteralGuard(value);
    }
};
class ObjectGuard extends serialization.MessageGuardBase {
    constructor(required, optional) {
        super();
        this.required = required;
        this.optional = optional;
    }
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.Object)) {
            for (let key in this.required) {
                this.required[key].as(subject[key], path + (/^([a-z][a-z0-9_]*)$/isu.test(key) ? "." + key : "[\"" + key + "\"]"));
            }
            for (let key in this.optional) {
                if (key in subject && subject[key] !== undefined) {
                    this.optional[key].as(subject[key], path + (/^([a-z][a-z0-9_]*)$/isu.test(key) ? "." + key : "[\"" + key + "\"]"));
                }
            }
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        let lines = new globalThis.Array();
        for (let [key, value] of globalThis.Object.entries(this.required)) {
            lines.push(`\t"${key}": ${value.ts(eol + "\t")}`);
        }
        for (let [key, value] of globalThis.Object.entries(this.optional)) {
            lines.push(`\t"${key}"?: ${value.ts(eol + "\t")}`);
        }
        return lines.length === 0 ? "object<>" : "object<" + eol + lines.join("," + eol) + eol + ">";
    }
}
exports.ObjectGuard = ObjectGuard;
;
exports.Object = {
    of(required, optional = {}) {
        return new ObjectGuard(required, optional);
    }
};
class RecordGuard extends serialization.MessageGuardBase {
    constructor(guard) {
        super();
        this.guard = guard;
    }
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.Object)) {
            let wrapped = exports.Union.of(exports.Undefined, this.guard);
            for (let key of globalThis.Object.keys(subject)) {
                wrapped.as(subject[key], path + "[\"" + key + "\"]");
            }
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        return `record<${this.guard.ts(eol)}>`;
    }
}
exports.RecordGuard = RecordGuard;
;
exports.Record = {
    of(guard) {
        return new RecordGuard(guard);
    }
};
class ReferenceGuard extends serialization.MessageGuardBase {
    constructor(guard) {
        super();
        this.guard = guard;
    }
    as(subject, path = "") {
        return this.guard().as(subject, path);
    }
    ts(eol = "\n") {
        return this.guard().ts(eol);
    }
}
exports.ReferenceGuard = ReferenceGuard;
;
exports.Reference = {
    of(guard) {
        return new ReferenceGuard(guard);
    }
};
class StringGuard extends serialization.MessageGuardBase {
    constructor() {
        super();
    }
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.String)) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        return "string";
    }
}
exports.StringGuard = StringGuard;
;
exports.String = new StringGuard();
class StringLiteralGuard extends serialization.MessageGuardBase {
    constructor(value) {
        super();
        this.value = value;
    }
    as(subject, path = "") {
        if (subject === this.value) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        return `"${this.value}"`;
    }
}
exports.StringLiteralGuard = StringLiteralGuard;
;
exports.StringLiteral = {
    of(value) {
        return new StringLiteralGuard(value);
    }
};
class TupleGuard extends serialization.MessageGuardBase {
    constructor(...guards) {
        super();
        this.guards = guards;
    }
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.Array)) {
            for (let i = 0; i < this.guards.length; i++) {
                this.guards[i].as(subject[i], path + "[" + i + "]");
            }
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        let lines = new globalThis.Array();
        for (let guard of this.guards) {
            lines.push(`\t${guard.ts(eol + "\t")}`);
        }
        return lines.length === 0 ? "tuple<>" : "tuple<" + eol + lines.join("," + eol) + eol + ">";
    }
}
exports.TupleGuard = TupleGuard;
;
exports.Tuple = {
    of(...guards) {
        return new TupleGuard(...guards);
    }
};
class UndefinedGuard extends serialization.MessageGuardBase {
    constructor() {
        super();
    }
    as(subject, path = "") {
        if (subject === undefined) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        return "undefined";
    }
}
exports.UndefinedGuard = UndefinedGuard;
;
exports.Undefined = new UndefinedGuard();
class UnionGuard extends serialization.MessageGuardBase {
    constructor(...guards) {
        super();
        this.guards = guards;
    }
    as(subject, path = "") {
        for (let guard of this.guards) {
            try {
                return guard.as(subject, path);
            }
            catch (error) { }
        }
        throw new serialization.MessageGuardError(this, subject, path);
    }
    ts(eol = "\n") {
        let lines = new globalThis.Array();
        for (let guard of this.guards) {
            lines.push("\t" + guard.ts(eol + "\t"));
        }
        return lines.length === 0 ? "union<>" : "union<" + eol + lines.join("," + eol) + eol + ">";
    }
}
exports.UnionGuard = UnionGuard;
;
exports.Union = {
    of(...guards) {
        return new UnionGuard(...guards);
    }
};
