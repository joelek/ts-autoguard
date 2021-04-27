import * as tokenization from "../tokenization";
import * as types from "./types";

export class Component {
	name: string;
	type?: string;

	constructor(name: string, type?: string) {
		this.name = name;
		this.type = type;
	}

	static parse(tokenizer: tokenization.Tokenizer): Component {
		return tokenizer.newContext((read, peek) => {
			if (peek()?.family === "<") {
				tokenization.expect(read(), "<");
				let name = tokenization.expect(read(), "IDENTIFIER").value;
				tokenization.expect(read(), ":");
				let type = tokenization.expect(read(), ["boolean", "number", "string"]).value;
				tokenization.expect(read(), ">");
				return new Component(name, type);
			} else {
				let name = "";
				if (peek()?.family === "IDENTIFIER") {
					name = tokenization.expect(read(), "IDENTIFIER").value;
				}
				return new Component(name);
			}
		});
	}
};

export class Path {
	components: Array<Component>;

	constructor(components: Array<Component>) {
		this.components = components;
	}

	static parse(tokenizer: tokenization.Tokenizer): Path {
		return tokenizer.newContext((read, peek) => {
			let components = new Array<Component>();
			while (true) {
				tokenization.expect(read(), "/");
				let component = Component.parse(tokenizer);
				components.push(component);
				if (peek()?.family !== "/") {
					break;
				}
			}
			return new Path(components);
		});
	}
};

export class Method {
	method: string;

	constructor(method: string) {
		this.method = method;
	}

	static parse(tokenizer: tokenization.Tokenizer): Method {
		return tokenizer.newContext((read, peek) => {
			let method = tokenization.expect(read(), "IDENTIFIER").value;
			return new Method(method);
		});
	}
};

export class Parameter {
	name: string;
	type: string;
	optional: boolean;

	constructor(name: string, type: string, optional: boolean) {
		this.name = name;
		this.type = type;
		this.optional = optional;
	}

	static parse(tokenizer: tokenization.Tokenizer): Parameter {
		return tokenizer.newContext((read, peek) => {
			let name = tokenization.expect(read(), "IDENTIFIER").value;
			let optional = false;
			if (peek()?.family === "?") {
				tokenization.expect(read(), "?");
				optional = true;
			}
			tokenization.expect(read(), ":");
			let type = tokenization.expect(read(), ["boolean", "number", "string"]).value;
			return new Parameter(name, type, optional);
		});
	}
};

export class Parameters {
	parameters: Array<Parameter>;

	constructor(parameters: Array<Parameter>) {
		this.parameters = parameters;
	}

	static parse(tokenizer: tokenization.Tokenizer): Parameters {
		return tokenizer.newContext((read, peek) => {
			let parameters = new Array<Parameter>();
			tokenization.expect(read(), "<");
			tokenization.expect(read(), "{");
			while (peek()?.family !== "}") {
				let parameter = Parameter.parse(tokenizer);
				parameters.push(parameter);
				if (peek()?.family === ",") {
					tokenization.expect(read(), ",");
				} else {
					break;
				}
			}
			tokenization.expect(read(), "}");
			tokenization.expect(read(), ">");
			return new Parameters(parameters);
		});
	}
};

export class Headers {
	headers: Array<Parameter>;

	constructor(headers: Array<Parameter>) {
		this.headers = headers;
	}

	static parse(tokenizer: tokenization.Tokenizer): Headers {
		return tokenizer.newContext((read, peek) => {
			let headers = new Array<Parameter>();
			tokenization.expect(read(), "<");
			tokenization.expect(read(), "{");
			while (peek()?.value !== "}") {
				let header = Parameter.parse(tokenizer);
				headers.push(header);
				if (peek()?.family === ",") {
					tokenization.expect(read(), ",");
				} else {
					break;
				}
			}
			tokenization.expect(read(), "}");
			tokenization.expect(read(), ">");
			return new Headers(headers);
		});
	}
};

export class Message {
	headers: Headers;
	payload: types.Type;

	constructor(headers: Headers, payload: types.Type) {
		this.headers = headers;
		this.payload = payload;
	}

	static parse(tokenizer: tokenization.Tokenizer): Message {
		return tokenizer.newContext((read, peek) => {
			let headers = new Headers([]);
			if (peek()?.family === "<") {
				headers = Headers.parse(tokenizer);
			}
			let payload = types.UndefinedType.INSTANCE;
			try {
				payload = types.Type.parse(tokenizer);
			} catch (error) {}
			return new Message(headers, payload);
		});
	}
};

export class Route {
	method: Method;
	path: Path;
	parameters: Parameters;
	request: Message;
	response: Message;

	constructor(method: Method, path: Path, parameters: Parameters, request: Message, response: Message) {
		this.method = method;
		this.path = path;
		this.parameters = parameters;
		this.request = request;
		this.response = response;
	}

	static parse(tokenizer: tokenization.Tokenizer): Route {
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "route");
			let method = Method.parse(tokenizer);
			tokenization.expect(read(), ":");
			let path = Path.parse(tokenizer);
			let parameters = new Parameters([]);
			if (peek()?.family === "?") {
				tokenization.expect(read(), "?");
				parameters = Parameters.parse(tokenizer);
			}
			let request = new Message(new Headers([]), types.UndefinedType.INSTANCE);
			if (peek()?.family === "<=") {
				tokenization.expect(read(), "<=");
				request = Message.parse(tokenizer);
			}
			let response = new Message(new Headers([]), types.UndefinedType.INSTANCE);
			if (peek()?.family === "=>") {
				tokenization.expect(read(), "=>");
				response = Message.parse(tokenizer);
			}
			return new Route(method, path, parameters, request, response);
		});
	}
};
