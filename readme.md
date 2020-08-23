# @joelek/ts-autoguard

Auto-generated unintrusive type guards for TypeScript.

## Features

### Code generation

Autoguard generates TypeScript type definitions and type guards from schema definitions. A schema definition may look like in the following example.

```ts
{
	MyArrayOfStringType: string[]
}
```

Autoguard reads schema definitions from `.ag` files and generates the corresponding `.ts` files. By default, Autoguard will traverse your project and generate a standalone source file for each `.ag` file it encounters.

```
npx autoguard
```

The schema definition shown in the previous example would generate the following TypeScript code.

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
						throw "Type guard \"String\" failed at \"" + path + "\"!";
					})(subject[i], path + "[" + i + "]");
				}
				return subject;
			}
			throw "Type guard \"Array\" failed at \"" + path + "\"!";
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

Type definitions can be used to annotate TypeScript code and will disappear when transpiled to JavaScript.

Type guards can be used to check whether a certain value is type compatible with the corresponding type definition using `MyType.is(...)`. Type guards can even be used to assert type compatibility using `MyType.as(...)`.

Type guards do not disappear when transpiled to JavaScript as they are intended as runtime guards for values where type information only is informally known. This often occurs when reading files or when communicating through APIs.

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

Install this package from GitHub.

```
npm install joelek/ts-autoguard
```

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
StringLiteralLetter = AsciiLetter or Digit or "_" or "-"
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
