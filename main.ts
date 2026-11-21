// main.ts — entry program for "The Passport Page of a Country That Isn't There".
// Copies the pre-generated passport spread (passport.png, next to this file)
// into the output directory as entry.png, then verifies the written output:
// it must be a real PNG, at most 1024x1024 pixels, and at most 1048576 bytes.
// Standard library only, Node 22.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { join } from "node:path";

const MAX_BYTES = 1048576;
const MAX_DIMENSION = 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function fail(message: string): never {
  console.error(`output verification failed: ${message}`);
  process.exit(1);
}

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

const outPath = join(outDir, "entry.png");
copyFileSync(src, outPath);

// Verify the written output by reading it back.
const bytes = readFileSync(outPath);
if (bytes.length < 33 || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
  fail("entry.png does not start with the PNG signature");
}
if (bytes.readUInt32BE(12) !== 0x49484452) {
  fail("entry.png has no IHDR chunk where expected");
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
  fail(`entry.png is ${width}x${height}, larger than the ${MAX_DIMENSION}x${MAX_DIMENSION} limit`);
}
if (statSync(outPath).size > MAX_BYTES) {
  fail(`entry.png is ${statSync(outPath).size} bytes, over the ${MAX_BYTES} byte limit`);
}

console.log(`wrote entry.png (${width}x${height}, ${bytes.length} bytes)`);
