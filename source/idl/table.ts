import * as is from "./is";
import * as shared from "./shared";
import * as tokenization from "./tokenization";
import * as types from "./types";

export type TableMember = {
	key: string;
	value: number | string;
};

export class Table {
	typename: string;
	members: Array<TableMember>;

	constructor(typename: string, members: Array<TableMember>) {
		this.typename = typename;
		this.members = members;
	}

	generateSchema(options: shared.Options): string {
		let lines = new Array<string>();
		for (let { key, value } of this.members) {
			lines.push(`\t"${key}": ${value}`);
		}
		let body = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
		return `table ${this.typename}: {${body}};`;
	}

	static parse(tokenizer: tokenization.Tokenizer): Table {
		return tokenizer.newContext((read, peek) => {
			tokenization.expect(read(), "table");
			let typename = tokenization.expect(read(), "IDENTIFIER").value;
			tokenization.expect(read(), ":");
			tokenization.expect(read(), "{");
			let members = new Array<TableMember>();
			if (peek()?.value !== "}") {
				let nextValue = 0;
				while (true) {
					let token = tokenization.expect(read(), [
						...tokenization.IdentifierFamilies,
						"STRING_LITERAL"
					]);
					let key = token.family === "STRING_LITERAL" ? token.value.slice(1, -1) : token.value;
					let value: string | number | undefined;
					if (peek()?.family === ":") {
						tokenization.expect(read(), ":");
						let type = types.Type.parse(tokenizer, {
							parsers: [
								types.IntegerLiteralType.parse,
								types.StringLiteralType.parse
							]
						}) as types.IntegerLiteralType | types.StringLiteralType;
						if (type instanceof types.IntegerLiteralType) {
							value = type.value;
							nextValue = type.value;
						} else {
							value = type.value;
						}
					}
					if (is.absent(value)) {
						value = nextValue;
					}
					members.push({
						key,
						value
					});
					nextValue = nextValue + 1;
					if (peek()?.value !== ",") {
						break;
					}
					tokenization.expect(read(), ",");
				}
			}
			tokenization.expect(read(), "}");
			tokenization.expect(read(), ";");
			return new Table(typename, members);
		});
	}
};
