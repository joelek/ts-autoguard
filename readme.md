# @joelek/ts-autoguard

Auto-generated unintrusive type guards for TypeScript.

## Motivation

JSON is a standardized and commonly used format for which JavaScript runtimes contain built-in serialization functionality. The TypeScript return type of the deserialization function `JSON.parse()` is `any` since there is no way for the TypeScript compiler to know what the serialized data consists of. The TypeScript `any` type is flexible and allows you to treat it as pretty much anything. This is both extremely useful and incredibly dangerous for the runtime safety of an application.

Type assertions are TypeScript constructs used for asserting type information that is only informally known. It is not uncommon to see JSON deserialization followed by a type assertion in code handling API communication or file IO.

```ts
const numbers = [ 0, 1, 2 ];
const serialized = JSON.stringify(numbers);
const deserialized = JSON.parse(serialized) as number[];
const sum = deserialized.reduce((sum, number) => {
	return sum + number;
}, 0);
```

The logic of the example shown above is perfectly sound but the code is prone to errors. We can change the original list of numbers to a list of strings without the TypeScript compiler noticing the error introduced. This has some major implications.

```ts
const numbers = [ "0", "1", "2" ];
const serialized = JSON.stringify(numbers);
const deserialized = JSON.parse(serialized) as number[];
const sum = deserialized.reduce((sum, number) => {
	return sum + number;
}, 0);
```

Since the type assertion is performed at compile-time, TypeScript still infers the type of sum as `number` while the runtime type has changed to `string`. The sum changes from the number 3 to the string "0012". Experienced JavaScript developers may notice the error since the error is introduced locally.

A real-world example will most likely consist of serialization and deserialization occuring in separate applications, often executing on two different devices connected through a network.

```ts
const deserialized = JSON.parse(serialized) as number[];
const sum = deserialized.reduce((sum, number) => {
	return sum + number;
}, 0);
```

The correctness of the consuming application depends on how well the contract established between it and the producing application is uphold. Unfortunately, mistakes happen and contracts may be broken.

Type assertions provide no automatic warning mechanisms and broken contracts will in the best case be noticed as strange runtime behaviours in the development environment of the consuming application.

It is not uncommon for the producing application to be maintained by an entirely different organization. In that case, strange runtime behaviours arising from broken contracts may occur in the production environment of the consuming application. Since errors have a tendency to propagate, the consequences may be severe!

Type guards are intended to prevent from the consequences of broken contracts by embedding runtime assertions into JavaScript code. This guarantees that the consuming application executes with correct type information as the developer intended.

```ts
import { guards as autoguard } from "@joelek/ts-autoguard";

const guard = autoguard.Array.of(autoguard.Number);
const deserialized = guard.as(JSON.parse(serialized));
const sum = deserialized.reduce((sum, number) => {
	return sum + number;
}, 0);
```

The type assertion has been replaced by a type guard assertion using `guard.as(...)`. The code in the example will throw an error if a broken contract is detected.

Type guards also support checking using `guard.is(...)` for use in branching decisions. Type checks will not throw errors but instead return true or false depending on the success of the check.

## Features

### Type guards

Autoguard can be used to manually create type guards for your data.

```ts
import { guards as autoguard } from "@joelek/ts-autoguard";

const guard = autoguard.Array.of(autoguard.Object.of({
	id: autoguard.String,
	name: autoguard.String,
	age: autoguard.Number
}));
```

### Code generation

Autoguard can generate TypeScript type definitions and type guards from schema definitions. Type definitions can be used to annotate TypeScript code and will disappear when transpiled to JavaScript.

A schema definition may look like in the following example.

```ts
{
	MyArrayOfStringType: string[]
}
```

Autoguard reads schema definitions from `.ag` files and generates the corresponding `.ts` files. By default, Autoguard will traverse your project and generate a standalone source file for each `.ag` file it encounters.

```
npx autoguard
```

The schema definition shown in the previous example will generate the following module. This module is quite verbose but there are no runtime dependencies.

```ts
export type MyArrayOfStringType = string[];

export const MyArrayOfStringType = {
	as(subject: any, path: string = ""): MyArrayOfStringType {
		return ((subject, path) => {
			if ((subject != null) && (subject.constructor === globalThis.Array)) {
				for (let i = 0; i < subject.length; i++) {
					((subject, path) => {
						if ((subject != null) && (subject.constructor === globalThis.String)) {
							return subject as string;
						}
						throw "Expected a string at " + path + "!";
					})(subject[i], path + "[" + i + "]");
				}
				return subject;
			}
			throw "Expected an array at " + path + "!";
		})(subject, path);
	},
	is(subject: any): subject is MyArrayOfStringType {
		try {
			this.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	}
};
```

Autoguard can generate significantly less verbose modules with the addition of a runtime dependency.

```
npx autoguard --standalone=false
```

