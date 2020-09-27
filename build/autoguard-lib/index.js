"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = exports.tokenization = exports.serialization = exports.language = exports.guards = void 0;
const guards = require("./guards");
exports.guards = guards;
const language = require("./language");
exports.language = language;
const serialization = require("./serialization");
exports.serialization = serialization;
const tokenization = require("./tokenization");
exports.tokenization = tokenization;
function transform(string, options) {
    let tokens = Array.of(...tokenization.tokenize(string)).filter((token) => {
        return token.family !== "WHITESPACE";
    });
    let schema = language.Schema.parse(tokens);
    return schema.generateModule(options);
}
exports.transform = transform;
