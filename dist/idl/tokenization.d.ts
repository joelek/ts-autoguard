export declare const Families: ["LS", "WS", "(", ")", "[", "]", "{", "}", "?", "|", ".", "..", "/", "*", "&", ",", ":", ";", "<", ">", "=>", "<=", "any", "bigint", "binary", "boolean", "false", "guard", "integer", "null", "number", "plain", "route", "string", "table", "true", "undefined", "IDENTIFIER", "NUMBER_LITERAL", "STRING_LITERAL", "PATH_COMPONENT", "COMMENT"];
export declare type Families = typeof Families;
export declare type Family = typeof Families[number];
export declare const IdentifierFamilies: ["any", "bigint", "binary", "boolean", "false", "guard", "integer", "null", "number", "plain", "route", "string", "table", "true", "undefined", "IDENTIFIER"];
export declare type Token = {
    row: number;
    col: number;
    family: Family;
    value: string;
};
export declare type TypeMap<A extends [...string[]], B> = {
    [_ in A[number]]: B;
};
export declare function removeWhitespaceAndComments(unfiltered: Array<Token>): Array<Token>;
export declare class Tokenizer {
    private tokens;
    private offset;
    private peek;
    private read;
    constructor(string: string);
    newContext<A>(producer: (read: () => Token, peek: () => Token | undefined) => A): A;
}
export declare class SyntaxError {
    private token;
    constructor(token: Token);
    toString(): string;
    static getError(tokenizer: Tokenizer, errors: Array<any>): any;
}
export declare function expect(token: Token, family: Family | Family[]): Token;
