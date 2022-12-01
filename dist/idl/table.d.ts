import * as shared from "./shared";
import * as tokenization from "./tokenization";
import * as types from "./types";
export type TableMember = {
    key: types.StringLiteralType;
    value: types.NumberLiteralType;
};
export declare class Table {
    typename: string;
    members: Array<TableMember>;
    constructor(typename: string, members: Array<TableMember>);
    generateSchema(options: shared.Options): string;
    static parse(tokenizer: tokenization.Tokenizer): Table;
}
