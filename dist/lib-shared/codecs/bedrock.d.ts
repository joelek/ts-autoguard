import * as serialization from "../serialization";
export declare class BedrockCodec implements serialization.MessageCodec {
    constructor();
    decode(buffer: Uint8Array): serialization.Message;
    encode(subject: serialization.Message): Uint8Array;
}
export declare const CODEC: BedrockCodec;
