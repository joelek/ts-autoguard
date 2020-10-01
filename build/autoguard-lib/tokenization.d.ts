export declare const Families: ["WHITESPACE", "PUNCTUATOR", "NUMBER_LITERAL", "IDENTIFIER", "STRING_LITERAL"];
export declare type Families = typeof Families;
export declare type Family = typeof Families[number];
export declare type Token = {
    row: number;
    col: number;
    family: Family;
    value: string;
};
export declare class Tokenizer {
    private tokens;
    private offset;
    private peek;
    private read;
    constructor(string: string);
    newContext<A>(producer: (read: () => Token, peek: () => Token | undefined) => A): A;
}
export declare function tokenize(string: string): Generator<Token>;
export declare function expect(token: Token | undefined, family?: Family | Family[], value?: string | string[]): Token;
