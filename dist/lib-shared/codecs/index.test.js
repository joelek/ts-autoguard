"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bedrock = require("./bedrock");
const json = require("./json");
const guards = require("../guards");
function test(name, cb) {
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
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Array.of(guards.String);
        let array = guard.encode(CODEC, []);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Array.of(guards.String);
        let array = guard.encode(CODEC, ["value1"]);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Array.of(guards.String);
        let array = guard.encode(CODEC, ["value1", "value2"]);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Boolean;
        let array = guard.encode(CODEC, false);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Boolean;
        let array = guard.encode(CODEC, true);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.BooleanLiteral.of(false);
        let array = guard.encode(CODEC, false);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.BooleanLiteral.of(true);
        let array = guard.encode(CODEC, true);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Group.of(guards.String);
        let array = guard.encode(CODEC, "string");
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Intersection.of(guards.Object.of({
            key1: guards.String
        }), guards.Object.of({
            key2: guards.String
        }));
        let array = guard.encode(CODEC, { key1: "value1", key2: "value2" });
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Intersection.of(guards.Group.of(guards.Object.of({
            key1: guards.String
        })), guards.Object.of({
            key2: guards.String
        }));
        let array = guard.encode(CODEC, { key1: "value1", key2: "value2" });
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Intersection.of(guards.Reference.of(() => guards.Object.of({
            key1: guards.String
        })), guards.Object.of({
            key2: guards.String
        }));
        let array = guard.encode(CODEC, { key1: "value1", key2: "value2" });
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Null;
        let array = guard.encode(CODEC, null);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Number;
        let array = guard.encode(CODEC, -1);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Number;
        let array = guard.encode(CODEC, 0);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Number;
        let array = guard.encode(CODEC, 1);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.NumberLiteral.of(-1);
        let array = guard.encode(CODEC, -1);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.NumberLiteral.of(0);
        let array = guard.encode(CODEC, 0);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.NumberLiteral.of(1);
        let array = guard.encode(CODEC, 1);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Object.of({}, {});
        let array = guard.encode(CODEC, {});
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Object.of({
            key1: guards.String
        }, {});
        let array = guard.encode(CODEC, { key1: "value1" });
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Object.of({}, {
            key2: guards.String
        });
        let array = guard.encode(CODEC, {});
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Object.of({}, {
            key2: guards.String
        });
        let array = guard.encode(CODEC, { key2: undefined });
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Object.of({}, {
            key2: guards.String
        });
        let array = guard.encode(CODEC, { key2: "value2" });
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Object.of({
            key1: guards.String
        }, {
            key2: guards.String
        });
        let array = guard.encode(CODEC, { key1: "value1" });
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Object.of({
            key1: guards.String
        }, {
            key2: guards.String
        });
        let array = guard.encode(CODEC, { key1: "value1", key2: undefined });
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Object.of({
            key1: guards.String
        }, {
            key2: guards.String
        });
        let array = guard.encode(CODEC, { key1: "value1", key2: "value2" });
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Object.of({
            key1: guards.String,
            key2: guards.String
        }, {});
        let array = guard.encode(CODEC, { key2: "value2", key1: "value1" });
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Reference.of(() => guards.String);
        let array = guard.encode(CODEC, "string");
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Record.of(guards.String);
        let array = guard.encode(CODEC, {});
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Record.of(guards.String);
        let array = guard.encode(CODEC, { key1: "value1" });
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Record.of(guards.String);
        let array = guard.encode(CODEC, { key1: "value1", key2: "value2" });
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.String;
        let array = guard.encode(CODEC, "string");
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.StringLiteral.of("string");
        let array = guard.encode(CODEC, "string");
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Tuple.of();
        let array = guard.encode(CODEC, []);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Tuple.of(guards.String);
        let array = guard.encode(CODEC, ["string"]);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Tuple.of(guards.String, guards.Null);
        let array = guard.encode(CODEC, ["string", null]);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Union.of(guards.Number);
        let array = guard.encode(CODEC, 0);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Union.of(guards.Number, guards.Null);
        let array = guard.encode(CODEC, 0);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
    test(``, () => __awaiter(void 0, void 0, void 0, function* () {
        let guard = guards.Union.of(guards.Number, guards.Null);
        let array = guard.encode(CODEC, null);
        let value = guard.decode(CODEC, array);
        guard.as(value);
    }));
}
