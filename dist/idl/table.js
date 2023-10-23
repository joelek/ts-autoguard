"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const is = require("./is");
const tokenization = require("./tokenization");
const types = require("./types");
class Table {
    constructor(typename, members) {
        this.typename = typename;
        this.members = members;
    }
    generateSchema(options) {
        let lines = new Array();
        for (let { key, value } of this.members) {
            lines.push(`\t"${key}": ${value}`);
        }
        let body = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
        return `table ${this.typename}: {${body}};`;
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            var _a, _b, _c;
            tokenization.expect(read(), "table");
            let typename = tokenization.expect(read(), "IDENTIFIER").value;
            tokenization.expect(read(), ":");
            tokenization.expect(read(), "{");
            let members = new Array();
            if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "}") {
                let nextValue = 0;
                while (true) {
                    let token = tokenization.expect(read(), [
                        ...tokenization.IdentifierFamilies,
                        "STRING_LITERAL"
                    ]);
                    let key = token.family === "STRING_LITERAL" ? token.value.slice(1, -1) : token.value;
                    let value;
                    if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.family) === ":") {
                        tokenization.expect(read(), ":");
                        let type = types.Type.parse(tokenizer, {
                            parsers: [
                                types.IntegerLiteralType.parse,
                                types.StringLiteralType.parse
                            ]
                        });
                        if (type instanceof types.IntegerLiteralType) {
                            value = type.value;
                            nextValue = type.value;
                        }
                        else {
                            value = type.value;
                        }
                    }
                    if (is.absent(value)) {
                        value = nextValue;
                    }
                    members.push({
                        key,
                        value
                    });
                    nextValue = nextValue + 1;
                    if (((_c = peek()) === null || _c === void 0 ? void 0 : _c.value) !== ",") {
                        break;
                    }
                    tokenization.expect(read(), ",");
                }
            }
            tokenization.expect(read(), "}");
            tokenization.expect(read(), ";");
            return new Table(typename, members);
        });
    }
}
exports.Table = Table;
;
