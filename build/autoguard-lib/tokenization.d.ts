export declare const Families: ["WS", "(", ")", "[", "]", "{", "}", "?", "|", ".", "..", "/", "&", ",", ":", "<", ">", "=>", "<=", "any", "binary", "boolean", "false", "guard", "null", "number", "route", "string", "true", "undefined", "IDENTIFIER", "NUMBER_LITERAL", "STRING_LITERAL"];
export declare type Families = typeof Families;
export declare type Family = typeof Families[number];
export declare type Token = {
    row: number;
    col: number;
    family: Family;
    value: string;
};
export declare type TypeMap<A extends [...string[]], B> = {
    [_ in A[number]]: B;
};
export declare class Tokenizer {
    private tokens;
    private offset;
    private peek;
    private read;
    constructor(string: string);
    newContext<A>(producer: (read: () => Token, peek: () => Token | undefined) => A): A;
}
export declare function expect(token: Token, family: Family | Family[]): Token;
