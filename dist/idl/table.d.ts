import * as shared from "./shared";
import * as tokenization from "./tokenization";
export type TableMember = {
    key: string;
    value: number | string;
};
export declare class Table {
    typename: string;
    members: Array<TableMember>;
    constructor(typename: string, members: Array<TableMember>);
    generateSchema(options: shared.Options): string;
    static parse(tokenizer: tokenization.Tokenizer): Table;
}
