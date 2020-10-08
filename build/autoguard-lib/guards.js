"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Union = exports.Undefined = exports.Tuple = exports.StringLiteral = exports.String = exports.Reference = exports.Record = exports.Object = exports.NumberLiteral = exports.Number = exports.Null = exports.Intersection = exports.BooleanLiteral = exports.Boolean = exports.Array = exports.Any = void 0;
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
                throw "Expected an array at " + path + "!";
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
            }
        };
    }
};
exports.Boolean = {
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.Boolean)) {
            return subject;
        }
        throw "Expected a boolean at " + path + "!";
    },
    is(subject) {
        try {
            this.as(subject);
        }
        catch (error) {
            return false;
        }
        return true;
    }
};
exports.BooleanLiteral = {
    of(value) {
        return {
            as(subject, path = "") {
                if (subject === value) {
                    return subject;
                }
                throw "Expected " + value + " at " + path + "!";
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
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
            }
        };
    }
};
exports.Null = {
    as(subject, path = "") {
        if (subject === null) {
            return subject;
        }
        throw "Expected null at " + path + "!";
    },
    is(subject) {
        try {
            this.as(subject);
        }
        catch (error) {
            return false;
        }
        return true;
    }
};
exports.Number = {
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.Number)) {
            return subject;
        }
        throw "Expected a number at " + path + "!";
    },
    is(subject) {
        try {
            this.as(subject);
        }
        catch (error) {
            return false;
        }
        return true;
    }
};
exports.NumberLiteral = {
    of(value) {
        return {
            as(subject, path = "") {
                if (subject === value) {
                    return subject;
                }
                throw "Expected " + value + " at " + path + "!";
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
            }
        };
    }
};
exports.Object = {
    of(guards) {
        return {
            as(subject, path = "") {
                if ((subject != null) && (subject.constructor === globalThis.Object)) {
                    for (let key in guards) {
                        guards[key].as(subject[key], path + /^([a-z][a-z0-9_]*)$/is.test(key) ? "." + key : "[\"" + key + "\"]");
                    }
                    return subject;
                }
                throw "Expected an object at " + path + "!";
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
            }
        };
    }
};
exports.Record = {
    of(guard) {
        return {
            as(subject, path = "") {
                if ((subject != null) && (subject.constructor === globalThis.Object)) {
                    for (let key of globalThis.Object.keys(subject)) {
                        guard.as(subject[key], path + "[\"" + key + "\"]");
                    }
                    return subject;
                }
                throw "Expected a record at " + path + "!";
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
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
            }
        };
    }
};
exports.String = {
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.String)) {
            return subject;
        }
        throw "Expected a string at " + path + "!";
    },
    is(subject) {
        try {
            this.as(subject);
        }
        catch (error) {
            return false;
        }
        return true;
    }
};
exports.StringLiteral = {
    of(value) {
        return {
            as(subject, path = "") {
                if (subject === value) {
                    return subject;
                }
                throw "Expected \"" + value + "\" at " + path + "!";
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
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
                throw "Expected a tuple at " + path + "!";
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
            }
        };
    }
};
exports.Undefined = {
    as(subject, path = "") {
        if (subject === undefined) {
            return subject;
        }
        throw "Expected undefined at " + path + "!";
    },
    is(subject) {
        try {
            this.as(subject);
        }
        catch (error) {
            return false;
        }
        return true;
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
                throw "Expected a union at " + path + "!";
            },
            is(subject) {
                try {
                    this.as(subject);
                }
                catch (error) {
                    return false;
                }
                return true;
            }
        };
    }
};
