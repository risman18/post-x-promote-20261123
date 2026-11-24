// Hand the judges our X post pointer, untouched.
//
// The whole entry lives in POST.json next to this file: a tiny JSON
// document whose "url" field names the post we published. The harness
// expects that exact file to show up in the output directory, so this
// program performs a faithful byte-for-byte copy and nothing more.

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Where the bot's own files live. The runner points MAKEFUN_BOT_DIR at
// the repository root; when run by hand we simply use the directory the
// command was started from.
const botDir = process.env.MAKEFUN_BOT_DIR ?? process.cwd();

// Where deliverables belong. MAKEFUN_OUTPUT_DIR is provided by the
// runner; the conventional fallback is /output.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const sourceFile = join(botDir, "POST.json");
const targetFile = join(outputDir, "POST.json");

// Pre-flight sanity check: before handing the pointer over, confirm it
// actually parses and that its "url" has the shape of an X status
// address (https://x.com/<user>/status/<id>, or the twitter.com twin).
// A malformed POST.json would score zero, so failing loudly here is
// kinder than copying a broken file in silence.
const pointer = JSON.parse(readFileSync(sourceFile, "utf8"));
const statusShape = /^https:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/\d+$/;
if (typeof pointer.url !== "string" || !statusShape.test(pointer.url)) {
  throw new Error(`POST.json does not name an X post: ${String(pointer.url)}`);
}

// The output directory is not guaranteed to exist yet, so create it
// (and any parents) before copying into it.
mkdirSync(outputDir, { recursive: true });

// copyFileSync duplicates the file's bytes exactly, which is what we
// want: no parsing, no re-serialising, no chance to mangle the JSON.
copyFileSync(sourceFile, targetFile);

console.log(`POST.json copied: ${sourceFile} -> ${targetFile}`);
