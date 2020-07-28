export declare type Boolean = boolean;
export declare const Boolean: {
    as(subject: any, path?: string): Boolean;
    is(subject: any): subject is boolean;
};
export declare type Number = number;
export declare const Number: {
    as(subject: any, path?: string): Number;
    is(subject: any): subject is number;
};
export declare type Null = null;
export declare const Null: {
    as(subject: any, path?: string): Null;
    is(subject: any): subject is null;
};
export declare type String = string;
export declare const String: {
    as(subject: any, path?: string): String;
    is(subject: any): subject is string;
};
export declare type Undefined = undefined;
export declare const Undefined: {
    as(subject: any, path?: string): Undefined;
    is(subject: any): subject is undefined;
};
export declare type Autoguard = {
    "Boolean": Boolean;
    "Number": Number;
    "Null": Null;
    "String": String;
    "Undefined": Undefined;
};
export declare const Autoguard: {
    Boolean: {
        as(subject: any, path?: string): Boolean;
        is(subject: any): subject is boolean;
    };
    Number: {
        as(subject: any, path?: string): Number;
        is(subject: any): subject is number;
    };
    Null: {
        as(subject: any, path?: string): Null;
        is(subject: any): subject is null;
    };
    String: {
        as(subject: any, path?: string): String;
        is(subject: any): subject is string;
    };
    Undefined: {
        as(subject: any, path?: string): Undefined;
        is(subject: any): subject is undefined;
    };
};
