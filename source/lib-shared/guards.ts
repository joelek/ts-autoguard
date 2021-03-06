import * as serialization from "./serialization";

type IntersectionOf<A extends any[]> = ExpansionOf<Unwrap<IntersectionOfUnion<ValuesOf<Wrap<A>>>>>;
type IntersectionOfUnion<A> = (A extends any ? (_: A) => void : never) extends ((_: infer B) => void) ? B : never;
type TupleOf<A extends any[]> = [...A];
type UnionOf<A extends any[]> = A[number];
type RequiredKeys<A> = { [B in keyof A]: undefined extends A[B] ? never : B; }[keyof A];
type OptionalKeys<A> = { [B in keyof A]: undefined extends A[B] ? B : never; }[keyof A];
type MakeUndefinedOptional<A> = ExpansionOf<{ [B in RequiredKeys<A>]: A[B]; } & { [B in OptionalKeys<A>]?: A[B]; }>;
type IndicesOfTuple<A extends any[]> = Exclude<keyof A, keyof []>;
type Wrap<A extends any[]> = { [B in IndicesOfTuple<A>]: { wrappee: A[B] }; };
type Unwrap<A> = A extends { wrappee: any } ? A["wrappee"] : never;
type ValuesOf<A> = A[keyof A];
type ExpansionOf<A> = A extends infer B ? { [C in keyof B]: B[C] } : never;

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

export const Object = {
	of<A extends serialization.MessageMap<A>>(guards: serialization.MessageGuardMap<A>): serialization.MessageGuard<MakeUndefinedOptional<A>> {
		return {
			as(subject: any, path: string = ""): MakeUndefinedOptional<A> {
				if ((subject != null) && (subject.constructor === globalThis.Object)) {
					for (let key in guards) {
						guards[key].as(subject[key], path + (/^([a-z][a-z0-9_]*)$/isu.test(key) ? "." + key : "[\"" + key + "\"]"));
					}
					return subject;
				}
				throw new serialization.MessageGuardError(this, subject, path);
			},
			is(subject: any): subject is MakeUndefinedOptional<A> {
				try {
					this.as(subject);
				} catch (error) {
					return false;
				}
				return true;
			},
			ts(eol: string = "\n"): string {
				let lines = new globalThis.Array<string>();
				for (let [key, value] of globalThis.Object.entries<serialization.MessageGuard<any>>(guards)) {
					lines.push(`\t"${key}": ${value.ts(eol + "\t")}`);
				}
				return "object<" + eol + lines.join("," + eol) + eol + ">";
			}
		};
	}
};

export const Record = {
	of<A extends serialization.Message>(guard: serialization.MessageGuard<A>): serialization.MessageGuard<Record<string, undefined | A>> {
		return {
			as(subject: any, path: string = ""): Record<string, undefined | A> {
				if ((subject != null) && (subject.constructor === globalThis.Object)) {
					let wrapped = Union.of(Undefined, guard);
					for (let key of globalThis.Object.keys(subject)) {
						wrapped.as(subject[key], path + "[\"" + key + "\"]");
					}
					return subject;
				}
				throw new serialization.MessageGuardError(this, subject, path);
			},
			is(subject: any): subject is Record<string, undefined | A> {
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
