"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CODEC = exports.JSONCodec = void 0;
class JSONCodec {
    constructor() { }
    decode(buffer) {
        // @ts-ignore
        let string = new TextDecoder().decode(buffer);
        let subject = string.length === 0 ? undefined : JSON.parse(string);
        return subject;
    }
    encode(subject) {
        let string = subject === undefined ? "" : JSON.stringify(subject);
        // @ts-ignore
        let packet = new TextEncoder().encode(string);
        return packet;
    }
}
exports.JSONCodec = JSONCodec;
;
exports.CODEC = new JSONCodec();
