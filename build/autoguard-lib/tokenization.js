"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expect = exports.Tokenizer = exports.IdentifierFamilies = exports.Families = void 0;
exports.Families = ((...tuple) => tuple)("WS", "(", ")", "[", "]", "{", "}", "?", "|", ".", "..", "/", "&", ",", ":", ";", "<", ">", "=>", "<=", "any", "binary", "boolean", "false", "guard", "null", "number", "route", "string", "true", "undefined", "IDENTIFIER", "NUMBER_LITERAL", "STRING_LITERAL");
exports.IdentifierFamilies = ((...tuple) => tuple)("any", "binary", "boolean", "false", "guard", "null", "number", "route", "string", "true", "undefined", "IDENTIFIER");
class Tokenizer {
    constructor(string) {
        let matchers = {
            "WS": /^([\t\r\n ]+)/su,
            "(": /^([\(])/su,
            ")": /^([\)])/su,
            "[": /^([\[])/su,
            "]": /^([\]])/su,
            "{": /^([\{])/su,
            "}": /^([\}])/su,
            "?": /^([\?])/su,
            "|": /^([\|])/su,
            ".": /^([\.])/su,
            "..": /^([\.][\.])/su,
            "/": /^([\/])/su,
            "&": /^([&])/su,
            ",": /^([,])/su,
            ":": /^([:])/su,
            ";": /^([;])/su,
            "<": /^([<])/su,
            ">": /^([>])/su,
            "=>": /^([=][>])/su,
            "<=": /^([<][=])/su,
            "any": /^(any)/su,
            "binary": /^(binary)/su,
            "boolean": /^(boolean)/su,
            "false": /^(false)/su,
            "guard": /^(guard)/su,
            "null": /^(null)/su,
            "number": /^(number)/su,
            "route": /^(route)/su,
            "string": /^(string)/su,
            "true": /^(true)/su,
            "undefined": /^(undefined)/su,
            "IDENTIFIER": /^([a-z][a-z0-9_]*)/isu,
            "NUMBER_LITERAL": /^(([1-9][0-9]+)|([0-9]))/su,
            "STRING_LITERAL": /^(["][^"]*["])/su
        };
        let tokens = new Array();
        let row = 1;
        let col = 1;
        while (string.length > 0) {
            let token;
            for (let key in matchers) {
                let type = key;
                let exec = matchers[type].exec(string);
                if (exec == null) {
                    continue;
                }
                if ((token == null) || (exec[1].length > token[1].length)) {
                    token = [type, exec[1]];
                }
            }
            if (token == null) {
                throw `Unrecognized token at row ${row}, col ${col}!`;
            }
            tokens.push({
                family: token[0],
                value: token[1],
                row: row,
                col: col
            });
            string = string.slice(token[1].length);
            let lines = token[1].split(/\r?\n/);
            if (lines.length > 1) {
                row += lines.length - 1;
                col = 1;
            }
            col += lines[lines.length - 1].length;
        }
        this.tokens = tokens.filter((token) => {
            return token.family !== "WS";
        });
        this.offset = 0;
    }
    peek() {
        return this.tokens[this.offset];
    }
    read() {
        if (this.offset >= this.tokens.length) {
            throw `Unexpectedly reached end of stream!`;
        }
        return this.tokens[this.offset++];
    }
    newContext(producer) {
        let offset = this.offset;
        try {
            return producer(() => this.read(), () => this.peek());
        }
        catch (error) {
            this.offset = offset;
            throw error;
        }
    }
}
exports.Tokenizer = Tokenizer;
;
function expect(token, family) {
    let families = Array.isArray(family) ? family : [family];
    if (!families.includes(token.family)) {
        throw `Unexpected ${token.family} at row ${token.row}, col ${token.col}!`;
    }
    return token;
}
exports.expect = expect;
;
