import * as is from "./is";
import * as shared from "./shared";
import * as tokenization from "./tokenization";
import * as types from "./types";

export class Quantifier {
	kind: "repeated" | "required" | "optional";

	constructor(kind: "repeated" | "required" | "optional") {
		this.kind = kind;
	}

	generateSchema(options: shared.Options): string {
		if (this.kind === "repeated") {
			return "*";
		}
		if (this.kind === "optional") {
			return "?";
		}
		if (this.kind === "required") {
			return ""
		}
		throw `Expected code to be unreachable!`;
	}

	getMinMax(): { min: number, max: number } {
		if (this.kind === "repeated") {
			return { min: 0, max: Infinity };
		}
		if (this.kind === "optional") {
			return { min: 0, max: 1 };
		}
		if (this.kind === "required") {
			return { min: 1, max: 1 };
		}
		throw `Expected code to be unreachable!`;
	}

	static parse(tokenizer: tokenization.Tokenizer): Quantifier {
		return tokenizer.newContext((read, peek) => {
			if (peek()?.family === "*") {
				tokenization.expect(read(), "*");
				return new Quantifier("repeated");
			}
			if (peek()?.family === "?") {
				tokenization.expect(read(), "?");
				return new Quantifier("optional");
			}
			return new Quantifier("required");
		});
	}
};

export class Component {
	name: string;
	quantifier: Quantifier;
	type?: types.Type;

	constructor(name: string, quantifier: Quantifier, type?: types.Type) {
		this.name = name;
		this.quantifier = quantifier;
		this.type = type;
	}

	generateSchema(options: shared.Options): string {
		if (is.present(this.type)) {
			return "<\"" + this.name + "\"" + this.quantifier.generateSchema(options) + ":" + this.type + ">";
		} else {
			return encodeURIComponent(this.name);
		}
	}

	static parse(tokenizer: tokenization.Tokenizer): Component {
		return tokenizer.newContext((read, peek) => {
			if (peek()?.family === "<") {
				tokenization.expect(read(), "<");
				let token = tokenization.expect(read(), [
					...tokenization.IdentifierFamilies,
					"STRING_LITERAL"
				]);
				let name = token.family === "STRING_LITERAL" ? token.value.slice(1, -1) : token.value;
				let quantifier = Quantifier.parse(tokenizer);
				let type: types.Type = types.PlainType.INSTANCE;
				if (peek()?.family === ":") {
					tokenization.expect(read(), ":");
					if (peek()?.family === "plain") {
						tokenization.expect(read(), "plain");
					} else {
						type = types.Type.parse(tokenizer);
						// TODO: Remove compatibility behaviour in v6.
						if (type === types.StringType.INSTANCE) {
							type = types.PlainType.INSTANCE;
						}
					}
				}
				tokenization.expect(read(), ">");
				return new Component(name, quantifier, type);
			} else {
				let name = "";
				if (([...tokenization.IdentifierFamilies, "PATH_COMPONENT"] as Array<string | undefined>).includes(peek()?.family)) {
					let token = tokenization.expect(read(), [
						...tokenization.IdentifierFamilies,
						"PATH_COMPONENT"
					]);
					name = token.family === "PATH_COMPONENT" ? decodeURIComponent(token.value) : token.value;
				}
				return new Component(name, new Quantifier("required"));
			}
		});
	}
};

export class Path {
	components: Array<Component>;

	constructor(components: Array<Component>) {
		this.components = components;
	}

	generateSchema(options: shared.Options): string {
		let parts = new Array<string>();
		for (let component of this.components) {
			parts.push(component.generateSchema(options));
		}
		return "/" + parts.join("/");
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

	generateSchema(options: shared.Options): string {
		return this.method;
	}

	static parse(tokenizer: tokenization.Tokenizer): Method {
		return tokenizer.newContext((read, peek) => {
			let method = tokenization.expect(read(), tokenization.IdentifierFamilies).value;
			return new Method(method);
		});
	}
};

export class Alias {
	identifier: string;

	constructor(identifier: string) {
		this.identifier = identifier;
	}

	generateSchema(options: shared.Options): string {
		return this.identifier === "" ? "" : `${this.identifier}():`;
	}

	static parse(tokenizer: tokenization.Tokenizer): Alias {
		return tokenizer.newContext((read, peek) => {
			let identifier = tokenization.expect(read(), tokenization.IdentifierFamilies).value;
			tokenization.expect(read(), "(");
			tokenization.expect(read(), ")");
			tokenization.expect(read(), ":");
			return new Alias(identifier);
		});
	}
};

export class Parameter {
	name: string;
	quantifier: Quantifier;
	type: types.Type;

	constructor(name: string, quantifier: Quantifier, type: types.Type) {
		this.name = name;
		this.quantifier = quantifier;
		this.type = type;
	}

