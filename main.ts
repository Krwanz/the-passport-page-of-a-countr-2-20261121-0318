// main.ts — entry program for "The Passport Page of a Country That Isn't There".
// Copies the pre-generated passport spread (passport.png, next to this file)
// into the output directory as entry.png. Standard library only, Node 22.

import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const outDir = process.env.MAKEFUN_OUTPUT_DIR;
if (!outDir) {
  console.error("MAKEFUN_OUTPUT_DIR is not set");
  process.exit(1);
}

// Never remove the output directory itself; clear only its contents.
mkdirSync(outDir, { recursive: true });
for (const name of readdirSync(outDir)) {
  rmSync(join(outDir, name), { recursive: true, force: true });
}

const src = join(import.meta.dirname, "passport.png");
if (!existsSync(src)) {
  console.error("passport.png not found next to main.ts");
  process.exit(1);
}

copyFileSync(src, join(outDir, "entry.png"));
console.log("wrote entry.png");
