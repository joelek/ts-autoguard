# @joelek/ts-autoguard

Auto-generated unintrusive type guards for TypeScript.

## Configure

This package was developed using TypeScript v3.7.3 and may not work in earlier versions.

Globally install this package from GitHub.

```
npm install -g joelek/ts-autoguard
```

This installs the command line utility "autoguard".

## Syntax

The schema and its type language is formally defined as a regular language which shares similarities with the type language in TypeScript.

```
{
	array_of_string_type: [ string ],
	boolean_type: boolean,
	null_type: null,
	number_type: number,
	object_type: {
		string_member: string
	},
	record_of_string_type: { string },
	reference_type: object_type,
	string_type: string,
	undefined_type: undefined,
	union_of_string_and_null_type: string / null
}
```
