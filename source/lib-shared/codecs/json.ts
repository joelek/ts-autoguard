import * as serialization from "../serialization";

export class JSONCodec implements serialization.MessageCodec {
	constructor() {}

	decode(buffer: Uint8Array): serialization.Message {
		// @ts-ignore
		let string = new TextDecoder().decode(buffer);
		let subject = string.length === 0 ? undefined : JSON.parse(string);
		return subject;
	}

	encode(subject: serialization.Message): Uint8Array {
		let string = subject === undefined ? "" : JSON.stringify(subject);
		// @ts-ignore
		let packet = new TextEncoder().encode(string);
		return packet;
	}
};

export const CODEC = new JSONCodec();
