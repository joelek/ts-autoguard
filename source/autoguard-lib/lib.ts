import { Schema } from "./language";

export function transform(string: string): string {
	return Schema.parse(string).generateModule();
};
