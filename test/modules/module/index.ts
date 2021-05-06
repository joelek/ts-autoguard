// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.

import * as autoguard from "../../../";

export const ExternalType1 = autoguard.guards.String;

export type ExternalType1 = ReturnType<typeof ExternalType1["as"]>;

export const ExternalType2 = autoguard.guards.String;

export type ExternalType2 = ReturnType<typeof ExternalType2["as"]>;

export const ExternalType3 = autoguard.guards.String;

export type ExternalType3 = ReturnType<typeof ExternalType3["as"]>;

export namespace Autoguard {
	export const Guards = {
		"ExternalType1": autoguard.guards.Reference.of(() => ExternalType1),
		"ExternalType2": autoguard.guards.Reference.of(() => ExternalType2),
		"ExternalType3": autoguard.guards.Reference.of(() => ExternalType3)
	};

	export type Guards = { [A in keyof typeof Guards]: ReturnType<typeof Guards[A]["as"]>; };

	export const Requests = {};

	export type Requests = { [A in keyof typeof Requests]: ReturnType<typeof Requests[A]["as"]>; };

	export const Responses = {};

	export type Responses = { [A in keyof typeof Responses]: ReturnType<typeof Responses[A]["as"]>; };
};
