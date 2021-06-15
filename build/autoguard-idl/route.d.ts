import * as shared from "./shared";
import * as tokenization from "./tokenization";
import * as types from "./types";
export declare class Quantifier {
    kind: "required";
    constructor(kind: "required");
    generateSchema(options: shared.Options): string;
    static parse(tokenizer: tokenization.Tokenizer): Quantifier;
}
export declare class Component {
    name: string;
    quantifier: Quantifier;
    type?: types.Type;
    constructor(name: string, quantifier: Quantifier, type?: types.Type);
    generateSchema(options: shared.Options): string;
    static parse(tokenizer: tokenization.Tokenizer): Component;
}
export declare class Path {
    components: Array<Component>;
    constructor(components: Array<Component>);
    generateSchema(options: shared.Options): string;
    static parse(tokenizer: tokenization.Tokenizer): Path;
}
export declare class Method {
    method: string;
    constructor(method: string);
    generateSchema(options: shared.Options): string;
    static parse(tokenizer: tokenization.Tokenizer): Method;
}
export declare class Alias {
    identifier: string;
    constructor(identifier: string);
    generateSchema(options: shared.Options): string;
    static parse(tokenizer: tokenization.Tokenizer): Alias;
}
export declare class Parameter {
    name: string;
    type: types.Type;
    optional: boolean;
    constructor(name: string, type: types.Type, optional: boolean);
    generateSchema(options: shared.Options): string;
    static parse(tokenizer: tokenization.Tokenizer): Parameter;
}
export declare class Parameters {
    parameters: Array<Parameter>;
    constructor(parameters: Array<Parameter>);
    generateSchema(options: shared.Options): string;
    static parse(tokenizer: tokenization.Tokenizer): Parameters;
}
export declare class Headers {
    headers: Array<Parameter>;
    constructor(headers: Array<Parameter>);
    generateSchema(options: shared.Options): string;
    static parse(tokenizer: tokenization.Tokenizer): Headers;
}
export declare class Message {
    headers: Headers;
    payload: types.Type | types.Binary;
    constructor(headers: Headers, payload: types.Type | types.Binary);
    generateSchema(options: shared.Options): string;
    static parse(tokenizer: tokenization.Tokenizer): Message;
}
export declare class Route {
    alias: Alias;
    method: Method;
    path: Path;
    parameters: Parameters;
    request: Message;
    response: Message;
    constructor(alias: Alias, method: Method, path: Path, parameters: Parameters, request: Message, response: Message);
    generateSchema(options: shared.Options): string;
    static parse(tokenizer: tokenization.Tokenizer): Route;
}