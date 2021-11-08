import * as bedrock from "@joelek/bedrock";
import * as serialization from "../serialization";

export class BedrockCodec implements serialization.MessageCodec {
	constructor() {}

	decode(buffer: Uint8Array): serialization.Message {
		return bedrock.codecs.Any.decode(buffer);
	}

	encode(subject: serialization.Message): Uint8Array {
		return bedrock.codecs.Any.encode(subject);
	}
};

export const CODEC = new BedrockCodec();
