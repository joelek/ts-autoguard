// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.

import * as autoguard from "../../";

export type array1 = string[];

export const array1 = autoguard.guards.Array.of(autoguard.guards.String);

export type array2 = string[][];

export const array2 = autoguard.guards.Array.of(autoguard.guards.Array.of(autoguard.guards.String));

export type array3 = string[][][];

export const array3 = autoguard.guards.Array.of(autoguard.guards.Array.of(autoguard.guards.Array.of(autoguard.guards.String)));

export type array4 = string[][][][];

export const array4 = autoguard.guards.Array.of(autoguard.guards.Array.of(autoguard.guards.Array.of(autoguard.guards.Array.of(autoguard.guards.String))));

export type array5 = string[][][][][];

export const array5 = autoguard.guards.Array.of(autoguard.guards.Array.of(autoguard.guards.Array.of(autoguard.guards.Array.of(autoguard.guards.Array.of(autoguard.guards.String)))));

export type intersection1 = {};

export const intersection1 = autoguard.guards.Object.of({});

export type intersection2 = {} & {};

export const intersection2 = autoguard.guards.Intersection.of(
	autoguard.guards.Object.of({}),
	autoguard.guards.Object.of({})
);

export type intersection3 = {} & {} & {};

export const intersection3 = autoguard.guards.Intersection.of(
	autoguard.guards.Object.of({}),
	autoguard.guards.Object.of({}),
	autoguard.guards.Object.of({})
);

export type intersection4 = {} & {} & {} & {};

export const intersection4 = autoguard.guards.Intersection.of(
	autoguard.guards.Object.of({}),
	autoguard.guards.Object.of({}),
	autoguard.guards.Object.of({}),
	autoguard.guards.Object.of({})
);

export type intersection5 = {} & {} & {} & {} & {};

export const intersection5 = autoguard.guards.Intersection.of(
	autoguard.guards.Object.of({}),
	autoguard.guards.Object.of({}),
	autoguard.guards.Object.of({}),
	autoguard.guards.Object.of({}),
	autoguard.guards.Object.of({})
);

export type union1 = string;

export const union1 = autoguard.guards.String;

export type union2 = string;

export const union2 = autoguard.guards.String;

export type union3 = string;

export const union3 = autoguard.guards.String;

export type union4 = string;

export const union4 = autoguard.guards.String;

export type union5 = string;

export const union5 = autoguard.guards.String;

export type preceedence1 = string[] | string;

export const preceedence1 = autoguard.guards.Union.of(
	autoguard.guards.Array.of(autoguard.guards.String),
	autoguard.guards.String
);

export type preceedence2 = string | string[];

export const preceedence2 = autoguard.guards.Union.of(
	autoguard.guards.String,
	autoguard.guards.Array.of(autoguard.guards.String)
);

export type preceedence3 = string | {
	"a": string
} & {
	"b": string
};

export const preceedence3 = autoguard.guards.Union.of(
	autoguard.guards.String,
	autoguard.guards.Intersection.of(
		autoguard.guards.Object.of({
			"a": autoguard.guards.String
		}),
		autoguard.guards.Object.of({
			"b": autoguard.guards.String
		})
	)
);

export type preceedence4 = {
	"a": string
} & {
	"b": string
} | string;

export const preceedence4 = autoguard.guards.Union.of(
	autoguard.guards.Intersection.of(
		autoguard.guards.Object.of({
			"a": autoguard.guards.String
		}),
		autoguard.guards.Object.of({
			"b": autoguard.guards.String
		})
	),
	autoguard.guards.String
);

export type empty1 = [];

export const empty1 = autoguard.guards.Tuple.of();

export type empty2 = {};

export const empty2 = autoguard.guards.Object.of({});

export type reference1 = reference2;

export const reference1 = autoguard.guards.Reference.of(() => reference2);

export type reference2 = {};

export const reference2 = autoguard.guards.Object.of({});

export namespace Autoguard {
	export type Guards = {
		"array1": array1,
		"array2": array2,
		"array3": array3,
		"array4": array4,
		"array5": array5,
		"intersection1": intersection1,
		"intersection2": intersection2,
		"intersection3": intersection3,
		"intersection4": intersection4,
		"intersection5": intersection5,
		"union1": union1,
		"union2": union2,
		"union3": union3,
		"union4": union4,
		"union5": union5,
		"preceedence1": preceedence1,
		"preceedence2": preceedence2,
		"preceedence3": preceedence3,
		"preceedence4": preceedence4,
		"empty1": empty1,
		"empty2": empty2,
		"reference1": reference1,
		"reference2": reference2
	};

	export const Guards = {
		"array1": array1,
		"array2": array2,
		"array3": array3,
		"array4": array4,
		"array5": array5,
		"intersection1": intersection1,
		"intersection2": intersection2,
		"intersection3": intersection3,
		"intersection4": intersection4,
		"intersection5": intersection5,
		"union1": union1,
		"union2": union2,
		"union3": union3,
		"union4": union4,
		"union5": union5,
		"preceedence1": preceedence1,
		"preceedence2": preceedence2,
		"preceedence3": preceedence3,
		"preceedence4": preceedence4,
		"empty1": empty1,
		"empty2": empty2,
		"reference1": reference1,
		"reference2": reference2
	};

	export type Routes = {
	};

	export const Client = (options?: Partial<{ urlPrefix: string }>): Routes => ({
	});

	export const Server = (routes: Routes, options?: Partial<{}>): autoguard.api.RequestListener => {
		let endpoints = new Array<autoguard.api.Endpoint>();
		return (request, response) => autoguard.api.route(endpoints, request, response);
	};
};
