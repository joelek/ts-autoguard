import * as guard from "./guard";
import * as route from "./route";
import * as shared from "./shared";
import * as tokenization from "./tokenization";
export declare class Schema {
    readonly guards: Array<guard.Guard>;
    readonly routes: Array<route.Route>;
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