```ts
import { guards as autoguard } from "@joelek/ts-autoguard";

export type MyArrayOfStringType = string[];
export const MyArrayOfStringType = autoguard.Array.of(autoguard.String);
```

The schema definition below shows all constructs supported by Autoguard.

```ts
{
	MyAnyType: any,
	MyArrayOfStringType: string[],
	MyBooleanType: boolean,
	MyIntersectionType: ( { a_string_member: string } & { another_string_member: string } ),
	MyNullType: null,
	MyNumberType: number,
	MyNumberLiteralType: 1337,
	MyObjectType: {
		string_member: string,
		optional_member?: string,
		"member-with-dashes": string
	},
	MyRecordOfStringType: { string },
	MyReferenceType: @MyObjectType,
	MyStringType: string,
	MyStringLiteralType: "literal",
	MyTupleType: [ string, number ],
	MyUndefinedType: undefined,
	MyUnionType: ( string | null )
}
```

### Serialization and deserialization

Autoguard provides components for type-safe serialization and deserialization of messages.

```ts
import { Autoguard } from "./myschema";
import * as autoguard from "@joelek/ts-autoguard";

let serializer = new autoguard.serialization.MessageSerializer<Autoguard>(Autoguard);
let serialized = serializer.serialize("MyType", "Hello!");
```

The serialized value may be stored on disk or transmitted through a network and can be recovered using the `.deserialize()` method.

```ts
serializer.deserialize(serialized, (type, data) => {

});
```

## Configure

Autoguard releases follow semantic versioning and release packages are published using the GitHub platform. Use the following command to install the latest release.

```
npm install joelek/ts-autoguard#semver:^4
```

NB: Autoguard currently targets TypeScript 4. Some features may not be supported for older TypeScript versions.

## Syntax

The type language is formally defined as a regular language which shares similarities with the type language in TypeScript.

```
WhiteSpaceLetter = "\n" or "\t" or "\r" or " "
WhiteSpace = WhiteSpaceLetter*
AsciiLetterLowercase = "a" to "z"
AsciiLetterUppercase = "A" to "Z"
AsciiLetter = AsciiLetterLowercase or AsciiLetterUppercase
Digit = "0" to "9"
DigitPositive = "1" to "9"
IdentifierTail = AsciiLetter or Digit or "_"
Identifier = AsciiLetter IdentifierTail*
AnyType = WhiteSpace "any" WhiteSpace
ArrayType = WhiteSpace Type WhiteSpace "[" WhiteSpace "]" WhiteSpace
BooleanType = WhiteSpace "boolean" WhiteSpace
IntersectionBodyTail = WhiteSpace "&" WhiteSpace Type WhiteSpace
IntersectionType = WhiteSpace "(" WhiteSpace Type WhiteSpace IntersectionBodyTail* WhiteSpace ")" WhiteSpace
NullType = WhiteSpace "null" WhiteSpace
NumberType = WhiteSpace "number" WhiteSpace
NumberLiteralType = WhiteSpace Digit or (DigitPositive Digit*) WhiteSpace
ObjectKey = Identifier or StringLiteral
ObjectKeyValue = WhiteSpace ObjectKey WhiteSpace "?"? WhiteSpace ":" WhiteSpace Type WhiteSpace
ObjectBodyTail = WhiteSpace "," WhiteSpace ObjectKeyValue WhiteSpace
ObjectBody = WhiteSpace ObjectKeyValue WhiteSpace ObjectBodyTail* WhiteSpace
ObjectType = WhiteSpace "{" WhiteSpace ObjectBody* WhiteSpace "}" WhiteSpace
RecordType = WhiteSpace "{" WhiteSpace Type WhiteSpace "}" WhiteSpace
ReferenceType = WhiteSpace "@" Identifier WhiteSpace
StringType = WhiteSpace "string" WhiteSpace
StringLiteralLetter = not """
StringLiteral = """ StringLiteralLetter* """
StringLiteralType = WhiteSpace StringLiteral WhiteSpace
TupleBodyTail = WhiteSpace "," WhiteSpace Type WhiteSpace
TupleBody = WhiteSpace Type WhiteSpace TupleBodyTail* WhiteSpace
TupleType = WhiteSpace "[" WhiteSpace TupleBody* WhiteSpace "]" WhiteSpace
UndefinedType = WhiteSpace "undefined" WhiteSpace
UnionBodyTail = WhiteSpace "|" WhiteSpace Type WhiteSpace
UnionType = WhiteSpace "(" WhiteSpace Type WhiteSpace UnionBodyTail* WhiteSpace ")" WhiteSpace
PrimitiveType = AnyType or BooleanType or NullType or NumberType or StringType or UndefinedType
LiteralType = NumberLiteralType or StringLiteralType
ComplexType = ArrayType or IntersectionType or ObjectType or RecordType or ReferenceType or TupleType or UnionType
Type = PrimitiveType or LiteralType or ComplexType
SchemaDefinition = ObjectType
```
