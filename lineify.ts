import * as fs from "fs";

fs.readFileSync(process.argv[2], "utf8").split(/\r?\n/).map((line) => console.log(`lines.push(\`${line.replace(/\\/g, "\\\\")}\`);`));
