import * as guards from "./guards";
import * as language from "./language";
import * as serialization from "./serialization";
import * as tokenization from "./tokenization";

function transform(string: string, options: language.Options): string {
	let tokenizer = new tokenization.Tokenizer(string);
	let schema = language.Schema.parse(tokenizer);
	return schema.generateModule(options);
}

export {
	guards,
	language,
	serialization,
	tokenization,
	transform
};
