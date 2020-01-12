interface TypeGuard<T> {
	(subject: any, path: string): T;
}

export const Any = {
	as(subject: any, path: string = ""): any {
		return subject;
	},
	is(subject: any): subject is any {
		return true;
	}
};

export const Array = {
	as<T>(subject: any, guard: TypeGuard<T>, path: string = ""): globalThis.Array<T> {
		if ((subject != null) && (subject.constructor === globalThis.Array)) {
			if (guard !== Any.as) {
				for (let i = 0; i < subject.length; i++) {
					guard(subject[i], path + "[" + i + "]");
				}
			}
			return subject;
		}
		throw "Type guard \"Array\" failed at \"" + path + "\"!";
	},
	is<T>(subject: any, guard: TypeGuard<T>): subject is globalThis.Array<T> {
		try {
			Array.as(subject, guard);
		} catch (error) {
			return false;
		}
		return true;
	}
};

export const Boolean = {
	as(subject: any, path: string = ""): boolean {
		if ((subject != null) && (subject.constructor === globalThis.Boolean)) {
			return subject;
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

export const Number = {
	as(subject: any, path: string = ""): number {
		if ((subject != null) && (subject.constructor === globalThis.Number)) {
			return subject;
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

export const Object = {
	as<T>(subject: any, guard: { [K in keyof T]: TypeGuard<T[K]> }, path: string = ""): T {
		if ((subject != null) && (subject.constructor === globalThis.Object)) {
			for (let key of globalThis.Object.keys(guard) as Array<keyof T>) {
				guard[key](subject[key], path + "." + key);
			}
			return subject;
		}
		throw "Type guard \"Object\" failed at \"" + path + "\"!";
	},
	is<T>(subject: any, guard: { [K in keyof T]: TypeGuard<T[K]> }): subject is T {
		try {
			Object.as<T>(subject, guard);
		} catch (error) {
			return false;
		}
		return true;
	}
};

export const Record = {
	as<T>(subject: any, guard: TypeGuard<T>, path: string = ""): globalThis.Record<string, T> {
		if ((subject != null) && (subject.constructor === globalThis.Object)) {
			for (let key of globalThis.Object.keys(subject)) {
				guard(subject[key], path + "[\"" + key + "\"]");
			}
			return subject;
		}
		throw "Type guard \"Record\" failed at \"" + path + "\"!";
	},
	is<T>(subject: any, guard: TypeGuard<T>): subject is globalThis.Record<string, T> {
		try {
			Record.as(subject, guard);
		} catch (error) {
			return false;
		}
		return true;
	}
};

export const String = {
	as(subject: any, path: string = ""): string {
		if ((subject != null) && (subject.constructor === globalThis.String)) {
			return subject;
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

export const Union = {
	as<T>(subject: any, guard: Array<TypeGuard<T>>, path: string = ""): T {
		for (let i = 0; i < guard.length; i++) {
			try {
				return guard[i](subject, path);
			} catch (error) {}
		}
		throw "Type guard \"Union\" failed at \"" + path + "\"!";
	},
	is<T>(subject: any, guard: Array<TypeGuard<T>>): subject is T {
		try {
			Union.as(subject, guard);
		} catch (error) {
			return false;
		}
		return true;
	}
};
