# @joelek/ts-autoguard

Interface descriptor language and code-generation tool for type-safe and robust web applications.

```
guard Object: {
	object_id: number,
	title: string
};

route getObject(): GET:/objects/<object_id:number>/ => Object;
```

Template project with working client and server now available at https://github.com/joelek/autoguard-template.

## Background

JSON is a standardized and commonly used format for which JavaScript runtimes contain built-in serialization functionality. The TypeScript return type of the deserialization function `JSON.parse()` is `any` since there is no way for the TypeScript compiler to know what the serialized data consists of. The TypeScript `any` type is flexible and unsurprisingly allows you to treat it as anything. This is both extremely useful and incredibly dangerous for the runtime safety of an application.

Type assertions are TypeScript constructs used for asserting type information that is only informally known. It is not uncommon to see JSON deserialization followed by a type assertion in code handling API communication or file IO.

```ts
const numbers = [0, 1, 2];
const serialized = JSON.stringify(numbers);
const deserialized = JSON.parse(serialized) as number[];
const sum = deserialized.reduce((sum, number) => {
	return sum + number;
}, 0);
```

The logic of the example shown above is perfectly sound but the code is prone to errors. We can change the original list of numbers to a list of strings without the TypeScript compiler noticing the error introduced. This has some major implications.

```ts
const numbers = ["0", "1", "2"];
const serialized = JSON.stringify(numbers);
const deserialized = JSON.parse(serialized) as number[];
const sum = deserialized.reduce((sum, number) => {
	return sum + number;
}, 0);
```

Since the type assertion is performed at compile-time, TypeScript still infers the type of `sum` as `number` while the runtime type has changed to `string`. The value of `sum` changes from the number 3 to the string "0012". Experienced JavaScript developers may notice the error since the error is introduced locally.

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
import { guards } from "@joelek/ts-autoguard";

const guard = guards.Array.of(guards.Number);
const deserialized = guard.as(JSON.parse(serialized));
const sum = deserialized.reduce((sum, number) => {
	return sum + number;
}, 0);
```

The type assertion has been replaced by a type guard assertion using `guard.as(...)`. The code in the example will throw an error if a broken contract is detected.

Type guards also support type checking using `guard.is(...)` for use in branching decisions and filters. Type checks will not throw errors but instead return true or false depending on the success of the check.

## Features

Autoguard is a utility and not a framework. It is unintrusive and modular in its design allowing it to be used to assist the design of your application rather than forcing your application to be designed around the utility.

### Manual type guards

Autoguard can be used to manually create type guards for your application. The `guards` module contains type guards for primitive data types as well as building blocks that can be used to construct type guards for complex types.

```ts
import { guards } from "@joelek/ts-autoguard";

const guard = guards.Array.of(
	guards.Object.of({
		id: guards.String,
		name: guards.String,
		age: guards.Number
	})
);

type guard = ReturnType<typeof guard.as>;
```

### Interface descriptor language

Autoguard defines a custom interface descriptor language (IDL) from which robust and powerful source code can be generated. An example of a schema written using the language is shown below.

```
guard Object: {
	object_id: number,
	title: string
};

route getObject(): GET:/objects/<object_id:number>/ => Object;
```

Autoguard reads schemas from `.ag` files and generates source files for integration in your application. By default, Autoguard will traverse the directories of your project and generate TypeScript source files for the `.ag` files it encounters.

```
npx autoguard
```

Schemas may contain any number of `guard` constructs. These define types and will generate type guards for runtime type assertions and type checks.

Schemas may contain any number of `table` constructs. These define lookup tables and will generate functionality for bi-directional and type-safe mapping between keys and values.

Schemas may contain any number of `route` constructs. These define API functionality and will generate fully-functional methods that invoke functionality on a remote system or process when called (RPC). Autoguard also generates server-side functionality that only requires the actual business logic in order to create fully-functional API servers.

The generated code handles runtime type-checking of requests as well as of responses. Serialization, transport and deserialization is delegated to shared functionality shipped togheter with Autoguard.

The API functionality is designed to be fully compatible with the standardized HTTP protocol. Although preferred for maximum type-safety and robustness, Autoguard does _not_ require both the client and the server to be implemented using Autoguard. The client or server may be implemented using different technologies as long as standard HTTP transport is employed.

#### Integration

The generated server module can be turned into a NodeJS web server as shown in this bare-minimum example. Autoguard lets you focus on the business logic by handling routing, deserialization, type-checking and serialization for all requests delegated to the server instance.

You can choose to implement parts of your NodeJS web server using Autoguard by inspecting the URL of the incoming requests before deciding whether to delegate them to the server instance or not.

```ts
import * as libhttp from "http";
import * as libserver from "./myschema/server";

libhttp.createServer(libserver.makeServer({
	getObject: async (request) => ({
		payload: {
			object_id: request.options().object_id,
			title: "räksmörgås"
		}
	})
}));
```

The generated client module can be used to consume data from any API honoring the contract described in the schema from which the module was created. Autoguard lets you focus on the business logic by handling deserialization, type-checking and serialization for all requests sent through the client instance.

```ts
import * as libclient from "./myschema/client";

