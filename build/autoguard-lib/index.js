"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = exports.serialization = exports.language = exports.guards = void 0;
const guards = require("./guards");
exports.guards = guards;
const language = require("./language");
exports.language = language;
const serialization = require("./serialization");
exports.serialization = serialization;
function transform(string, options) {
    return language.Schema.parse(string).generateModule(options);
}
exports.transform = transform;
