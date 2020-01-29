export type Message = any;

export type MessageMap<A> = {
	[B in keyof A]: Message;
};

export type MessageListener<A extends Message> = {
	(message: A): void;
};

export class MessageRouter<A extends MessageMap<A>> {
	protected listeners: Map<keyof A, Set<MessageListener<A[keyof A]>>>;

	constructor() {
		this.listeners = new Map<keyof A, Set<MessageListener<A[keyof A]>>>();
	}

	addMessageListener<B extends keyof A>(type: B, listener: MessageListener<A[B]>): void {
		let listeners = this.listeners.get(type);
		if (listeners === undefined) {
			listeners = new Set<MessageListener<A[keyof A]>>();
			this.listeners.set(type, listeners);
		}
		listeners.add(listener);
	}

	removeMessageListener<B extends keyof A>(type: B, listener: MessageListener<A[B]>): void {
		let listeners = this.listeners.get(type);
		if (listeners !== undefined) {
			listeners.delete(listener);
		}
	}

	routeMessage<B extends keyof A>(type: B, message: A[B]): void {
		let listeners = this.listeners.get(type);
		if (listeners !== undefined) {
			for (let listener of listeners) {
				listener(message);
			}
		}
	}
};

export type MessageGuard<A extends Message> = {
	as(subject: any): A;
	is(subject: any): subject is A;
};

export type MessageGuardMap<A extends MessageMap<A>> = {
	[B in keyof A]: MessageGuard<A[B]>;
};

export type MessageEnvelope = {
	type: string;
	data: Message;
};

export class MessageSerializer<A extends MessageMap<A>> {
	private router: MessageRouter<A>;
	private guards: MessageGuardMap<A>;

	private asEnvelope(subject: any): MessageEnvelope {
		if ((subject != null) && (subject.constructor === Object)) {
			if ((subject.type != null) && (subject.type.constructor === String)) {
				return subject;
			}
		}
		throw "Invalid message envelope!";
	}

	constructor(router: MessageRouter<A>, guards: MessageGuardMap<A>) {
		this.router = router;
		this.guards = guards;
	}

	deserialize(string: string): void {
		let envelope = this.asEnvelope(JSON.parse(string));
		let type = envelope.type as keyof A;
		let data = envelope.data;
		let guard = this.guards[type];
		if (guard === undefined) {
			throw "Unknown message type \"" + type + "\"!";
		}
		this.router.routeMessage(type, guard.as(data));
	}

	serialize<B extends keyof A>(type: B, data: A[B]): string {
		return JSON.stringify({
			type,
			data
		});
	}
};
