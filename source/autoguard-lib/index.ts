import * as language from "./language";
import * as serialization from "./serialization";

function transform(string: string): string {
	return language.Schema.parse(string).generateModule({
		eol: "\r\n"
	});
}

export {
	language,
	serialization,
	transform
};
