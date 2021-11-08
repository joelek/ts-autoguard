import * as bedrock from "./bedrock";
import * as json from "./json";
import * as guards from "../guards";

function test(name: string, cb: () => Promise<any>): void {
	cb().catch((error) => {
		console.log(name);
		console.log(String(error));
	});
}

const CODECS = [
	bedrock.CODEC,
	json.CODEC
];

for (let CODEC of CODECS) {
	test(``, async () => {
		let guard = guards.Array.of(guards.String);
		let array = guard.encode(CODEC, []);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Array.of(guards.String);
		let array = guard.encode(CODEC, ["value1"]);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Array.of(guards.String);
		let array = guard.encode(CODEC, ["value1", "value2"]);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Boolean;
		let array = guard.encode(CODEC, false);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Boolean;
		let array = guard.encode(CODEC, true);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.BooleanLiteral.of(false);
		let array = guard.encode(CODEC, false);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.BooleanLiteral.of(true);
		let array = guard.encode(CODEC, true);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Group.of(guards.String);
		let array = guard.encode(CODEC, "string");
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Intersection.of(
			guards.Object.of({
				key1: guards.String
			}),
			guards.Object.of({
				key2: guards.String
			})
		);
		let array = guard.encode(CODEC, { key1: "value1", key2: "value2" });
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Intersection.of(
			guards.Group.of(guards.Object.of({
				key1: guards.String
			})),
			guards.Object.of({
				key2: guards.String
			})
		);
		let array = guard.encode(CODEC, { key1: "value1", key2: "value2" });
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Intersection.of(
			guards.Reference.of(() => guards.Object.of({
				key1: guards.String
			})),
			guards.Object.of({
				key2: guards.String
			})
		);
		let array = guard.encode(CODEC, { key1: "value1", key2: "value2" });
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Null;
		let array = guard.encode(CODEC, null);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Number;
		let array = guard.encode(CODEC, -1);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Number;
		let array = guard.encode(CODEC, 0);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Number;
		let array = guard.encode(CODEC, 1);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.NumberLiteral.of(-1);
		let array = guard.encode(CODEC, -1);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.NumberLiteral.of(0);
		let array = guard.encode(CODEC, 0);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.NumberLiteral.of(1);
		let array = guard.encode(CODEC, 1);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Object.of({}, {});
		let array = guard.encode(CODEC, {});
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Object.of({
			key1: guards.String
		}, {});
		let array = guard.encode(CODEC, { key1: "value1" });
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Object.of({}, {
			key2: guards.String
		});
		let array = guard.encode(CODEC, {});
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Object.of({}, {
			key2: guards.String
		});
		let array = guard.encode(CODEC, { key2: undefined });
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Object.of({}, {
			key2: guards.String
		});
		let array = guard.encode(CODEC, { key2: "value2" });
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Object.of({
			key1: guards.String
		}, {
			key2: guards.String
		});
		let array = guard.encode(CODEC, { key1: "value1" });
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Object.of({
			key1: guards.String
		}, {
			key2: guards.String
		});
		let array = guard.encode(CODEC, { key1: "value1", key2: undefined });
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Object.of({
			key1: guards.String
		}, {
			key2: guards.String
		});
		let array = guard.encode(CODEC, { key1: "value1", key2: "value2" });
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Object.of({
			key1: guards.String,
			key2: guards.String
		}, {});
		let array = guard.encode(CODEC, { key2: "value2", key1: "value1" });
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Reference.of(() => guards.String);
		let array = guard.encode(CODEC, "string");
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Record.of(guards.String);
		let array = guard.encode(CODEC, {});
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Record.of(guards.String);
		let array = guard.encode(CODEC, { key1: "value1" });
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Record.of(guards.String);
		let array = guard.encode(CODEC, { key1: "value1", key2: "value2" });
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.String;
		let array = guard.encode(CODEC, "string");
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.StringLiteral.of("string");
		let array = guard.encode(CODEC, "string");
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Tuple.of();
		let array = guard.encode(CODEC, []);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Tuple.of(guards.String);
		let array = guard.encode(CODEC, ["string"]);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Tuple.of(guards.String, guards.Null);
		let array = guard.encode(CODEC, ["string", null]);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Union.of(guards.Number);
		let array = guard.encode(CODEC, 0);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Union.of(guards.Number, guards.Null);
		let array = guard.encode(CODEC, 0);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});

	test(``, async () => {
		let guard = guards.Union.of(guards.Number, guards.Null);
		let array = guard.encode(CODEC, null);
		let value = guard.decode(CODEC, array);
		guard.as(value);
	});
}
