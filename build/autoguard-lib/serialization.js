"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSerializer = exports.MessageGuardError = void 0;
class MessageGuardError {
    constructor(guard, subject, path) {
        this.guard = guard;
        this.subject = subject;
        this.path = path;
    }
    getSubject() {
        if (this.subject === null) {
            return "null";
        }
        if (this.subject instanceof Array) {
            return "array";
        }
        return typeof this.subject;
    }
    toString() {
        return `The value ${this.getSubject()} at ${this.path} is type-incompatible with the expected type: ${this.guard.ts()}`;
    }
}
exports.MessageGuardError = MessageGuardError;
;
class MessageSerializer {
    constructor(guards) {
        this.guards = guards;
    }
    deserialize(string, cb) {
        let json = JSON.parse(string);
        if ((json != null) && (json.constructor === Object)) {
            if ((json.type != null) && (json.type.constructor === String)) {
                let type = json.type;
                let data = json.data;
                let guard = this.guards[type];
                if (guard === undefined) {
                    throw "Unknown message type \"" + type + "\"!";
                }
                cb(type, guard.as(data));
                return;
            }
        }
        throw "Invalid message envelope!";
    }
    serialize(type, data) {
        return JSON.stringify({
            type,
            data
        });
    }
}
exports.MessageSerializer = MessageSerializer;
;
