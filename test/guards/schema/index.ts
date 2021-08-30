// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.

import * as autoguard from "../../../dist/lib-shared";

export const MyAnyType: autoguard.serialization.MessageGuard<MyAnyType> = autoguard.guards.Any;

export type MyAnyType = autoguard.guards.Any;

export const MyArrayOfStringType: autoguard.serialization.MessageGuard<MyArrayOfStringType> = autoguard.guards.Array.of(autoguard.guards.String);

export type MyArrayOfStringType = autoguard.guards.Array<autoguard.guards.String>;

export const MyBooleanType: autoguard.serialization.MessageGuard<MyBooleanType> = autoguard.guards.Boolean;

export type MyBooleanType = autoguard.guards.Boolean;

export const MyBooleanliteralType: autoguard.serialization.MessageGuard<MyBooleanliteralType> = autoguard.guards.BooleanLiteral.of(true);

export type MyBooleanliteralType = autoguard.guards.BooleanLiteral<true>;

export const MyGroupType: autoguard.serialization.MessageGuard<MyGroupType> = autoguard.guards.Group.of(autoguard.guards.Any);

export type MyGroupType = autoguard.guards.Group<autoguard.guards.Any>;

export const MyIntersectionType: autoguard.serialization.MessageGuard<MyIntersectionType> = autoguard.guards.Intersection.of(
	autoguard.guards.Object.of({
		"a_string_member": autoguard.guards.String
	}, {}),
	autoguard.guards.Object.of({
		"another_string_member": autoguard.guards.String
	}, {})
);

export type MyIntersectionType = autoguard.guards.Intersection<[
	autoguard.guards.Object<{
		"a_string_member": autoguard.guards.String
	}, {}>,
	autoguard.guards.Object<{
		"another_string_member": autoguard.guards.String
	}, {}>
]>;

export const MyNullType: autoguard.serialization.MessageGuard<MyNullType> = autoguard.guards.Null;

export type MyNullType = autoguard.guards.Null;

export const MyNumberType: autoguard.serialization.MessageGuard<MyNumberType> = autoguard.guards.Number;

export type MyNumberType = autoguard.guards.Number;

export const MyNumberLiteralType: autoguard.serialization.MessageGuard<MyNumberLiteralType> = autoguard.guards.NumberLiteral.of(1337);

export type MyNumberLiteralType = autoguard.guards.NumberLiteral<1337>;

export const MyObjectType: autoguard.serialization.MessageGuard<MyObjectType> = autoguard.guards.Object.of({
	"string_member": autoguard.guards.String,
	"quoted-member": autoguard.guards.String
}, {
	"optional_member": autoguard.guards.String
});

export type MyObjectType = autoguard.guards.Object<{
	"string_member": autoguard.guards.String,
	"quoted-member": autoguard.guards.String
}, {
	"optional_member": autoguard.guards.String
}>;

export const MyRecordOfStringType: autoguard.serialization.MessageGuard<MyRecordOfStringType> = autoguard.guards.Record.of(autoguard.guards.String);

export type MyRecordOfStringType = autoguard.guards.Record<autoguard.guards.String>;

export const MyReferenceType: autoguard.serialization.MessageGuard<MyReferenceType> = autoguard.guards.Reference.of(() => MyObjectType);

export type MyReferenceType = autoguard.guards.Reference<MyObjectType>;

export const MyStringType: autoguard.serialization.MessageGuard<MyStringType> = autoguard.guards.String;

export type MyStringType = autoguard.guards.String;

export const MyStringLiteralType: autoguard.serialization.MessageGuard<MyStringLiteralType> = autoguard.guards.StringLiteral.of("räksmörgås");

export type MyStringLiteralType = autoguard.guards.StringLiteral<"räksmörgås">;

export const MyTupleType: autoguard.serialization.MessageGuard<MyTupleType> = autoguard.guards.Tuple.of(
	autoguard.guards.String,
	autoguard.guards.Number
);

export type MyTupleType = autoguard.guards.Tuple<[
	autoguard.guards.String,
	autoguard.guards.Number
]>;

export const MyUndefinedType: autoguard.serialization.MessageGuard<MyUndefinedType> = autoguard.guards.Undefined;

export type MyUndefinedType = autoguard.guards.Undefined;

export const MyUnionType: autoguard.serialization.MessageGuard<MyUnionType> = autoguard.guards.Union.of(
	autoguard.guards.String,
	autoguard.guards.Null
);

export type MyUnionType = autoguard.guards.Union<[
	autoguard.guards.String,
	autoguard.guards.Null
]>;

export namespace Autoguard {
	export const Guards = {
		"MyAnyType": autoguard.guards.Reference.of(() => MyAnyType),
		"MyArrayOfStringType": autoguard.guards.Reference.of(() => MyArrayOfStringType),
		"MyBooleanType": autoguard.guards.Reference.of(() => MyBooleanType),
		"MyBooleanliteralType": autoguard.guards.Reference.of(() => MyBooleanliteralType),
		"MyGroupType": autoguard.guards.Reference.of(() => MyGroupType),
		"MyIntersectionType": autoguard.guards.Reference.of(() => MyIntersectionType),
		"MyNullType": autoguard.guards.Reference.of(() => MyNullType),
		"MyNumberType": autoguard.guards.Reference.of(() => MyNumberType),
		"MyNumberLiteralType": autoguard.guards.Reference.of(() => MyNumberLiteralType),
		"MyObjectType": autoguard.guards.Reference.of(() => MyObjectType),
		"MyRecordOfStringType": autoguard.guards.Reference.of(() => MyRecordOfStringType),
		"MyReferenceType": autoguard.guards.Reference.of(() => MyReferenceType),
		"MyStringType": autoguard.guards.Reference.of(() => MyStringType),
		"MyStringLiteralType": autoguard.guards.Reference.of(() => MyStringLiteralType),
		"MyTupleType": autoguard.guards.Reference.of(() => MyTupleType),
		"MyUndefinedType": autoguard.guards.Reference.of(() => MyUndefinedType),
		"MyUnionType": autoguard.guards.Reference.of(() => MyUnionType)
	};

	export type Guards = { [A in keyof typeof Guards]: ReturnType<typeof Guards[A]["as"]>; };

	export const Requests = {};

	export type Requests = { [A in keyof typeof Requests]: ReturnType<typeof Requests[A]["as"]>; };

	export const Responses = {};

	export type Responses = { [A in keyof typeof Responses]: ReturnType<typeof Responses[A]["as"]>; };
};