const client = libclient.makeClient({ urlPrefix: "" });
const response = await client.getObject({
	options: {
		object_id: 1337
	}
});
const payload = await response.payload();
```

#### Guards

The following example illustrates how the `guard` construct can be used.

```
guard MyAnyType: any;

guard MyArrayOfStringType: string[];

guard MyBigIntType: bigint;

guard MyBinaryType: binary;

guard MyBooleanType: boolean;

guard MyBooleanliteralType: true;

guard MyGroupType: (any); # Used when different precedence is required.

guard MyImportedType: ./module/MyExternalType;

guard MyIntegerType: integer;

guard MyIntersectionType: {
	a_string_member: string
} & {
	another_string_member: string
};

guard MyNullType: null;

guard MyNumberType: number;

guard MyNumberLiteralType: 1337;

guard MyObjectType: {
	string_member: string,
	optional_member?: string,
	"quoted-member": string
};

guard MyRecordOfStringType: { string };

guard MyReferenceType: MyObjectType;

guard MyStringType: string;

guard MyStringLiteralType: "räksmörgås";

guard MyTupleType: [
	string,
	number
];

guard MyUndefinedType: undefined;

guard MyUnionType: string | null;
```

#### Tables

The following example illustrates how the `table` construct can be used.

```
table MyTable: {
	"CAT",
	"BIRD",
	"DOG",
	"FISH"
};
```

#### Routes

The following example illustrates how the `route` construct can be used.

```
route accessURLWithStaticPathComponent(): HEAD:/static;

route accessURLWithRequiredDynamicPathComponent(): HEAD:/<id>;

route accessURLWithOptionalDynamicPathComponent(): HEAD:/<id?>;

route accessURLWithRepeatedDynamicPathComponent(): HEAD:/<ids*>;

route accessURLWithRequiredQueryParameter(): HEAD:/ ? <{ parameter }>;

route accessURLWithOptionalQueryParameter(): HEAD:/ ? <{ parameter? }>;

route accessURLWithRepeatedQueryParameter(): HEAD:/ ? <{ parameter* }>;

route sendRequiredRequestHeader(): GET:/
	<= <{ request_header }>;

route sendOptionalRequestHeader(): GET:/
	<= <{ request_header? }>;

route sendRepeatedRequestHeader(): GET:/
	<= <{ request_header* }>;

route receiveRequiredResponseHeader(): GET:/
	=> <{ response_header }>;

route receiveOptionalResponseHeader(): GET:/
	=> <{ response_header? }>;

route receiveRepeatedResponseHeader(): GET:/
	=> <{ response_header* }>;

route receiveJSONPayload(): GET:/
	=> {
		required_in_response_payload: string,
		optional_in_response_payload?: string
	};

route sendJSONPayload(): POST:/
	<= {
		required_in_request_payload: string,
		optional_in_request_payload?: string
	};

route receiveBinaryPayload(): GET:/
	=> binary;

route sendBinaryPayload(): POST:/
	<= binary;
```

The full type language is available for the payload as well as for path components, query parameters and headers. The type of the payload defaults to binary when left unspecified while the type of path components, query parameters and headers default to plain string.

Plain strings and JSON strings differ in that JSON strings will be JSON encoded and decoded automatically whereas plain strings will not. Plain strings are commonly used in path components, query parameters and headers whereas JSON strings are normally used in JSON payloads.

NB: Path components, query parameters and headers declared with the "string" type will be handled as if the "plain" type had been declared. This compatibility behaviour will be removed in the next major release and through that bring consistency to the type language. Please declare plain strings explicitly or remove the type declaration to use the default type.

Autoguard accepts and exposes undeclared request parameters as well as undeclared request and response headers. No parsing is performed since no assumptions can be made about the content. The responsibility of parsing undeclared data lies with the user. Autoguard requires the type of all undeclared request parameters, request headers and response headers to be string or array of strings.

```
guard Object: {
	object_id: number,
	title: string
};

route objects(): POST:/<id:Object> ? <{ parameter: Object }>
	<= <{ request_header: Object }> {
		in_request_payload: Object
	}
	=> <{ response_header: Object }> {
		in_response_payload: Object
	};
```

### Serialization and deserialization

Autoguard provides a module for type-safe serialization and deserialization of messages.

```ts
import { Autoguard } from "./myschema";
import * as autoguard from "@joelek/ts-autoguard";

