import * as tokenization from "../tokenization";
import * as types from "./types";
export declare class Component {
    name: string;
    type?: string;
    constructor(name: string, type?: string);
    static parse(tokenizer: tokenization.Tokenizer): Component;
}
export declare class Path {
    components: Array<Component>;
    constructor(components: Array<Component>);
    static parse(tokenizer: tokenization.Tokenizer): Path;
}
export declare class Method {
    method: string;
    constructor(method: string);
    static parse(tokenizer: tokenization.Tokenizer): Method;
}
export declare class Parameter {
    name: string;
    type: string;
    optional: boolean;
    constructor(name: string, type: string, optional: boolean);
    static parse(tokenizer: tokenization.Tokenizer): Parameter;
}
export declare class Parameters {
    parameters: Array<Parameter>;
    constructor(parameters: Array<Parameter>);
    static parse(tokenizer: tokenization.Tokenizer): Parameters;
}
export declare class Headers {
    headers: Array<Parameter>;
    constructor(headers: Array<Parameter>);
    static parse(tokenizer: tokenization.Tokenizer): Headers;
}
export declare class Message {
    headers: Headers;
    payload: types.Type;
    constructor(headers: Headers, payload: types.Type);
    static parse(tokenizer: tokenization.Tokenizer): Message;
}
export declare class Route {
    method: Method;
    path: Path;
    parameters: Parameters;
    request: Message;
    response: Message;
    constructor(method: Method, path: Path, parameters: Parameters, request: Message, response: Message);
    static parse(tokenizer: tokenization.Tokenizer): Route;
}
