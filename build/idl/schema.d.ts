import * as shared from "./shared";
import * as tokenization from "./tokenization";
export declare class Schema {
    private guards;
    private routes;
    private getClientImports;
    private getServerImports;
    private getSharedImports;
    private constructor();
    generateSchema(options: shared.Options): string;
    generateClient(options: shared.Options): string;
    generateServer(options: shared.Options): string;
    generateShared(options: shared.Options): string;
    static parseOld(tokenizer: tokenization.Tokenizer): Schema;
    static parse(tokenizer: tokenization.Tokenizer): Schema;
}
