declare module "autoguard-lib/native" {
    interface TypeGuard<T> {
        (subject: any, path: string): T;
    }
    export const Any: {
        as(subject: any, path?: string): any;
        is(subject: any): subject is any;
    };
    export const Array: {
        as<T>(subject: any, guard: TypeGuard<T>, path?: string): T[];
        is<T_1>(subject: any, guard: TypeGuard<T_1>): subject is T_1[];
    };
    export const Boolean: {
        as(subject: any, path?: string): boolean;
        is(subject: any): subject is boolean;
    };
    export const Null: {
        as(subject: any, path?: string): null;
        is(subject: any): subject is null;
    };
    export const Number: {
        as(subject: any, path?: string): number;
        is(subject: any): subject is number;
    };
    export const Object: {
        as<T>(subject: any, guard: { [K in keyof T]: TypeGuard<T[K]>; }, path?: string): T;
        is<T_1>(subject: any, guard: { [K_1 in keyof T_1]: TypeGuard<T_1[K_1]>; }): subject is T_1;
    };
    export const Record: {
        as<T>(subject: any, guard: TypeGuard<T>, path?: string): Record<string, T>;
        is<T_1>(subject: any, guard: TypeGuard<T_1>): subject is Record<string, T_1>;
    };
    export const String: {
        as(subject: any, path?: string): string;
        is(subject: any): subject is string;
    };
    export const Undefined: {
        as(subject: any, path?: string): undefined;
        is(subject: any): subject is undefined;
    };
    export const Union: {
        as<T>(subject: any, guard: TypeGuard<T>[], path?: string): T;
        is<T_1>(subject: any, guard: TypeGuard<T_1>[]): subject is T_1;
    };
}
declare module "autoguard-lib/lib" {
    export function transform(string: string): string;
}
