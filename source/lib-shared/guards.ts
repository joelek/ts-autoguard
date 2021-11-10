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

export type Any = any;

export class AnyGuard extends serialization.MessageGuardBase<Any> {
	constructor() {
		super();
	}

	as(subject: any, path: string = ""): Any {
		return subject;
	}

	ts(eol: string = "\n"): string {
		return "any";
	}
};

export const Any = new AnyGuard();

export type Array<A extends serialization.Message> = globalThis.Array<A>;

export class ArrayGuard<A extends serialization.Message> extends serialization.MessageGuardBase<Array<A>> {
	readonly guard: serialization.MessageGuard<A>;

	constructor(guard: serialization.MessageGuard<A>) {
		super();
		this.guard = guard;
	}

	as(subject: any, path: string = ""): Array<A> {
		if ((subject != null) && (subject.constructor === globalThis.Array)) {
			for (let i = 0; i < subject.length; i++) {
				this.guard.as(subject[i], path + "[" + i + "]");
			}
			return subject;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	}

	ts(eol: string = "\n"): string {
		return `array<${this.guard.ts(eol)}>`;
	}
};

export const Array = {
	of<A extends serialization.Message>(guard: serialization.MessageGuardBase<A>): ArrayGuard<A> {
		return new ArrayGuard(guard);
	}
};

export type BigInt = bigint;

export class BigIntGuard extends serialization.MessageGuardBase<BigInt> {
	constructor() {
		super();
	}

	as(subject: any, path: string = ""): BigInt {
		if ((subject != null) && (subject.constructor === globalThis.BigInt)) {
			return subject as bigint;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	}

	ts(eol: string = "\n"): string {
		return "bigint";
	}
};

export const BigInt = new BigIntGuard();

export type Binary = Uint8Array;

export class BinaryGuard extends serialization.MessageGuardBase<Binary> {
	constructor() {
		super();
	}

	as(subject: any, path: string = ""): Binary {
		if ((subject != null) && (subject.constructor === globalThis.Uint8Array)) {
			return subject;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	}

	ts(eol: string = "\n"): string {
		return "binary";
	}
};

export const Binary = new BinaryGuard();

export type Boolean = boolean;

export class BooleanGuard extends serialization.MessageGuardBase<Boolean> {
	constructor() {
		super();
	}

	as(subject: any, path: string = ""): Boolean {
		if ((subject != null) && (subject.constructor === globalThis.Boolean)) {
			return subject as boolean;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	}

	ts(eol: string = "\n"): string {
		return "boolean";
	}
};

export const Boolean = new BooleanGuard();

export type BooleanLiteral<A extends boolean> = A;

export class BooleanLiteralGuard<A extends boolean> extends serialization.MessageGuardBase<BooleanLiteral<A>> {
	readonly value: A;

	constructor(value: A) {
		super();
		this.value = value;
	}

	as(subject: any, path: string = ""): BooleanLiteral<A> {
		if (subject === this.value) {
			return subject;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	}

	ts(eol: string = "\n"): string {
		return `${this.value}`;
	}
};

export const BooleanLiteral = {
	of<A extends boolean>(value: A): BooleanLiteralGuard<A> {
		return new BooleanLiteralGuard(value);
	}
};

export type Group<A extends serialization.Message> = A;

export class GroupGuard<A extends serialization.Message> extends serialization.MessageGuardBase<Group<A>> {
	readonly guard: serialization.MessageGuard<A>;
	readonly name?: string;

	constructor(guard: serialization.MessageGuard<A>, name?: string) {
		super();
		this.guard = guard;
		this.name = name;
	}

	as(subject: any, path: string = ""): Group<A> {
		return this.guard.as(subject, path);
	}

	ts(eol: string = "\n"): string {
		return this.name ?? this.guard.ts(eol);
	}
};

export const Group = {
	of<A extends serialization.Message>(guard: serialization.MessageGuard<A>, name?: string): GroupGuard<A> {
		return new GroupGuard(guard, name);
	}
};

export type Intersection<A extends TupleOf<serialization.MessageMap<any>[]>> = IntersectionOf<A>;

export class IntersectionGuard<A extends TupleOf<serialization.MessageMap<any>[]>> extends serialization.MessageGuardBase<Intersection<A>> {
	readonly guards: TupleOf<serialization.MessageGuardTuple<A>>;

	constructor(...guards: TupleOf<serialization.MessageGuardTuple<A>>) {
		super();
		this.guards = guards;
	}

	as(subject: any, path: string = ""): Intersection<A> {
		for (let guard of this.guards) {
			guard.as(subject, path);
		}
		return subject;
	}

