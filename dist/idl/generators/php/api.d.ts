import { Route } from "../../route";
import { Schema } from "../../schema";
import { Type } from "../../types";
import { File, Generator } from "../generator";
export declare class PHPAPIGenerator extends Generator {
    constructor();
    generateTypeGuard(type: Type, eol: string): string;
    generateBaseFile(schema: Schema, eol: string): File;
    generateBaseRouteFile(route: Route, eol: string): File;
    generateRouteFile(route: Route, eol: string): File;
    generateHtaccessFile(eol: string): File;
    generateAutoguardFile(eol: string): File;
    generateIndexFile(schema: Schema, eol: string): File;
    generate(schema: Schema, eol: string): Array<File>;
}
