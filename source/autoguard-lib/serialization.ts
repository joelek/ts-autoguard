import * as stdlib from "@joelek/ts-stdlib";

export type Message = stdlib.routing.Message;

export type MessageMap<A> = stdlib.routing.MessageMap<A>;

export type MessageGuard<A extends stdlib.routing.Message> = {
	as(subject: any, path?: string): A;
	is(subject: any, path?: string): subject is A;
};

export type MessageGuardTuple<A extends stdlib.routing.Message[]> = {
	[B in keyof A]: MessageGuard<A[B]>;
};

export type MessageGuardMap<A extends stdlib.routing.MessageMap<A>> = {
	[B in keyof A]: MessageGuard<A[B]>;
};

export class MessageSerializer<A extends stdlib.routing.MessageMap<A>> {
	private guards: MessageGuardMap<A>;

	constructor(guards: MessageGuardMap<A>) {
		this.guards = guards;
	}

	deserialize<B extends keyof A>(string: string, cb: { (type: B, data: A[B]): void }): void {
		let json = JSON.parse(string);
		if ((json != null) && (json.constructor === Object)) {
			if ((json.type != null) && (json.type.constructor === String)) {
				let type = json.type as B;
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

	serialize<B extends keyof A>(type: B, data: A[B]): string {
		return JSON.stringify({
			type,
			data
		});
	}
};
