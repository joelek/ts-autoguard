import * as libfs from "fs";
import * as libpath from "path";
import { transform } from "../autoguard-lib";

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

try {
	let path = process.argv[2] || "";
	process.stderr.write("Reading file \"" + path + "\".\n");
	let input = libfs.readFileSync(libpath.join(path), "utf8");
	process.stderr.write("Parsing input.\n");
	let generated = transform(input);
	process.stderr.write("Writing to standard output.\n");
	process.stdout.write(generated);
	process.exit(0);
} catch (error) {
	process.stderr.write("An error occurred!\n");
}

try {
	let input = process.argv[2] || "";
	process.stderr.write("Parsing input.\n");
	let generated = transform(input);
	process.stderr.write("Writing to standard output.\n");
	process.stdout.write(generated);
	process.exit(0);
} catch (error) {
	process.stderr.write("An error occurred!\n");
}

try {
	let paths = findFiles("./");
	for (let path of paths) {
		process.stderr.write("Reading file \"" + path + "\".\n");
		let input = libfs.readFileSync(path, "utf8");
		process.stderr.write("Parsing input.\n");
		let generated = transform(input);
		path = libpath.join(libpath.dirname(path), filename(path) + ".ts");
		process.stderr.write("Writing file \"" + path + "\".\n");
		libfs.writeFileSync(path, generated, "utf8");
	}
	process.exit(0);
} catch (error) {
	process.stderr.write("An error occurred!\n");
}

process.stderr.write("usage: autoguard [path | schema]\n");
process.exit(1);
