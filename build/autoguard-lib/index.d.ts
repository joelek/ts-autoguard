import * as guards from "./guards";
import * as language from "./language";
import * as serialization from "./serialization";
declare function transform(string: string, options: language.Options): string;
export { guards, language, serialization, transform };
