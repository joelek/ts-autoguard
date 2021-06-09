#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const libfs = require("fs");
const libos = require("os");
const libpath = require("path");
const libts = require("typescript");
const idl = require("../autoguard-idl");
function findFiles(path, paths = []) {
    let stat = libfs.statSync(path);
    if (stat.isDirectory() && libpath.basename(path) !== "node_modules") {
        libfs.readdirSync(path).map((subpath) => {
            return libpath.join(path, subpath);
        }).map((path) => {
            return findFiles(path, paths);
        });
    }
    else if (stat.isFile() && libpath.extname(path) === ".ag") {
        paths.push(path);
    }
    return paths;
}
function filename(path) {
    return libpath.basename(path).split(".").slice(0, -1).join(".");
}
function transpile(source) {
    let result = libts.transpileModule(source, {
        compilerOptions: {
            module: libts.ModuleKind.ESNext,
            target: libts.ScriptTarget.ESNext
        }
    });
    return result.outputText;
}
function transform(string, options) {
    let tokenizer = new idl.tokenization.Tokenizer(string);
    try {
        let schema = idl.schema.Schema.parseOld(tokenizer);
        process.stderr.write(`\tSupport for legacy schemas has been deprecated. Please upgrade using "--upgrade=true".\n`);
        let client = schema.generateClient(options);
        let server = schema.generateServer(options);
        let shared = schema.generateShared(options);
        return {
            client,
            server,
            shared
        };
    }
    catch (error) { }
    ;
    let schema = idl.schema.Schema.parse(tokenizer);
    let client = schema.generateClient(options);
    let server = schema.generateServer(options);
    let shared = schema.generateShared(options);
    return {
        client,
        server,
        shared
    };
}
function upgrade(string, options) {
    let tokenizer = new idl.tokenization.Tokenizer(string);
    try {
        let schema = idl.schema.Schema.parseOld(tokenizer);
        return schema.generateSchema(options);
    }
    catch (error) { }
    ;
    idl.schema.Schema.parse(tokenizer);
    return string;
}
function run() {
    let options = {
        eol: libos.EOL,
        root: "./",
        upgrade: false,
        target: "ts"
    };
    let found_unrecognized_argument = false;
    for (let argv of process.argv.slice(2)) {
        let parts = null;
        if (false) {
        }
        else if ((parts = /^--eol=(.+)$/.exec(argv)) != null) {
            options.eol = parts[1];
        }
        else if ((parts = /^--root=(.+)$/.exec(argv)) != null) {
            options.root = parts[1];
        }
        else if ((parts = /^--upgrade=(true|false)$/.exec(argv)) != null) {
            options.upgrade = parts[1] === "true" ? true : false;
        }
        else if ((parts = /^--target=(.+)$/.exec(argv)) != null) {
            options.target = parts[1];
        }
        else {
            found_unrecognized_argument = true;
            process.stderr.write("Unrecognized argument \"" + argv + "\"!\n");
        }
    }
    if (found_unrecognized_argument) {
        process.stderr.write("Arguments:\n");
        process.stderr.write("	--eol=string\n");
        process.stderr.write("	--root=string\n");
        process.stderr.write("	--upgrade=boolean\n");
        process.stderr.write("	--target=string\n");
        process.exit(0);
    }
    let paths = findFiles(options.root);
    let result = paths.reduce((sum, path) => {
        process.stderr.write("Processing \"" + path + "\"...\n");
        try {
            if (options.upgrade) {
                let input = libfs.readFileSync(path, "utf8");
                let start = Date.now();
                let generated = upgrade(input, options);
                let duration = Date.now() - start;
                process.stderr.write("	Upgrade: " + duration + " ms\n");
                libfs.writeFileSync(path, generated, "utf8");
            }
            else {
                let input = libfs.readFileSync(path, "utf8");
                let start = Date.now();
                let generated = transform(input, options);
                let duration = Date.now() - start;
                process.stderr.write("	Transform: " + duration + " ms\n");
                let directory = libpath.join(libpath.dirname(path), filename(path));
                libfs.rmSync(directory, { force: true, recursive: true });
                libfs.rmSync(libpath.join(libpath.dirname(path), filename(path) + ".ts"), { force: true, recursive: true });
                libfs.mkdirSync(directory, { recursive: true });
                if (options.target === "js") {
                    libfs.writeFileSync(libpath.join(directory, "client.js"), transpile(generated.client), "utf8");
                    libfs.writeFileSync(libpath.join(directory, "server.js"), transpile(generated.server), "utf8");
                    libfs.writeFileSync(libpath.join(directory, "index.js"), transpile(generated.shared), "utf8");
                }
                else {
                    libfs.writeFileSync(libpath.join(directory, "client.ts"), generated.client, "utf8");
                    libfs.writeFileSync(libpath.join(directory, "server.ts"), generated.server, "utf8");
                    libfs.writeFileSync(libpath.join(directory, "index.ts"), generated.shared, "utf8");
                }
            }
            return sum + 0;
        }
        catch (error) {
            process.stderr.write("\t" + error + "\n");
            return sum + 1;
        }
    }, 0);
    process.exit(result);
}
run();
