import * as guards from "./guards";
import * as language from "./language";
import * as serialization from "./serialization";

function transform(string: string, standalone: boolean): string {
	return language.Schema.parse(string).generateModule({
		eol: "\r\n",
		standalone: standalone
	});
}

export {
	guards,
	language,
	serialization,
	transform
};
