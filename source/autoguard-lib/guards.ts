// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.

export type Boolean = boolean;

export const Boolean = {
	as(subject: any, path: string = ""): Boolean {
		return ((subject, path) => {
			if ((subject != null) && (subject.constructor === globalThis.Boolean)) {
				return subject;
			}
			throw "Type guard \"Boolean\" failed at \"" + path + "\"!";
		})(subject, path);
	},
	is(subject: any): subject is Boolean {
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
	as(subject: any, path: string = ""): Number {
		return ((subject, path) => {
			if ((subject != null) && (subject.constructor === globalThis.Number)) {
				return subject;
			}
			throw "Type guard \"Number\" failed at \"" + path + "\"!";
		})(subject, path);
	},
	is(subject: any): subject is Number {
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
	as(subject: any, path: string = ""): Null {
		return ((subject, path) => {
			if (subject === null) {
				return subject;
			}
			throw "Type guard \"Null\" failed at \"" + path + "\"!";
		})(subject, path);
	},
	is(subject: any): subject is Null {
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
	as(subject: any, path: string = ""): String {
		return ((subject, path) => {
			if ((subject != null) && (subject.constructor === globalThis.String)) {
				return subject;
			}
			throw "Type guard \"String\" failed at \"" + path + "\"!";
		})(subject, path);
	},
	is(subject: any): subject is String {
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
	as(subject: any, path: string = ""): Undefined {
		return ((subject, path) => {
			if (subject === undefined) {
				return subject;
			}
			throw "Type guard \"Undefined\" failed at \"" + path + "\"!";
		})(subject, path);
	},
	is(subject: any): subject is Undefined {
		try {
			Undefined.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	}
};

export type Autoguard = {
	Boolean: Boolean,
	Number: Number,
	Null: Null,
	String: String,
	Undefined: Undefined
};

export const Autoguard = {
	Boolean: Boolean,
	Number: Number,
	Null: Null,
	String: String,
	Undefined: Undefined
};
