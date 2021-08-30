import * as serialization from "./serialization";

type IntersectionOf<A extends any[]> = ExpansionOf<Unwrap<IntersectionOfUnion<ValuesOf<Wrap<A>>>>>;
type IntersectionOfUnion<A> = (A extends any ? (_: A) => void : never) extends ((_: infer B) => void) ? B : never;
type TupleOf<A extends any[]> = [...A];
type UnionOf<A extends any[]> = A[number];
type RequiredKeys<A> = { [B in keyof A]-?: undefined extends A[B] ? never : B; }[keyof A];
type OptionalKeys<A> = { [B in keyof A]-?: undefined extends A[B] ? B : never; }[keyof A];
type MakeUndefinedOptional<A> = ExpansionOf<{ [B in RequiredKeys<A>]: A[B]; } & { [B in OptionalKeys<A>]?: A[B]; }>;
type IndicesOfTuple<A extends any[]> = Exclude<keyof A, keyof []>;
type Wrap<A extends any[]> = { [B in IndicesOfTuple<A>]: { wrappee: A[B] }; };
type Unwrap<A> = A extends { wrappee: any } ? A["wrappee"] : never;
type ValuesOf<A> = A[keyof A];
type ExpansionOf<A> = A extends infer B ? { [C in keyof B]: B[C] } : never;
type ObjectOf<A, B> = ExpansionOf<A & Partial<B>>;

export const Any = {
	as(subject: any, path: string = ""): any {
		return subject;
	},
	is(subject: any): subject is any {
		try {
			this.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	},
	ts(eol: string = "\n"): string {
		return `any`;
	}
};

export type Any = any;

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
				throw new serialization.MessageGuardError(this, subject, path);
			},
			is(subject: any): subject is Array<A> {
				try {
					this.as(subject);
				} catch (error) {
					return false;
				}
				return true;
			},
			ts(eol: string = "\n"): string {
				return `array<${guard.ts(eol)}>`;
			}
		};
	}
};

export type Array<A extends serialization.Message> = globalThis.Array<A>;

