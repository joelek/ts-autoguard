"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expect = exports.SyntaxError = exports.Tokenizer = exports.removeWhitespaceAndComments = exports.IdentifierFamilies = exports.Families = void 0;
exports.Families = ((...tuple) => tuple)("LS", "WS", "(", ")", "[", "]", "{", "}", "?", "|", ".", "..", "/", "*", "&", ",", ":", ";", "<", ">", "_", "~", "-", "=>", "<=", "any", "bigint", "binary", "boolean", "false", "guard", "integer", "null", "number", "plain", "route", "string", "table", "true", "undefined", "IDENTIFIER", "NUMBER_LITERAL", "STRING_LITERAL", "PERCENT_ENCODED_OCTET", "COMMENT");
exports.IdentifierFamilies = ((...tuple) => tuple)("any", "bigint", "binary", "boolean", "false", "guard", "integer", "null", "number", "plain", "route", "string", "table", "true", "undefined", "IDENTIFIER");
function removeWhitespaceAndComments(unfiltered) {
    let filtered = new Array();
    let offset = 0;
    while (offset < unfiltered.length) {
        let token = unfiltered[offset];
        offset += 1;
        if (token.family === "WS" || token.family === "LS" || token.family === "COMMENT") {
            continue;
        }
        filtered.push(token);
    }
    return filtered;
}
exports.removeWhitespaceAndComments = removeWhitespaceAndComments;
;
class Tokenizer {
    peek() {
        return this.tokens[this.offset];
    }
    read() {
        if (this.offset >= this.tokens.length) {
            throw `Unexpectedly reached end of stream!`;
        }
        return this.tokens[this.offset++];
    }
    constructor(string) {
        let matchers = {
            "LS": /^([\r][\n]|[\r]|[\n])/su,
            "WS": /^([\t ]+)/su,
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
            "*": /^([*])/su,
            "&": /^([&])/su,
            ",": /^([,])/su,
            ":": /^([:])/su,
            ";": /^([;])/su,
            "<": /^([<])/su,
            ">": /^([>])/su,
            "_": /^([_])/su,
            "~": /^([~])/su,
            "-": /^([-])/su,
            "=>": /^([=][>])/su,
            "<=": /^([<][=])/su,
            "any": /^(any)/su,
            "bigint": /^(bigint)/su,
            "binary": /^(binary)/su,
            "boolean": /^(boolean)/su,
            "false": /^(false)/su,
            "guard": /^(guard)/su,
            "integer": /^(integer)/su,
            "null": /^(null)/su,
            "number": /^(number)/su,
            "plain": /^(plain)/su,
            "route": /^(route)/su,
            "string": /^(string)/su,
            "table": /^(table)/su,
            "true": /^(true)/su,
            "undefined": /^(undefined)/su,
            "IDENTIFIER": /^([a-zA-Z][a-zA-Z0-9_]*)/su,
            "NUMBER_LITERAL": /^(([1-9][0-9]+)|([0-9]))/su,
            "STRING_LITERAL": /^(["][^"]*["])/su,
            "PERCENT_ENCODED_OCTET": /^([%][0-9a-fA-F]{2})/su,
            "COMMENT": /^([#][^\r\n]*)/su
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
        this.tokens = removeWhitespaceAndComments(tokens);
        this.offset = 0;
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
class SyntaxError {
    constructor(token) {
        this.token = token;
    }
    toString() {
        return `Unexpected ${this.token.family} at row ${this.token.row}, col ${this.token.col}!`;
    }
    static getError(tokenizer, errors) {
        return tokenizer.newContext((read, peek) => {
            for (let error of errors) {
                if (!(error instanceof SyntaxError)) {
                    return error;
                }
            }
            let syntaxErrors = errors;
            syntaxErrors.sort((one, two) => {
                if (two.token.row > one.token.row) {
                    return -1;
                }
                if (two.token.row < one.token.row) {
                    return 1;
                }
                if (two.token.col > one.token.col) {
                    return -1;
                }
                if (two.token.col < one.token.col) {
                    return 1;
                }
                return 0;
            });
            return syntaxErrors.pop();
        });
    }
}
exports.SyntaxError = SyntaxError;
;
function expect(token, family) {
    let families = Array.isArray(family) ? family : [family];
    if (!families.includes(token.family)) {
        throw new SyntaxError(token);
    }
    return token;
}
exports.expect = expect;
;
