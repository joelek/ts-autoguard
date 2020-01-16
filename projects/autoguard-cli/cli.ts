import * as libfs from "fs";
import * as libpath from "path";
import { transform } from "autoguard-lib/lib";

try {
	let input = libfs.readFileSync(libpath.join(process.argv[2]), "utf8");
	process.stdout.write(transform(input));
	process.exit(0);
} catch (error) {}

try {
	let input = process.argv[2];
	process.stdout.write(transform(input));
	process.exit(0);
} catch (error) {}

process.stderr.write("usage: autoguard <path | schema>\n");
process.exit(1);