	generateSchema(options: shared.Options): string {
		return "\"" + this.name + "\"" + this.quantifier.generateSchema(options) + ": " + this.type;
	}

	static parse(tokenizer: tokenization.Tokenizer): Parameter {
		return tokenizer.newContext((read, peek) => {
			let token = tokenization.expect(read(), [
				...tokenization.IdentifierFamilies,
				"STRING_LITERAL"
			]);
			let name = token.family === "STRING_LITERAL" ? token.value.slice(1, -1) : token.value;
			let quantifier = Quantifier.parse(tokenizer);
			let type: types.Type = types.PlainType.INSTANCE;
			if (peek()?.family === ":") {
				tokenization.expect(read(), ":");
				if (peek()?.family === "plain") {
					tokenization.expect(read(), "plain");
				} else {
					type = types.Type.parse(tokenizer);
					// TODO: Remove compatibility behaviour in v6.
					if (type === types.StringType.INSTANCE) {
						type = types.PlainType.INSTANCE;
					}
				}
			}
			return new Parameter(name, quantifier, type);
		});
	}
};

export class Parameters {
	parameters: Array<Parameter>;

	constructor(parameters: Array<Parameter>) {
		this.parameters = parameters;
	}

	generateSchema(options: shared.Options): string {
		if (this.parameters.length === 0) {
			return "";
		}
		let parts = new Array<string>();
		for (let parameter of this.parameters) {
			parts.push(parameter.generateSchema(options));
		}
		return "? <{ " + parts.join(", ") + " }>";
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

	generateSchema(options: shared.Options): string {
		if (this.headers.length === 0) {
			return "";
		}
		let parts = new Array<string>();
		for (let header of this.headers) {
			parts.push(header.generateSchema(options));
		}
		return "<{ " + parts.join(", ") + " }>";
	}

	static parse(tokenizer: tokenization.Tokenizer): Headers {
		return tokenizer.newContext((read, peek) => {
			let headers = new Array<Parameter>();
			tokenization.expect(read(), "<");
			tokenization.expect(read(), "{");
			while (peek()?.value !== "}") {
				let header = Parameter.parse(tokenizer);
				header.name = header.name.toLowerCase();
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
	payload: types.Type | types.Binary;

	constructor(headers: Headers, payload: types.Type | types.Binary) {
		this.headers = headers;
		this.payload = payload;
	}

	generateSchema(options: shared.Options): string {
		let lines = new Array<string>();
		let parts = new Array<string>();
		let headers = this.headers.generateSchema(options);
		if (headers !== "") {
			parts.push(headers);
		}
		if (this.payload !== types.UndefinedType.INSTANCE) {
			parts.push(this.payload.generateSchema(options));
		}
		lines.push(parts.join(" "));
		return lines.join(options.eol);
	}

	static parse(tokenizer: tokenization.Tokenizer): Message {
		return tokenizer.newContext((read, peek) => {
			let headers = new Headers([]);
			if (peek()?.family === "<") {
				headers = Headers.parse(tokenizer);
			}
			let payload: types.Type | types.Binary = types.UndefinedType.INSTANCE;
			if (peek()?.family === "binary") {
				tokenization.expect(read(), "binary");
				payload = types.Binary.INSTANCE;
			} else {
				try {
					payload = types.Type.parse(tokenizer);
				} catch (error) {}
			}
			return new Message(headers, payload);
		});
	}
};

export class Route {
	alias: Alias;
	method: Method;
	path: Path;
	parameters: Parameters;
	request: Message;
	response: Message;

	constructor(alias: Alias, method: Method, path: Path, parameters: Parameters, request: Message, response: Message) {
		this.alias = alias;
		this.method = method;
		this.path = path;
		this.parameters = parameters;
		this.request = request;
		this.response = response;
	}

	generateSchema(options: shared.Options): string {
		let lines = new Array<string>();
		let parts = new Array<string>();
		parts.push("route");
		parts.push(this.alias.generateSchema(options));
		parts.push(`${this.method.generateSchema(options)}:${this.path.generateSchema(options)}`);
		parts.push(this.parameters.generateSchema(options));
		lines.push(parts.filter((part) => part.length > 0).join(" "));
		let request = this.request.generateSchema({ ...options, eol: options.eol + "\t" });
		if (request !== "") {
			lines.push(`\t<= ${request}`);
		}
		let response = this.response.generateSchema({ ...options, eol: options.eol + "\t" });
		if (response !== "") {
			lines.push(`\t=> ${response}`);
		}
		return lines.join(options.eol) + ";";
	}

	static parse(tokenizer: tokenization.Tokenizer): Route {
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "route");
			let alias = new Alias("");
			try {
				alias = Alias.parse(tokenizer);
			} catch (error) {}
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
			tokenization.expect(read(), ";");
			return new Route(alias, method, path, parameters, request, response);
		});
	}
};
