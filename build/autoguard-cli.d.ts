declare type Exports = {};
declare type Module = {
    exports: Exports;
};
declare type ModuleCallback = {
    (...exports: Array<Exports>): void;
};
declare type ModuleState = {
    callback: ModuleCallback;
    dependencies: Array<string>;
    module: Module | null;
};
declare let define: (name: string, dependencies: string[], callback: ModuleCallback) => void;
declare module "autoguard-lib/lib" {
    export function transform(string: string): string;
}
declare module "autoguard-cli/cli" { }
