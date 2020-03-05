import * as guards from "./guards";
import * as language from "./language";
import * as serialization from "./serialization";

function transform(string: string, options: language.Options): string {
	return language.Schema.parse(string).generateModule(options);
}

export {
	guards,
	language,
	serialization,
	transform
};
