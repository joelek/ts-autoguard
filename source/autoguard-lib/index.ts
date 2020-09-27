import * as guards from "./guards";
import * as language from "./language";
import * as serialization from "./serialization";
import * as tokenization from "./tokenization";

function transform(string: string, options: language.Options): string {
	let tokens = Array.of(...tokenization.tokenize(string)).filter((token) => {
		return token.family !== "WHITESPACE";
	});
	let schema = language.Schema.parse(tokens);
	return schema.generateModule(options);
}

export {
	guards,
	language,
	serialization,
	tokenization,
	transform
};
