export declare const Families: ["WHITESPACE", "PUNCTUATOR", "NUMBER_LITERAL", "IDENTIFIER", "STRING_LITERAL"];
export declare type Family = typeof Families[number];
export declare type Token = {
    row: number;
    col: number;
    family: Family;
    value: string;
};
export declare function tokenize(string: string): Generator<Token>;
export declare function expect(token: Token | undefined, family?: Family | Family[], value?: string | string[]): Token;
