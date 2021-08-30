"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Union = exports.Undefined = exports.Tuple = exports.StringLiteral = exports.String = exports.Reference = exports.Record = exports.Object = exports.NumberLiteral = exports.Number = exports.Null = exports.Intersection = exports.Group = exports.BooleanLiteral = exports.Boolean = exports.Array = exports.Any = void 0;
const serialization = require("./serialization");
exports.Any = {
    as(subject, path = "") {
        return subject;
    },
    is(subject) {
        try {
            this.as(subject);
        }
        catch (error) {
            return false;
        }
        return true;
    },
    ts(eol = "\n") {
        return `any`;
    }
};
exports.Array = {
    of(guard) {
        return {
            as(subject, path = "") {
                if ((subject != null) && (subject.constructor === globalThis.Array)) {
                    for (let i = 0; i < subject.length; i++) {
                        guard.as(subject[i], path + "[" + i + "]");
                    }
                    return subject;
                }
                throw new serialization.MessageGuardError(this, subject, path);
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
            },
            ts(eol = "\n") {
                return `array<${guard.ts(eol)}>`;
            }
        };
    }
};
exports.Boolean = {
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.Boolean)) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    },
    is(subject) {
        try {
            this.as(subject);
        }
        catch (error) {
            return false;
        }
        return true;
    },
    ts(eol = "\n") {
        return `boolean`;
    }
};
exports.BooleanLiteral = {
    of(value) {
        return {
            as(subject, path = "") {
                if (subject === value) {
                    return subject;
                }
                throw new serialization.MessageGuardError(this, subject, path);
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
            },
            ts(eol = "\n") {
                return `${value}`;
            }
        };
    }
};
exports.Group = {
    of(guard, name) {
        return {
            as(subject, path = "") {
                return guard.as(subject, path);
            },
            is(subject) {
                return guard.is(subject);
            },
            ts(eol = "\n") {
                return name !== null && name !== void 0 ? name : guard.ts(eol);
            }
        };
    }
};
exports.Intersection = {
    of(...guards) {
        return {
            as(subject, path = "") {
                for (let guard of guards) {
                    guard.as(subject, path);
                }
                return subject;
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
            },
            ts(eol = "\n") {
                let lines = new globalThis.Array();
                for (let guard of guards) {
                    lines.push("\t" + guard.ts(eol + "\t"));
                }
                return "intersection<" + eol + lines.join("," + eol) + eol + ">";
            }
        };
    }
};
exports.Null = {
    as(subject, path = "") {
        if (subject === null) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    },
    is(subject) {
        try {
            this.as(subject);
        }
        catch (error) {
            return false;
        }
        return true;
    },
    ts(eol = "\n") {
        return `null`;
    }
};
exports.Number = {
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.Number)) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    },
    is(subject) {
        try {
            this.as(subject);
        }
        catch (error) {
            return false;
        }
        return true;
    },
    ts(eol = "\n") {
        return `number`;
    }
};
exports.NumberLiteral = {
    of(value) {
        return {
            as(subject, path = "") {
                if (subject === value) {
                    return subject;
                }
                throw new serialization.MessageGuardError(this, subject, path);
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
            },
            ts(eol = "\n") {
                return `${value}`;
            }
        };
    }
};
exports.Object = {
    of(required, optional) {
        return {
            as(subject, path = "") {
                if ((subject != null) && (subject.constructor === globalThis.Object)) {
                    for (let key in required) {
                        required[key].as(subject[key], path + (/^([a-z][a-z0-9_]*)$/isu.test(key) ? "." + key : "[\"" + key + "\"]"));
                    }
                    for (let key in optional) {
                        if (key in subject && subject[key] !== undefined) {
                            optional[key].as(subject[key], path + (/^([a-z][a-z0-9_]*)$/isu.test(key) ? "." + key : "[\"" + key + "\"]"));
                        }
                    }
                    return subject;
                }
                throw new serialization.MessageGuardError(this, subject, path);
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
            },
            ts(eol = "\n") {
                let lines = new globalThis.Array();
                for (let [key, value] of globalThis.Object.entries(required)) {
                    lines.push(`\t"${key}": ${value.ts(eol + "\t")}`);
                }
                for (let [key, value] of globalThis.Object.entries(optional !== null && optional !== void 0 ? optional : {})) {
                    lines.push(`\t"${key}"?: ${value.ts(eol + "\t")}`);
                }
                return "object<" + eol + lines.join("," + eol) + eol + ">";
            }
        };
    }
};
exports.Record = {
    of(guard) {
        return {
            as(subject, path = "") {
                if ((subject != null) && (subject.constructor === globalThis.Object)) {
                    let wrapped = exports.Union.of(exports.Undefined, guard);
                    for (let key of globalThis.Object.keys(subject)) {
                        wrapped.as(subject[key], path + "[\"" + key + "\"]");
                    }
                    return subject;
                }
                throw new serialization.MessageGuardError(this, subject, path);
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
            },
            ts(eol = "\n") {
                return `record<${guard.ts(eol)}>`;
            }
        };
    }
};
exports.Reference = {
    of(guard) {
        return {
            as(subject, path = "") {
                return guard().as(subject, path);
            },
            is(subject) {
                return guard().is(subject);
            },
            ts(eol = "\n") {
                return guard().ts(eol);
            }
        };
    }
};
exports.String = {
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.String)) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    },
    is(subject) {
        try {
            this.as(subject);
        }
        catch (error) {
            return false;
        }
        return true;
    },
    ts(eol = "\n") {
        return "string";
    }
};
exports.StringLiteral = {
    of(value) {
        return {
            as(subject, path = "") {
                if (subject === value) {
                    return subject;
                }
                throw new serialization.MessageGuardError(this, subject, path);
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
            },
            ts(eol = "\n") {
                return `"${value}"`;
            }
        };
    }
};
exports.Tuple = {
    of(...guards) {
        return {
            as(subject, path = "") {
                if ((subject != null) && (subject.constructor === globalThis.Array)) {
                    for (let i = 0; i < guards.length; i++) {
                        guards[i].as(subject[i], path + "[" + i + "]");
                    }
                    return subject;
                }
                throw new serialization.MessageGuardError(this, subject, path);
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
            },
            ts(eol = "\n") {
                let lines = new globalThis.Array();
                for (let guard of guards) {
                    lines.push(`\t${guard.ts(eol + "\t")}`);
                }
                return "tuple<" + eol + lines.join("," + eol) + eol + ">";
            }
        };
    }
};
exports.Undefined = {
    as(subject, path = "") {
        if (subject === undefined) {
            return subject;
        }
        throw new serialization.MessageGuardError(this, subject, path);
    },
    is(subject) {
        try {
            this.as(subject);
        }
        catch (error) {
            return false;
        }
        return true;
    },
    ts(eol = "\n") {
        return "undefined";
    }
};
exports.Union = {
    of(...guards) {
        return {
            as(subject, path = "") {
                for (let guard of guards) {
                    try {
                        return guard.as(subject, path);
                    }
                    catch (error) { }
                }
                throw new serialization.MessageGuardError(this, subject, path);
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
            },
            ts(eol = "\n") {
                let lines = new globalThis.Array();
                for (let guard of guards) {
                    lines.push("\t" + guard.ts(eol + "\t"));
                }
                return "union<" + eol + lines.join("," + eol) + eol + ">";
            }
        };
    }
};
