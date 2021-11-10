"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CODEC = exports.BedrockCodec = void 0;
const bedrock = require("@joelek/bedrock");
class BedrockCodec {
    constructor() { }
    decode(buffer) {
        return bedrock.codecs.Any.decode(buffer);
    }
    encode(subject) {
        return bedrock.codecs.Any.encode(subject);
    }
}
exports.BedrockCodec = BedrockCodec;
;
exports.CODEC = new BedrockCodec();
