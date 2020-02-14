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
	let input = libfs.readFileSync(libpath.join(process.argv[2]), "utf8");
	process.stdout.write(transform(input));
	process.exit(0);
} catch (error) {
	process.stderr.write(error + "\n");
}

try {
	let input = process.argv[2];
	process.stdout.write(transform(input));
	process.exit(0);
} catch (error) {
	process.stderr.write(error + "\n");
}

try {
	let paths = findFiles("./");
	for (let path of paths) {
		let input = libfs.readFileSync(path, "utf8");
		let generated = transform(input);
		libfs.writeFileSync(libpath.join(libpath.dirname(path), filename(path) + ".ts"), generated, "utf8");
	}
	process.exit(0);
} catch (error) {
	process.stderr.write(error + "\n");
}

process.stderr.write("usage: autoguard [path | schema]\n");
process.exit(1);
