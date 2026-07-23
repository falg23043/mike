/**
 * One-shot seed: upload built-in template `.docx` blobs to R2.
 *
 * Reads each entry from `src/lib/builtinTemplates.ts`, loads the matching
 * local file from `backend/templates-src/{id}.docx`, and writes it to R2 at
 * `templates/system/{id}/source.docx` via the app's storage wrapper.
 *
 * Idempotent — safe to re-run to update a template's bytes.
 *
 * Usage (from backend/), with the same R2_* env the app uses (loads
 * backend/.env automatically via dotenv):
 *   npx tsx scripts/seed-templates.ts
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { BUILTIN_TEMPLATES } from "../src/lib/builtinTemplates";
import { templateStorageKey, uploadFile } from "../src/lib/storage";

const DOCX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const SRC_DIR = path.resolve(__dirname, "..", "templates-src");

async function main() {
  let failures = 0;
  for (const tpl of BUILTIN_TEMPLATES) {
    const localPath = path.join(SRC_DIR, `${tpl.id}.docx`);
    const key = templateStorageKey(tpl.id);
    try {
      const buf = await readFile(localPath);
      const ab = buf.buffer.slice(
        buf.byteOffset,
        buf.byteOffset + buf.byteLength,
      ) as ArrayBuffer;
      await uploadFile(key, ab, DOCX_CONTENT_TYPE);
      console.log(`OK   ${tpl.id}  ->  ${key}  (${buf.byteLength} bytes)`);
    } catch (err) {
      failures += 1;
      console.error(`FAIL ${tpl.id}  (${localPath}):`, err);
    }
  }
  if (failures > 0) {
    console.error(`\n${failures} template(s) failed to seed.`);
    process.exit(1);
  }
  console.log(`\nSeeded ${BUILTIN_TEMPLATES.length} template(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
