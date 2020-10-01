export const Families = (<A extends string[]>(...tuple: A): [...A] => tuple)(
	"WS",
	"(",
	")",
	"[",
	"]",
	"{",
	"}",
	"?",
	"|",
	"&",
	"@",
	",",
	":",
	"any",
	"boolean",
	"false",
	"null",
	"number",
	"string",
	"true",
	"undefined",
	"IDENTIFIER",
	"NUMBER_LITERAL",
	"STRING_LITERAL"
);

export type Families = typeof Families;

export type Family = typeof Families[number];

export type Token = {
	row: number,
	col: number,
	family: Family,
	value: string
};

export type TypeMap<A extends [...string[]], B> = {
	[_ in A[number]]: B;
};

export class Tokenizer {
	private tokens: Array<Token>;
	private offset: number;

	private peek(): Token | undefined {
		return this.tokens[this.offset];
	}

	private read(): Token {
		if (this.offset >= this.tokens.length) {
			throw `Unexpectedly reached end of stream!`;
		}
		return this.tokens[this.offset++];
	}

	constructor(string: string) {
		let matchers: TypeMap<Families, RegExp> = {
			"WS": /^([\t\r\n ]+)/isu,
			"(": /^([\(])/isu,
			")": /^([\)])/isu,
			"[": /^([\[])/isu,
			"]": /^([\]])/isu,
			"{": /^([\{])/isu,
			"}": /^([\}])/isu,
			"?": /^([\?])/isu,
			"|": /^([\|])/isu,
			"&": /^([&])/isu,
			"@": /^([@])/isu,
			",": /^([,])/isu,
			":": /^([:])/isu,
			"any": /^(any)/isu,
			"boolean": /^(boolean)/isu,
			"false": /^(false)/isu,
			"null": /^(null)/isu,
			"number": /^(number)/isu,
			"string": /^(string)/isu,
			"true": /^(true)/isu,
			"undefined": /^(undefined)/isu,
			"IDENTIFIER": /^([a-z][a-z0-9_]*)/isu,
			"NUMBER_LITERAL": /^(([1-9][0-9]+)|([0-9]))/isu,
			"STRING_LITERAL": /^(["][^"]*["])/isu
		};
		let tokens = new Array<Token>();
		let row = 1;
		let col = 1;
		while (string.length > 0) {
			let token: [Family, string] | undefined;
			for (let key in matchers) {
				let type = key as Family;
				let exec = matchers[type].exec(string);
				if (exec == null) {
					continue;
				}
				if ((token == null) || (exec[1].length > token[1].length)) {
					token = [type, exec[1]];
				}
			}
			if (token == null) {
				throw `Unrecognized token at row ${row}, col ${col}!`;
			}
			tokens.push({
				family: token[0],
				value: token[1],
				row: row,
				col: col
			});
			string = string.slice(token[1].length);
			let lines = token[1].split(/\r?\n/);
			if (lines.length > 1) {
				row += lines.length - 1;
				col = 1;
			}
			col += lines[lines.length - 1].length;
		}
		this.tokens = tokens.filter((token) => {
			return token.family !== "WS";
		});
		this.offset = 0;
	}

	newContext<A>(producer: (read: () => Token, peek: () => Token | undefined) => A): A {
		let offset = this.offset;
		try {
			return producer(() => this.read(), () => this.peek());
		} catch (error) {
			this.offset = offset;
			throw error;
		}
	}
};

export function expect(token: Token, family: Family): Token {
	if (family !== token.family) {
		throw `Unexpected ${token.family} at row ${token.row}, col ${token.col}!`;
	}
	return token;
};
