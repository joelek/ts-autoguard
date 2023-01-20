import { Schema } from "../schema";

export type File = {
	name: string;
	content: string;
	overwrite: boolean;
};

export abstract class Generator {
	constructor() {}

	abstract generate(schema: Schema, eol: string): Array<File>;
};