export const Boolean = {
	as(subject: any, path: string = ""): boolean {
		if ((subject != null) && (subject.constructor === globalThis.Boolean)) {
			return subject as boolean;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	},
	is(subject: any): subject is boolean {
		try {
			this.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	},
	ts(eol: string = "\n"): string {
		return `boolean`;
	}
};

export type Boolean = boolean;

export const BooleanLiteral = {
	of<A extends boolean>(value: A): serialization.MessageGuard<A> {
		return {
			as(subject: any, path: string = ""): A {
				if (subject === value) {
					return subject;
				}
				throw new serialization.MessageGuardError(this, subject, path);
			},
			is(subject: any): subject is A {
				try {
					this.as(subject);
				} catch (error) {
					return false;
				}
				return true;
			},
			ts(eol: string = "\n"): string {
				return `${value}`;
			}
		};
	}
};

export type BooleanLiteral<A extends boolean> = A;

export const Group = {
	of<A extends serialization.Message>(guard: serialization.MessageGuard<A>, name?: string): serialization.MessageGuard<A> {
		return {
			as(subject: any, path: string = ""): A {
				return guard.as(subject, path);
			},
			is(subject: any): subject is A {
				return guard.is(subject);
			},
			ts(eol: string = "\n"): string {
				return name ?? guard.ts(eol);
			}
		};
	}
};

export type Group<A extends serialization.Message> = A;

export const Intersection = {
	of<A extends TupleOf<serialization.Message>>(...guards: TupleOf<serialization.MessageGuardTuple<A>>): serialization.MessageGuard<IntersectionOf<A>> {
		return {
			as(subject: any, path: string = ""): IntersectionOf<A> {
				for (let guard of guards) {
					guard.as(subject, path);
				}
				return subject;
			},
			is(subject: any): subject is IntersectionOf<A> {
				try {
					this.as(subject);
				} catch (error) {
					return false;
				}
				return true;
			},
			ts(eol: string = "\n"): string {
				let lines = new globalThis.Array<string>();
				for (let guard of guards) {
					lines.push("\t" + guard.ts(eol + "\t"));
				}
				return "intersection<" + eol + lines.join("," + eol) + eol +">";
			}
		};
	}
};

export type Intersection<A extends TupleOf<serialization.Message>> = IntersectionOf<A>;

export const Null = {
	as(subject: any, path: string = ""): null {
		if (subject === null) {
			return subject;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	},
	is(subject: any): subject is null {
		try {
			this.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	},
	ts(eol: string = "\n"): string {
		return `null`;
	}
};

export type Null = null;

export const Number = {
	as(subject: any, path: string = ""): number {
		if ((subject != null) && (subject.constructor === globalThis.Number)) {
			return subject as number;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	},
	is(subject: any): subject is number {
		try {
			this.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	},
	ts(eol: string = "\n"): string {
		return `number`;
	}
};

export type Number = number;

export const NumberLiteral = {
	of<A extends number>(value: A): serialization.MessageGuard<A> {
		return {
			as(subject: any, path: string = ""): A {
				if (subject === value) {
					return subject;
				}
				throw new serialization.MessageGuardError(this, subject, path);
			},
			is(subject: any): subject is A {
				try {
					this.as(subject);
				} catch (error) {
					return false;
				}
				return true;
			},
			ts(eol: string = "\n"): string {
				return `${value}`;
			}
		};
	}
};

export type NumberLiteral<A extends number> = A;

export const Object = {
	of<A extends serialization.MessageMap<A>, B extends serialization.MessageMap<B> = {}>(required: serialization.MessageGuardMap<A>, optional?: serialization.MessageGuardMap<B>): serialization.MessageGuard<ObjectOf<A, B>> {
		return {
			as(subject: any, path: string = ""): ObjectOf<A, B> {
				if ((subject != null) && (subject.constructor === globalThis.Object)) {
					for (let key in required) {
						required[key].as(subject[key], path + (/^([a-z][a-z0-9_]*)$/isu.test(key) ? "." + key : "[\"" + key + "\"]"));
					}
					for (let key in optional) {
						if (key in subject && subject[key] !== undefined) {
							optional[key].as(subject[key], path + (/^([a-z][a-z0-9_]*)$/isu.test(key) ? "." + key : "[\"" + key + "\"]"));
						}
					}
					return subject;
				}
				throw new serialization.MessageGuardError(this, subject, path);
			},
			is(subject: any): subject is ObjectOf<A, B> {
				try {
					this.as(subject);
				} catch (error) {
					return false;
				}
				return true;
			},
			ts(eol: string = "\n"): string {
				let lines = new globalThis.Array<string>();
				for (let [key, value] of globalThis.Object.entries<serialization.MessageGuard<any>>(required)) {
					lines.push(`\t"${key}": ${value.ts(eol + "\t")}`);
				}
				for (let [key, value] of globalThis.Object.entries<serialization.MessageGuard<any>>(optional ?? {})) {
					lines.push(`\t"${key}"?: ${value.ts(eol + "\t")}`);
				}
				return "object<" + eol + lines.join("," + eol) + eol + ">";
			}
		};
	}
};

export type Object<A extends serialization.MessageMap<A>, B extends serialization.MessageMap<B> = {}> = ObjectOf<A, B>;

export const Record = {
	of<A extends serialization.Message>(guard: serialization.MessageGuard<A>): serialization.MessageGuard<globalThis.Record<string, undefined | A>> {
		return {
			as(subject: any, path: string = ""): globalThis.Record<string, undefined | A> {
				if ((subject != null) && (subject.constructor === globalThis.Object)) {
					let wrapped = Union.of(Undefined, guard);
					for (let key of globalThis.Object.keys(subject)) {
						wrapped.as(subject[key], path + "[\"" + key + "\"]");
					}
					return subject;
				}
				throw new serialization.MessageGuardError(this, subject, path);
			},
			is(subject: any): subject is globalThis.Record<string, undefined | A> {
				try {
					this.as(subject);
				} catch (error) {
					return false;
				}
				return true;
			},
			ts(eol: string = "\n"): string {
				return `record<${guard.ts(eol)}>`;
			}
		};
	}
};

export type Record<A extends serialization.Message> = globalThis.Record<string, undefined | A>;

export const Reference = {
	of<A extends serialization.Message>(guard: () => serialization.MessageGuard<A>): serialization.MessageGuard<A> {
		return {
			as(subject: any, path: string = ""): A {
				return guard().as(subject, path);
			},
			is(subject: any): subject is A {
				return guard().is(subject);
			},
			ts(eol: string = "\n"): string {
				return guard().ts(eol);
			}
		};
	}
};

export type Reference<A extends serialization.Message> = A;

export const String = {
	as(subject: any, path: string = ""): string {
		if ((subject != null) && (subject.constructor === globalThis.String)) {
			return subject as string;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	},
	is(subject: any): subject is string {
		try {
			this.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	},
	ts(eol: string = "\n"): string {
		return "string";
	}
};

export type String = string;

export const StringLiteral = {
	of<A extends string>(value: A): serialization.MessageGuard<A> {
		return {
			as(subject: any, path: string = ""): A {
				if (subject === value) {
					return subject;
				}
				throw new serialization.MessageGuardError(this, subject, path);
			},
			is(subject: any): subject is A {
				try {
					this.as(subject);
				} catch (error) {
					return false;
				}
				return true;
			},
			ts(eol: string = "\n"): string {
				return `"${value}"`;
			}
		};
	}
};

export type StringLiteral<A extends string> = A;

export const Tuple = {
	of<A extends TupleOf<serialization.Message>>(...guards: TupleOf<serialization.MessageGuardTuple<A>>): serialization.MessageGuard<TupleOf<A>> {
		return {
			as(subject: any, path: string = ""): TupleOf<A> {
				if ((subject != null) && (subject.constructor === globalThis.Array)) {
					for (let i = 0; i < guards.length; i++) {
						guards[i].as(subject[i], path + "[" + i + "]");
					}
					return subject as TupleOf<A>;
				}
				throw new serialization.MessageGuardError(this, subject, path);
			},
			is(subject: any): subject is TupleOf<A> {
				try {
					this.as(subject);
				} catch (error) {
					return false;
				}
				return true;
			},
			ts(eol: string = "\n"): string {
				let lines = new globalThis.Array<string>();
				for (let guard of guards) {
					lines.push(`\t${guard.ts(eol + "\t")}`);
				}
				return "tuple<" + eol + lines.join("," + eol) + eol + ">";
			}
		};
	}
};

export type Tuple<A extends TupleOf<serialization.Message>> = TupleOf<A>;

export const Undefined = {
	as(subject: any, path: string = ""): undefined {
		if (subject === undefined) {
			return subject;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	},
	is(subject: any): subject is undefined {
		try {
			this.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	},
	ts(eol: string = "\n"): string {
		return "undefined";
	}
};

export type Undefined = undefined;

export const Union = {
	of<A extends TupleOf<serialization.Message>>(...guards: TupleOf<serialization.MessageGuardTuple<A>>): serialization.MessageGuard<UnionOf<A>> {
		return {
			as(subject: any, path: string = ""): UnionOf<A> {
				for (let guard of guards) {
					try {
						return guard.as(subject, path);
					} catch (error) {}
				}
				throw new serialization.MessageGuardError(this, subject, path);
			},
			is(subject: any): subject is UnionOf<A> {
				try {
					this.as(subject);
				} catch (error) {
					return false;
				}
				return true;
			},
			ts(eol: string = "\n"): string {
				let lines = new globalThis.Array<string>();
				for (let guard of guards) {
					lines.push("\t" + guard.ts(eol + "\t"));
				}
				return "union<" + eol + lines.join("," + eol) + eol +">";
			}
		};
	}
};

export type Union<A extends TupleOf<serialization.Message>> = UnionOf<A>;