	ts(eol: string = "\n"): string {
		let lines = new globalThis.Array<string>();
		for (let guard of this.guards) {
			lines.push("\t" + guard.ts(eol + "\t"));
		}
		return lines.length === 0 ? "intersection<>" : "intersection<" + eol + lines.join("," + eol) + eol +">";
	}
};

export const Intersection = {
	of<A extends TupleOf<serialization.MessageMap<any>[]>>(...guards: TupleOf<serialization.MessageGuardTuple<A>>): IntersectionGuard<A> {
		return new IntersectionGuard(...guards);
	}
};

export type Null = null;

export class NullGuard extends serialization.MessageGuardBase<Null> {
	constructor() {
		super();
	}

	as(subject: any, path: string = ""): Null {
		if (subject === null) {
			return subject;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	}

	ts(eol: string = "\n"): string {
		return "null";
	}
};

export const Null = new NullGuard();

export type Number = number;

export class NumberGuard extends serialization.MessageGuardBase<Number> {
	constructor() {
		super();
	}

	as(subject: any, path: string = ""): Number {
		if ((subject != null) && (subject.constructor === globalThis.Number)) {
			return subject as number;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	}

	ts(eol: string = "\n"): string {
		return "number";
	}
};

export const Number = new NumberGuard();

export type NumberLiteral<A extends number> = A;

export class NumberLiteralGuard<A extends number> extends serialization.MessageGuardBase<NumberLiteral<A>> {
	readonly value : A;

	constructor(value: A) {
		super();
		this.value = value;
	}

	as(subject: any, path: string = ""): NumberLiteral<A> {
		if (subject === this.value) {
			return subject;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	}

	ts(eol: string = "\n"): string {
		return `${this.value}`;
	}
};

export const NumberLiteral = {
	of<A extends number>(value: A): NumberLiteralGuard<A> {
		return new NumberLiteralGuard(value);
	}
};

export type Object<A extends serialization.MessageMap<A>, B extends serialization.MessageMap<B> = {}> = globalThis.Record<string, any> & ObjectOf<A, B>;

export class ObjectGuard<A extends serialization.MessageMap<A>, B extends serialization.MessageMap<B> = {}> extends serialization.MessageGuardBase<Object<A, B>> {
	readonly required: serialization.MessageGuardMap<A>;
	readonly optional: serialization.MessageGuardMap<B>;

	constructor(required: serialization.MessageGuardMap<A>, optional: serialization.MessageGuardMap<B>) {
		super();
		this.required = required;
		this.optional = optional;
	}

	as(subject: any, path: string = ""): Object<A, B> {
		if ((subject != null) && (subject.constructor === globalThis.Object)) {
			for (let key in this.required) {
				this.required[key].as(subject[key], path + (/^([a-z][a-z0-9_]*)$/isu.test(key) ? "." + key : "[\"" + key + "\"]"));
			}
			for (let key in this.optional) {
				if (key in subject && subject[key] !== undefined) {
					this.optional[key].as(subject[key], path + (/^([a-z][a-z0-9_]*)$/isu.test(key) ? "." + key : "[\"" + key + "\"]"));
				}
			}
			return subject;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	}

	ts(eol: string = "\n"): string {
		let lines = new globalThis.Array<string>();
		for (let [key, value] of globalThis.Object.entries<serialization.MessageGuard<any>>(this.required)) {
			lines.push(`\t"${key}": ${value.ts(eol + "\t")}`);
		}
		for (let [key, value] of globalThis.Object.entries<serialization.MessageGuard<any>>(this.optional)) {
			lines.push(`\t"${key}"?: ${value.ts(eol + "\t")}`);
		}
		return lines.length === 0 ? "object<>" : "object<" + eol + lines.join("," + eol) + eol + ">";
	}
};

export const Object = {
	of<A extends serialization.MessageMap<A>, B extends serialization.MessageMap<B> = {}>(required: serialization.MessageGuardMap<A>, optional: serialization.MessageGuardMap<B> = {} as any): ObjectGuard<A, B> {
		return new ObjectGuard(required, optional);
	}
};

export type Record<A extends serialization.Message> = globalThis.Record<string, undefined | A>;

export class RecordGuard<A extends serialization.Message> extends serialization.MessageGuardBase<Record<A>> {
	readonly guard: serialization.MessageGuard<A>;

	constructor(guard: serialization.MessageGuard<A>) {
		super();
		this.guard = guard;
	}

	as(subject: any, path: string = ""): Record<A> {
		if ((subject != null) && (subject.constructor === globalThis.Object)) {
			let wrapped = Union.of(Undefined, this.guard);
			for (let key of globalThis.Object.keys(subject)) {
				wrapped.as(subject[key], path + "[\"" + key + "\"]");
			}
			return subject;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	}

	ts(eol: string = "\n"): string {
		return `record<${this.guard.ts(eol)}>`;
	}
};

export const Record = {
	of<A extends serialization.Message>(guard: serialization.MessageGuard<A>): RecordGuard<A> {
		return new RecordGuard(guard);
	}
};

export type Reference<A extends serialization.Message> = A;

export class ReferenceGuard<A extends serialization.Message> extends serialization.MessageGuardBase<Reference<A>> {
	readonly guard: () => serialization.MessageGuard<A>;

