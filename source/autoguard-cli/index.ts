#!/usr/bin/env node

import * as libfs from "fs";
import * as libos from "os";
import * as libpath from "path";
import * as lib from "../autoguard-lib";

function findFiles(path: string, paths: Array<string> = []): Array<string> {
	let stat = libfs.statSync(path);
	if (stat.isDirectory() && libpath.basename(path) !== "node_modules") {
		libfs.readdirSync(path).map((subpath) => {
			return libpath.join(path, subpath);
		}).map((path) => {
			return findFiles(path, paths);
		});
	} else if (stat.isFile() && libpath.extname(path) === ".ag") {
		paths.push(path);
	}
	return paths;
}

function filename(path: string): string {
	return libpath.basename(path).split(".").slice(0, -1).join(".");
}

function transform(string: string, options: lib.language.Options): string {
	let tokenizer = new lib.tokenization.Tokenizer(string);
	let schema = lib.language.Schema.parse(tokenizer);
	return schema.generateModule(options);
}

function run(): void {
	let options = {
		eol: libos.EOL,
		root: "./"
	};
	let found_unrecognized_argument = false;
	for (let argv of process.argv.slice(2)) {
		let parts: RegExpExecArray | null = null;
		if (false) {
		} else if ((parts = /^--eol=(.+)$/.exec(argv)) != null) {
			options.eol = parts[1];
		} else if ((parts = /^--root=(.+)$/.exec(argv)) != null) {
			options.root = parts[1];
		} else {
			found_unrecognized_argument = true;
			process.stderr.write("Unrecognized argument \"" + argv + "\"!\n");
		}
	}
	if (found_unrecognized_argument) {
		process.stderr.write("Arguments:\n");
		process.stderr.write("	--eol=string\n");
		process.stderr.write("	--root=string\n");
		process.exit(0);
	}
	let paths = findFiles(options.root);
	let result = paths.reduce((sum, path) => {
		process.stderr.write("Processing \"" + path + "\"...\n");
		try {
			let input = libfs.readFileSync(path, "utf8");
			let start = Date.now();
			let generated = transform(input, options);
			let duration = Date.now() - start;
			process.stderr.write("	Transform: " + duration + " ms\n");
			path = libpath.join(libpath.dirname(path), filename(path) + ".ts");
			libfs.writeFileSync(path, generated, "utf8");
			return sum + 0;
		} catch (error) {
			process.stderr.write("\t" + error + "\n");
			return sum + 1;
		}
	}, 0);
	process.exit(result);
}

run();
