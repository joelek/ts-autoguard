import { Schema } from "./language";

export * from "./language";
export * from "./routing";

export function transform(string: string): string {
	return Schema.parse(string).generateModule();
};
