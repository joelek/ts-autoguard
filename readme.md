# @joelek/ts-autoguard

Auto-generated unintrusive type guards for TypeScript.

## Features

### Code generation

Autoguard generates TypeScript type definitions and type guards from schema definitions. Autoguard can read schema definitions from files and from arguments passed directly to the command line utility.

```
npx autoguard myschema.ag
npx autoguard "{ MyType: string }"
```

The two commands are identical provided that the schema definition `{ MyType: string }` was saved to the file "myschema.ag". If you omit the command entirely, Autoguard will search your project for `.ag` files and generate the corresponding `.ts` files.

Autoguard generates and exports type definitions as well as a type guards for the types defined in the schema definition.

```ts
export type MyType = string;

export const MyType = {
	as(subject: any, path: string = ""): MyType {
		return ((subject, path) => {
			if ((subject != null) && (subject.constructor === String)) {
				return subject;
			}
			throw "Type guard \"String\" failed at \"" + path + "\"!";
		})(subject, path);
	},
	is(subject: any): subject is MyType {
		try {
			MyType.as(subject);
		} catch (error) {
			return false;
		}
		return true;
	}
};
```

Type definitions can be used to annotate TypeScript code and will disappear when transpiled to JavaScript.

Type guards can be used to check whether certain values are type compatible with user-defined types using `MyType.is(...)`. Type guards can even be used to assert type compatibility using `MyType.as(...)`.

Type guards do not disappear when transpiled to JavaScript as they are intended as runtime guards for values where type information only is informally known. This often occurs when reading files or when communicating through APIs.

The schema definition below shows all supported constructs.

```
{
	MyAnyType: any,
	MyArrayOfStringType: string[],
	MyBooleanType: boolean,
	MyIntersectionType: ( @MyObjectType & { another_string_member: string } )
	MyNullType: null,
	MyNumberType: number,
	MyNumberLiteralType: 1337,
	MyObjectType: {
		string_member: string
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
ObjectKeyValue = WhiteSpace Identifier WhiteSpace ":" WhiteSpace Type WhiteSpace
ObjectBodyTail = WhiteSpace "," WhiteSpace ObjectKeyValue WhiteSpace
ObjectBody = WhiteSpace ObjectKeyValue WhiteSpace ObjectBodyTail* WhiteSpace
ObjectType = WhiteSpace "{" WhiteSpace ObjectBody* WhiteSpace "}" WhiteSpaces
RecordType = WhiteSpace "{" WhiteSpace Type WhiteSpace "}" WhiteSpace
ReferenceType = WhiteSpace "@" Identifier WhiteSpace
StringType = WhiteSpace "string" WhiteSpace
StringLiteralLetter = AsciiLetter or Digit or "_" or "-"
StringLiteralType = WhiteSpace """ StringLiteralLetter* """ WhiteSpace
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
