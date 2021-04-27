import * as shared from "../shared";
import * as tokenization from "../tokenization";
export declare class Schema {
    private guards;
    private routes;
    private getImports;
    private constructor();
    generateSchema(options: shared.Options): string;
    generateModule(options: shared.Options): string;
    static parseOld(tokenizer: tokenization.Tokenizer): Schema;
    static parse(tokenizer: tokenization.Tokenizer): Schema;
}
