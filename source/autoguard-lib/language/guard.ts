import * as shared from "../shared";
import * as tokenization from "../tokenization";
import * as types from "./types";

export class Guard {
	typename: string;
	type: types.Type;

	constructor(typename: string, type: types.Type) {
		this.typename = typename;
		this.type = type;
	}

	generateSchema(options: shared.Options): string {
		let lines = new Array<string>();
		lines.push(`guard ${this.typename}: ${this.type.generateSchema(options)}`);
		return lines.join(options.eol);
	}

	static parse(tokenizer: tokenization.Tokenizer): Guard {
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "guard");
			let typename = tokenization.expect(read(), "IDENTIFIER").value;
			tokenization.expect(read(), ":");
			let type = types.Type.parse(tokenizer);
			return new Guard(typename, type);
		});
	}
};
