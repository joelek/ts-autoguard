import * as serialization from "./serialization";

export type Any = any;

export const Any = {
	as(subject: any, path: string = ""): any {
		return subject;
	},
	is(subject: any): subject is any {
		try {
			Any.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	}
};

export const Array = {
	of<A extends serialization.Message>(guard: serialization.MessageGuard<A>): serialization.MessageGuard<Array<A>> {
		return {
			as(subject: any, path: string = ""): Array<A> {
				if ((subject != null) && (subject.constructor === globalThis.Array)) {
					for (let i = 0; i < subject.length; i++) {
						guard.as(subject[i], path + "[" + i + "]");
					}
					return subject;
				}
				throw "Type guard \"Array\" failed at \"" + path + "\"!";
			},
			is(subject: any): subject is Array<A> {
				try {
					this.as(subject);
				} catch (error) {
					return false;
				}
				return true;
			}
		};
	}
};

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
			this.as(subject);
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
			this.as(subject);
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
			this.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	}
};

export const NumberLiteral = {
	of<A extends number>(value: A): serialization.MessageGuard<A> {
		return {
			as(subject: any, path: string = ""): A {
				if (subject === value) {
					return subject;
				}
				throw "Type guard \"NumberLiteral\" failed at \"" + path + "\"!";
			},
			is(subject: any): subject is A {
				try {
					this.as(subject);
				} catch (error) {
					return false;
				}
				return true;
			}
		};
	}
};

export const Object = {
	of<A extends { [key: string]: serialization.Message }>(guards: serialization.MessageGuardMap<A>): serialization.MessageGuard<A> {
		return {
			as(subject: any, path: string = ""): A {
				if ((subject != null) && (subject.constructor === globalThis.Object)) {
					for (let key in guards) {
						guards[key].as(subject[key], path + "[\"" + key + "\"]");
					}
					return subject;
				}
				throw "Type guard \"Object\" failed at \"" + path + "\"!";
			},
			is(subject: any): subject is A {
				try {
					this.as(subject);
				} catch (error) {
					return false;
				}
				return true;
			}
		};
	}
};

export const Record = {
	of<A extends serialization.Message>(guard: serialization.MessageGuard<A>): serialization.MessageGuard<Record<string, undefined | A>> {
		return {
			as(subject: any, path: string = ""): Record<string, undefined | A> {
				if ((subject != null) && (subject.constructor === globalThis.Object)) {
					for (let key of globalThis.Object.keys(subject)) {
						guard.as(subject[key], path + "[\"" + key + "\"]");
					}
					return subject;
				}
				throw "Type guard \"Record\" failed at \"" + path + "\"!";
			},
			is(subject: any): subject is Record<string, undefined | A> {
				try {
					this.as(subject);
				} catch (error) {
					return false;
				}
				return true;
			}
		};
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
			this.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	}
};

export const StringLiteral = {
	of<A extends string>(value: A): serialization.MessageGuard<A> {
		return {
			as(subject: any, path: string = ""): A {
				if (subject === value) {
					return subject;
				}
				throw "Type guard \"StringLiteral\" failed at \"" + path + "\"!";
			},
			is(subject: any): subject is A {
				try {
					this.as(subject);
				} catch (error) {
					return false;
				}
				return true;
			}
		};
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
			this.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	}
};

export type Autoguard = {
	"Any": Any,
	"Boolean": Boolean,
	"Number": Number,
	"Null": Null,
	"String": String,
	"Undefined": Undefined
};

export const Autoguard = {
	"Any": Any,
	"Boolean": Boolean,
	"Number": Number,
	"Null": Null,
	"String": String,
	"Undefined": Undefined
};
