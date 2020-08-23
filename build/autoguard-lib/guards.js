"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Union = exports.Undefined = exports.Tuple = exports.StringLiteral = exports.String = exports.Record = exports.Object = exports.NumberLiteral = exports.Number = exports.Null = exports.Intersection = exports.Boolean = exports.Array = exports.Any = void 0;
exports.Any = {
    as(subject, path = "") {
        return subject;
    },
    is(subject) {
        try {
            exports.Any.as(subject);
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
                throw "Type guard \"Array\" failed at \"" + path + "\"!";
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
        throw "Type guard \"Boolean\" failed at \"" + path + "\"!";
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
exports.Intersection = {
    of(...guards) {
        return {
            as(subject, path = "") {
                for (let value of guards) {
                    value.as(subject, path);
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
        throw "Type guard \"Null\" failed at \"" + path + "\"!";
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
        throw "Type guard \"Number\" failed at \"" + path + "\"!";
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
                throw "Type guard \"NumberLiteral\" failed at \"" + path + "\"!";
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
                        guards[key].as(subject[key], path + "[\"" + key + "\"]");
                    }
                    return subject;
                }
                throw "Type guard \"Object\" failed at \"" + path + "\"!";
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
                throw "Type guard \"Record\" failed at \"" + path + "\"!";
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
exports.String = {
    as(subject, path = "") {
        if ((subject != null) && (subject.constructor === globalThis.String)) {
            return subject;
        }
        throw "Type guard \"String\" failed at \"" + path + "\"!";
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
                throw "Type guard \"StringLiteral\" failed at \"" + path + "\"!";
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
                throw "Type guard \"Tuple\" failed at \"" + path + "\"!";
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
        throw "Type guard \"Undefined\" failed at \"" + path + "\"!";
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
                throw "Type guard \"Union\" failed at \"" + path + "\"!";
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
