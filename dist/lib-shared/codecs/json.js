"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CODEC = exports.JSONCodec = void 0;
const bedrock = require("@joelek/bedrock");
const guards = require("../guards");
const BIGINT_GUARD = guards.Object.of({
    type: guards.StringLiteral.of("@bigint"),
    data: guards.String
});
const BINARY_GUARD = guards.Object.of({
    type: guards.StringLiteral.of("@binary"),
    data: guards.String
});
class JSONCodec {
    constructor() { }
    decode(buffer) {
        // @ts-ignore
        let string = new TextDecoder().decode(buffer);
        let subject = string.length === 0 ? undefined : JSON.parse(string, (key, subject) => {
            if (BIGINT_GUARD.is(subject)) {
                return BigInt(subject.data);
            }
            if (BINARY_GUARD.is(subject)) {
                return bedrock.utils.Chunk.fromString(subject.data, "base64url");
            }
            return subject;
        });
        return subject;
    }
    encode(subject) {
        let string = subject === undefined ? "" : JSON.stringify(subject, (key, subject) => {
            if (guards.BigInt.is(subject)) {
                return {
                    type: "@bigint",
                    data: subject.toString()
                };
            }
            if (guards.Binary.is(subject)) {
                return {
                    type: "@binary",
                    data: bedrock.utils.Chunk.toString(subject, "base64url")
                };
            }
            return subject;
        });
        // @ts-ignore
        let packet = new TextEncoder().encode(string);
        return packet;
    }
}
exports.JSONCodec = JSONCodec;
;
exports.CODEC = new JSONCodec();
