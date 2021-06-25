"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Guard = void 0;
const tokenization = require("./tokenization");
const types = require("./types");
class Guard {
    constructor(typename, type) {
        this.typename = typename;
        this.type = type;
    }
    generateSchema(options) {
        let lines = new Array();
        lines.push(`guard ${this.typename}: ${this.type.generateSchema(options)};`);
        return lines.join(options.eol);
    }
    static parse(tokenizer) {
        return tokenizer.newContext((read, peek) => {
            tokenization.expect(read(), "guard");
            let typename = tokenization.expect(read(), "IDENTIFIER").value;
            tokenization.expect(read(), ":");
            let type = types.Type.parse(tokenizer);
            tokenization.expect(read(), ";");
            return new Guard(typename, type);
        });
    }
}
exports.Guard = Guard;
;