	constructor(guard: () => serialization.MessageGuard<A>) {
		super();
		this.guard = guard;
	}

	as(subject: any, path: string = ""): Reference<A> {
		return this.guard().as(subject, path);
	}

	ts(eol: string = "\n"): string {
		return this.guard().ts(eol);
	}
};

export const Reference = {
	of<A extends serialization.Message>(guard: () => serialization.MessageGuard<A>): ReferenceGuard<A> {
		return new ReferenceGuard(guard);
	}
};

export type String = string;

export class StringGuard extends serialization.MessageGuardBase<String> {
	constructor() {
		super();
	}

	as(subject: any, path: string = ""): String {
		if ((subject != null) && (subject.constructor === globalThis.String)) {
			return subject as string;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	}

	ts(eol: string = "\n"): string {
		return "string";
	}
};

export const String = new StringGuard();

export type StringLiteral<A extends string> = A;

export class StringLiteralGuard<A extends string> extends serialization.MessageGuardBase<StringLiteral<A>> {
	readonly value: A;

	constructor(value: A) {
		super();
		this.value = value;
	}

	as(subject: any, path: string = ""): StringLiteral<A> {
		if (subject === this.value) {
			return subject;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	}

	ts(eol: string = "\n"): string {
		return `"${this.value}"`;
	}
};

export const StringLiteral = {
	of<A extends string>(value: A): StringLiteralGuard<A> {
		return new StringLiteralGuard(value);
	}
};

export type Tuple<A extends TupleOf<serialization.Message>> = [...TupleOf<A>, ...any[]];

export class TupleGuard<A extends TupleOf<serialization.Message>> extends serialization.MessageGuardBase<Tuple<A>> {
	readonly guards: TupleOf<serialization.MessageGuardTuple<A>>;

	constructor(...guards: TupleOf<serialization.MessageGuardTuple<A>>) {
		super();
		this.guards = guards;
	}

	as(subject: any, path: string = ""): Tuple<A> {
		if ((subject != null) && (subject.constructor === globalThis.Array)) {
			for (let i = 0; i < this.guards.length; i++) {
				this.guards[i].as(subject[i], path + "[" + i + "]");
			}
			return subject as Tuple<A>;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	}

	ts(eol: string = "\n"): string {
		let lines = new globalThis.Array<string>();
		for (let guard of this.guards) {
			lines.push(`\t${guard.ts(eol + "\t")}`);
		}
		return lines.length === 0 ? "tuple<>" : "tuple<" + eol + lines.join("," + eol) + eol + ">";
	}
};

export const Tuple = {
	of<A extends TupleOf<serialization.Message>>(...guards: TupleOf<serialization.MessageGuardTuple<A>>): TupleGuard<A> {
		return new TupleGuard(...guards);
	}
};

export type Undefined = undefined;

export class UndefinedGuard extends serialization.MessageGuardBase<Undefined> {
	constructor() {
		super();
	}

	as(subject: any, path: string = ""): Undefined {
		if (subject === undefined) {
			return subject;
		}
		throw new serialization.MessageGuardError(this, subject, path);
	}

	ts(eol: string = "\n"): string {
		return "undefined";
	}
};

export const Undefined = new UndefinedGuard();

export type Union<A extends TupleOf<serialization.Message>> = UnionOf<A>;

export class UnionGuard<A extends TupleOf<serialization.Message>> extends serialization.MessageGuardBase<Union<A>> {
	readonly guards: TupleOf<serialization.MessageGuardTuple<A>>;

	constructor(...guards: TupleOf<serialization.MessageGuardTuple<A>>) {
		super();
		this.guards = guards;
	}

	as(subject: any, path: string = ""): Union<A> {
		for (let guard of this.guards) {
			try {
				return guard.as(subject, path);
			} catch (error) {}
		}
		throw new serialization.MessageGuardError(this, subject, path);
	}

	ts(eol: string = "\n"): string {
		let lines = new globalThis.Array<string>();
		for (let guard of this.guards) {
			lines.push("\t" + guard.ts(eol + "\t"));
		}
		return lines.length === 0 ? "union<>" : "union<" + eol + lines.join("," + eol) + eol +">";
	}
};

export const Union = {
	of<A extends TupleOf<serialization.Message>>(...guards: TupleOf<serialization.MessageGuardTuple<A>>): UnionGuard<A> {
		return new UnionGuard(...guards);
	}
};
