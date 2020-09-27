"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expect = exports.tokenize = exports.Families = void 0;
exports.Families = ((...tuple) => tuple)("WHITESPACE", "PUNCTUATOR", "NUMBER_LITERAL", "IDENTIFIER", "STRING_LITERAL");
function* tokenize(string) {
    let re = /(?<WHITESPACE>[\t\r\n ]+)|(?<PUNCTUATOR>[\(\)\[\]\{\}\?\|&@,:])|(?<NUMBER_LITERAL>([1-9][0-9]+)|([0-9]))|(?<IDENTIFIER>[a-z][a-z0-9_]*)|(?<STRING_LITERAL>["][^"]*["])|(.)/isgu;
    let match = null;
    let row = 1;
    let col = 1;
    while ((match = re.exec(string)) != null) {
        let entries = Object.entries(match.groups || {}).filter(([key, value]) => {
            return value != null;
        });
        if (entries.length === 0) {
            throw `Unrecognized token at row ${row}, col ${col}!`;
        }
        let family = entries[0][0];
        let value = entries[0][1];
        yield {
            row,
            col,
            family,
            value
        };
        let lines = value.split(/\r?\n/);
        if (lines.length > 1) {
            row += lines.length - 1;
            col = 1;
        }
        col += lines[lines.length - 1].length;
    }
}
exports.tokenize = tokenize;
;
function expect(token, family, value) {
    if (token == null) {
        throw `Unexpectedly reached end of stream!`;
    }
    if (family != null) {
        let families = Array.isArray(family) ? family : [family];
        if (!families.includes(token.family)) {
            throw `Expected ${families.join(" or ")} at row ${token.row}, col ${token.col}. Found ${token.family}!`;
        }
    }
    if (value != null) {
        let values = Array.isArray(value) ? value : [value];
        if (!values.includes(token.value)) {
            throw `Expected ${values.join(" or ")} at row ${token.row}, col ${token.col}. Found ${token.family}!`;
        }
    }
    return token;
}
exports.expect = expect;
;
