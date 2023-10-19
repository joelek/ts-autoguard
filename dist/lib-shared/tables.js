"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValueToKeyMap = exports.createKeyToValueMap = exports.createValues = exports.createKeys = void 0;
function createKeys(entries) {
    return entries.map(({ key }) => key);
}
exports.createKeys = createKeys;
;
function createValues(entries) {
    return entries.map(({ value }) => value);
}
exports.createValues = createValues;
;
function createKeyToValueMap(entries) {
    return entries.reduce((record, { key, value }) => (Object.assign(Object.assign({}, record), { [key]: value })), {});
}
exports.createKeyToValueMap = createKeyToValueMap;
;
function createValueToKeyMap(entries) {
    return entries.reduce((record, { key, value }) => (Object.assign(Object.assign({}, record), { [value]: key })), {});
}
exports.createValueToKeyMap = createValueToKeyMap;
;
