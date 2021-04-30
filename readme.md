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
guard MyArrayOfStringType: string[]
```

Autoguard reads schema definitions from `.ag` files and generates the corresponding `.ts` files. By default, Autoguard will traverse your project and generate a source file for each `.ag` file it encounters.

```
npx autoguard
```

The schema definition shown in the previous example will generate the following module.

```ts
import * as autoguard from "@joelek/ts-autoguard";

export type MyArrayOfStringType = string[];

export const MyArrayOfStringType = autoguard.guards.Array.of(autoguard.guards.String);

export namespace Autoguard {
	export type Guards = {
		"MyArrayOfStringType": MyArrayOfStringType
	};

	export const Guards = {
		"MyArrayOfStringType": MyArrayOfStringType
	};
};
```

The schema definition below shows all constructs supported by Autoguard.

```ts
guard MyAnyType: any
guard MyArrayOfStringType: string[]
guard MyBooleanType: boolean
guard MyBooleanliteralType: true
guard MyGroupType: (any)
guard MyImportedType: ./module/MyExternalType
guard MyIntersectionType: {
	a_string_member: string
} & {
	another_string_member: string
}
guard MyNullType: null
guard MyNumberType: number
guard MyNumberLiteralType: 1337
guard MyObjectType: {
	string_member: string,
	optional_member?: string,
	"quoted-member": string
}
guard MyRecordOfStringType: { string }
guard MyReferenceType: MyObjectType
guard MyStringType: string
guard MyStringLiteralType: "räksmörgås"
guard MyTupleType: [
	string,
	number
]
guard MyUndefinedType: undefined
guard MyUnionType: string | null
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

Releases follow semantic versioning and release packages are published using the GitHub platform. Use the following command to install the latest release.

```
npm install joelek/ts-autoguard#semver:^4
```

Use the following command to install the very latest build. The very latest build may include breaking changes and should not be used in production environments.

```
npm install joelek/ts-autoguard#master
```

NB: This project targets TypeScript 4 in strict mode.

## Syntax

The type language is formally defined as a language that shares similarities with the type language in TypeScript. White space may occur between non-terminal tokens and is considered insignificant.

```
AsciiLetterLowercase = "a" to "z"
AsciiLetterUppercase = "A" to "Z"
AsciiLetter = AsciiLetterLowercase or AsciiLetterUppercase
Digit = "0" to "9"
DigitPositive = "1" to "9"
IdentifierTail = AsciiLetter or Digit or "_"
Identifier = AsciiLetter IdentifierTail*
AnyType = "any"
ArrayType = Type "[" "]"
BooleanType = "boolean"
BooleanLiteralType = "true" or "false"
GroupType = "(" Type ")"
IntersectionType = Type "&" Type
NullType = "null"
NumberType = "number"
NumberLiteralType = Digit or (DigitPositive Digit*)
ObjectKey = Identifier or StringLiteral
ObjectKeyValue = ObjectKey "?"? ":" Type
ObjectBodyTail = "," ObjectKeyValue
ObjectBody = ObjectKeyValue ObjectBodyTail*
ObjectType = "{" ObjectBody* "}"
RecordType = "{" Type "}"
ReferencePathComponent = "." or ".." or Identifier
ReferencePath = ReferencePathComponent "/" ReferencePath*
ReferenceType = ReferencePath? Identifier
StringType = "string"
StringLiteralLetter = not """
StringLiteral = """ StringLiteralLetter* """
StringLiteralType = StringLiteral
TupleBodyTail = "," Type
TupleBody = Type TupleBodyTail*
TupleType = "[" TupleBody* "]"
UndefinedType = "undefined"
UnionType = Type "|" Type
PrimitiveType = AnyType or BooleanType or NullType or NumberType or StringType or UndefinedType
LiteralType = BooleanLiteralType or NumberLiteralType or StringLiteralType
ComplexType = ArrayType or GroupType or IntersectionType or ObjectType or RecordType or ReferenceType or TupleType or UnionType
Type = PrimitiveType or LiteralType or ComplexType
Guard = "guard" Identifier ":" Type
OptionsType = BooleanType | NumberType | StringType
OptionsKey = Identifier
OptionsKeyValue = OptionsKey "?"? ":" OptionsType
OptionsBodyTail = "," OptionsKeyValue
OptionsBody = OptionsKeyValue OptionsBodyTail*
Options = "<" "{" OptionsBody* "}" ">"
StaticComponent = Identifier
DynamicComponent = "<" Identifier ":" OptionsType ">"
Component = StaticComponent or DynamicComponent
Path = "/" Component Path*
Method = Identifier
Headers = Options
Payload = Type or "binary"
Parameters = "?" Options
Request = "<=" Headers? Payload?
Response = "=>" Headers? Payload?
Route = "route" Method ":" Path Parameters? Request? Response?
Schema = (Guard or Route)*
```
