import * as guard from "./guard";
import * as route from "./route";
import * as shared from "./shared";
import * as table from "./table";
import * as tokenization from "./tokenization";
import * as types from "./types";
export declare class BinaryPayloadType implements types.Type {
    constructor();
    generateSchema(options: shared.Options): string;
    generateType(options: shared.Options): string;
    generateTypeGuard(options: shared.Options): string;
    getReferences(): shared.Reference[];
    static readonly INSTANCE: BinaryPayloadType;
}
export declare function areAllMembersOptional(object: types.ObjectType): boolean;
export declare function makeRouteTag(route: route.Route): string;
export declare function getRequestType(route: route.Route): types.Type;
export declare function getResponseType(route: route.Route): types.Type;
export declare function getContentTypeFromType(payload: types.Type): string;
export declare class Schema {
    readonly guards: Array<guard.Guard>;
    readonly tables: Array<table.Table>;
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
