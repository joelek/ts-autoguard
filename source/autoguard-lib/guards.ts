import * as serialization from "./serialization";

export type Boolean = boolean;

export const Boolean = {
	as(subject: any, path: string = ""): boolean {
		if ((subject != null) && (subject.constructor === globalThis.Boolean)) {
			return subject as boolean;
		}
		throw "Type guard \"Boolean\" failed at \"" + path + "\"!";
	},
	is(subject: any): subject is boolean {
		try {
			Boolean.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	}
};

export type Number = number;

export const Number = {
	as(subject: any, path: string = ""): number {
		if ((subject != null) && (subject.constructor === globalThis.Number)) {
			return subject as number;
		}
		throw "Type guard \"Number\" failed at \"" + path + "\"!";
	},
	is(subject: any): subject is number {
		try {
			Number.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	}
};

export type Null = null;

export const Null = {
	as(subject: any, path: string = ""): null {
		if (subject === null) {
			return subject;
		}
		throw "Type guard \"Null\" failed at \"" + path + "\"!";
	},
	is(subject: any): subject is null {
		try {
			Null.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	}
};

export type String = string;

export const String = {
	as(subject: any, path: string = ""): string {
		if ((subject != null) && (subject.constructor === globalThis.String)) {
			return subject as string;
		}
		throw "Type guard \"String\" failed at \"" + path + "\"!";
	},
	is(subject: any): subject is string {
		try {
			String.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	}
};

export type Undefined = undefined;

export const Undefined = {
	as(subject: any, path: string = ""): undefined {
		if (subject === undefined) {
			return subject;
		}
		throw "Type guard \"Undefined\" failed at \"" + path + "\"!";
	},
	is(subject: any): subject is undefined {
		try {
			Undefined.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	}
};

export type Autoguard = {
	"Boolean": Boolean,
	"Number": Number,
	"Null": Null,
	"String": String,
	"Undefined": Undefined
};

export const Autoguard = {
	"Boolean": Boolean,
	"Number": Number,
	"Null": Null,
	"String": String,
	"Undefined": Undefined
};
