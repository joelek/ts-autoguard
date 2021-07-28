// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.

import * as autoguard from "../../../dist/lib-shared";

export namespace Autoguard {
	export const Guards = {};

	export type Guards = { [A in keyof typeof Guards]: ReturnType<typeof Guards[A]["as"]>; };

	export const Requests = {
		"plain": autoguard.guards.Object.of({
			"options": autoguard.guards.Intersection.of(
				autoguard.guards.Object.of({
					"ca": autoguard.guards.String,
					"cb": autoguard.guards.Union.of(
						autoguard.guards.String,
						autoguard.guards.Undefined
					),
					"cc": autoguard.guards.Union.of(
						autoguard.guards.Array.of(autoguard.guards.String),
						autoguard.guards.Undefined
					),
					"pa": autoguard.guards.String,
					"pb": autoguard.guards.Union.of(
						autoguard.guards.String,
						autoguard.guards.Undefined
					),
					"pc": autoguard.guards.Union.of(
						autoguard.guards.Array.of(autoguard.guards.String),
						autoguard.guards.Undefined
					)
				}),
				autoguard.api.Options
			),
			"headers": autoguard.guards.Intersection.of(
				autoguard.guards.Object.of({
					"ha": autoguard.guards.String,
					"hb": autoguard.guards.Union.of(
						autoguard.guards.String,
						autoguard.guards.Undefined
					),
					"hc": autoguard.guards.Union.of(
						autoguard.guards.Array.of(autoguard.guards.String),
						autoguard.guards.Undefined
					)
				}),
				autoguard.api.Headers
			),
			"payload": autoguard.guards.Union.of(
				autoguard.api.Binary,
				autoguard.guards.Undefined
			)
		}),
		"json": autoguard.guards.Object.of({
			"options": autoguard.guards.Intersection.of(
				autoguard.guards.Object.of({
					"ca": autoguard.guards.Number,
					"cb": autoguard.guards.Union.of(
						autoguard.guards.Number,
						autoguard.guards.Undefined
					),
					"cc": autoguard.guards.Union.of(
						autoguard.guards.Array.of(autoguard.guards.Number),
						autoguard.guards.Undefined
					),
					"pa": autoguard.guards.Number,
					"pb": autoguard.guards.Union.of(
						autoguard.guards.Number,
						autoguard.guards.Undefined
					),
					"pc": autoguard.guards.Union.of(
						autoguard.guards.Array.of(autoguard.guards.Number),
						autoguard.guards.Undefined
					)
				}),
				autoguard.api.Options
			),
			"headers": autoguard.guards.Intersection.of(
				autoguard.guards.Object.of({
					"ha": autoguard.guards.Number,
					"hb": autoguard.guards.Union.of(
						autoguard.guards.Number,
						autoguard.guards.Undefined
					),
					"hc": autoguard.guards.Union.of(
						autoguard.guards.Array.of(autoguard.guards.Number),
						autoguard.guards.Undefined
					)
				}),
				autoguard.api.Headers
			),
			"payload": autoguard.guards.Union.of(
				autoguard.api.Binary,
				autoguard.guards.Undefined
			)
		})
	};

	export type Requests = { [A in keyof typeof Requests]: ReturnType<typeof Requests[A]["as"]>; };

	export const Responses = {
		"plain": autoguard.guards.Object.of({
			"status": autoguard.guards.Union.of(
				autoguard.guards.Number,
				autoguard.guards.Undefined
			),
			"headers": autoguard.guards.Intersection.of(
				autoguard.guards.Object.of({
					"ha": autoguard.guards.String,
					"hb": autoguard.guards.Union.of(
						autoguard.guards.String,
						autoguard.guards.Undefined
					),
					"hc": autoguard.guards.Union.of(
						autoguard.guards.Array.of(autoguard.guards.String),
						autoguard.guards.Undefined
					)
				}),
				autoguard.api.Headers
			),
			"payload": autoguard.guards.Union.of(
				autoguard.api.Binary,
				autoguard.guards.Undefined
			)
		}),
		"json": autoguard.guards.Object.of({
			"status": autoguard.guards.Union.of(
				autoguard.guards.Number,
				autoguard.guards.Undefined
			),
			"headers": autoguard.guards.Intersection.of(
				autoguard.guards.Object.of({
					"ha": autoguard.guards.Number,
					"hb": autoguard.guards.Union.of(
						autoguard.guards.Number,
						autoguard.guards.Undefined
					),
					"hc": autoguard.guards.Union.of(
						autoguard.guards.Array.of(autoguard.guards.Number),
						autoguard.guards.Undefined
					)
				}),
				autoguard.api.Headers
			),
			"payload": autoguard.guards.Union.of(
				autoguard.api.Binary,
				autoguard.guards.Undefined
			)
		})
	};

	export type Responses = { [A in keyof typeof Responses]: ReturnType<typeof Responses[A]["as"]>; };
};
