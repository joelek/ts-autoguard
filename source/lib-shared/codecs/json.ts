import * as bedrock from "@joelek/bedrock";
import * as guards from "../guards";
import * as serialization from "../serialization";

const BIGINT_GUARD = guards.Object.of({
	type: guards.StringLiteral.of("@bigint"),
	data: guards.String
});

const BINARY_GUARD = guards.Object.of({
	type: guards.StringLiteral.of("@binary"),
	data: guards.String
});

export class JSONCodec implements serialization.MessageCodec {
	constructor() {}

	decode(buffer: Uint8Array): serialization.Message {
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

	encode(subject: serialization.Message): Uint8Array {
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
};

export const CODEC = new JSONCodec();