let serializer = new autoguard.serialization.MessageSerializer(Autoguard.Guards);
let serialized = serializer.serialize("MyType", "Hello!");
```

The serialized value may be stored on disk or transmitted through a network and can be recovered using the `.deserialize()` method.

```ts
serializer.deserialize(serialized, (type, data) => { /* ... */ });
```

## Sponsorship

The continued development of this software depends on your sponsorship. Please consider sponsoring this project if you find that the software creates value for you and your organization.

The sponsor button can be used to view the different sponsoring options. Contributions of all sizes are welcome.

Thank you for your support!

### Ethereum

Ethereum contributions can be made to address `0xf1B63d95BEfEdAf70B3623B1A4Ba0D9CE7F2fE6D`.

![](./eth.png)

## Installation

Releases follow semantic versioning and release packages are published using the GitHub platform. Use the following command to install the latest release.

```
npm install joelek/ts-autoguard#semver:^5.12
```

Use the following command to install the very latest build. The very latest build may include breaking changes and should not be used in production environments.

```
npm install joelek/ts-autoguard#master
```

NB: This project targets TypeScript 4 in strict mode.

## Roadmap

* Document extension capabilities.
* Resolve issue with imported type and local type sharing identical typenames.
* Simplify import paths before resolving references.
* Extend type guards with functionality for deep structured cloning.
* Add strict option that performs automatic JSON payload filtering.
* Modernize code to use string templates.
* Write unit tests.
* Unify MessageGuard and MessageGuardBase.
* Provide defaults for values having only a single option in RPC.
* Set content-type for uppercased file suffixes.
* Migrate functionality used in Nexus to Nexus.
* Add support for bigint and binary in API.
* Add helper guards optional primitives.

## Syntax

The interface descriptor language is formally defined as a language that shares similarities with the type language in TypeScript.

White space and line separators may occur between tokens and is considered insignificant.

```
LineSeparator = "\r\n" or "\r" or "\n"
Whitespace = "\t" or " "
TokenSeparator = Whitespace or LineSeparator
Comment = "#" (not LineSeparator)*
AsciiLetterLowercase = "a" to "z"
AsciiLetterUppercase = "A" to "Z"
AsciiLetter = AsciiLetterLowercase or AsciiLetterUppercase
Digit = "0" to "9"
DigitPositive = "1" to "9"
HexDigit = ("0" to "9") or ("a" to "f") or ("A" to "F")
PercentEncodedOctet = "%" HexDigit HexDigit
IdentifierTail = AsciiLetter or Digit or "_"
Identifier = AsciiLetter IdentifierTail*
AnyType = "any"
ArrayType = Type "[" "]"
BooleanType = "boolean"
BooleanLiteralType = "true" or "false"
GroupType = "(" Type ")"
IntegerType = "integer"
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
ReferenceType = ReferencePath? Identifier ("." Identifier)*
StringType = "string"
StringLiteralLetter = not """
StringLiteral = """ StringLiteralLetter* """
StringLiteralType = StringLiteral
TupleBodyTail = "," Type
TupleBody = Type TupleBodyTail*
TupleType = "[" TupleBody* "]"
UndefinedType = "undefined"
UnionType = Type "|" Type
BigIntType = "bigint"
BinaryType = "binary"
PrimitiveType = BigIntType or BinaryType or BooleanType or IntegerType or NumberType or StringType
SupportType = AnyType or NullType or UndefinedType;
LiteralType = BooleanLiteralType or NumberLiteralType or StringLiteralType
ComplexType = ArrayType or GroupType or IntersectionType or ObjectType or RecordType or ReferenceType or TupleType or UnionType
Type = PrimitiveType or SupportType or LiteralType or ComplexType
Guard = "guard" Identifier ":" Type ";"
PlainType = "plain"
OptionsType = PlainType or Type
OptionsKey = Identifier or StringLiteral
OptionsKeyValue = OptionsKey Quantifier? (":" OptionsType)?
OptionsBodyTail = "," OptionsKeyValue
OptionsBody = OptionsKeyValue OptionsBodyTail*
Options = "<" "{" OptionsBody* "}" ">"
StaticComponentPart = AsciiLetter or Digit or "_" or PercentEncodedOctet
StaticComponent = StaticComponentPart*
Quantifier = "*" or "?"
DynamicComponent = "<" (Identifier or StringLiteral) Quantifier? (":" OptionsType)? ">"
Component = StaticComponent or DynamicComponent
Path = "/" Component Path*
Method = Identifier
Headers = Options
Payload = Type
ParametersType = PlainType or Type
ParametersKey = Identifier or StringLiteral
ParametersKeyValue =  "<" ParametersKey Quantifier? (":" ParametersType)? ">"
ParametersBodyTail = "&" ParametersKeyValue
ParametersBody = ParametersKeyValue ParametersBodyTail*
Parameters = "?" (Headers or ParametersBody)
Request = "<=" Headers? Payload?
Response = "=>" Headers? Payload?
Alias = Identifier "(" ")" ":"
Route = "route" Alias? Method ":" Path Parameters? Request? Response? ";"
TableKeyValue = StringLiteralType (":" NumberLiteralType)?
TableBodyTail = "," TableKeyValue
TableBody = TableKeyValue TableBodyTail*
Table = "table" Identifier ":" "{" TableBody* "}" ";"
Schema = (Guard or Table or Route)*
```
