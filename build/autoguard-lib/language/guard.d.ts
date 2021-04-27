import * as shared from "../shared";
import * as tokenization from "../tokenization";
import * as types from "./types";
export declare class Guard {
    typename: string;
    type: types.Type;
    constructor(typename: string, type: types.Type);
    generateSchema(options: shared.Options): string;
    static parse(tokenizer: tokenization.Tokenizer): Guard;
}
