#!/usr/bin/env node

/**
 * Fix ESM JSON Imports Script
 *
 * Purpose:
 * Node's native ESM loader refuses to load JSON modules without a
 * `with { type: 'json' }` import attribute (`ERR_IMPORT_ATTRIBUTE_MISSING`).
 * Several packages do `import pkg from '../package.json'` to read their
 * version at runtime.
 *
 * This can't be fixed in the shared TypeScript source: the same `.ts`
 * files compile to both ESM ("module": "esnext", which supports import
 * attributes) and CommonJS ("module": "commonjs", where import attribute
 * syntax is a hard compile error - TS2823). So the attribute is injected
 * here, as a post-build step, into the compiled ESM output only.
 *
 * Why `with` and not `assert`:
 * `with { type: 'json' }` is the modern (TC39-final) syntax, required on
 * Node >=22 (`assert` was removed there - hard SyntaxError). The older
 * `assert { type: 'json' }` only works on Node <22 and was never valid
 * before Node 20.10.0/18.20.0/21.0.0. There is no single syntax that works
 * across all of Node >=20, so this repo's `engines.node` is pinned to
 * ">=21" (safely past the 20.10.0/18.20.0 cutoff where `with` first
 * landed, and clear of the ambiguous 20.0.0-20.9.x range) to keep this
 * script's output valid on every Node version this repo claims to support.
 * IMPORTANT: if `engines.node` in the package.jsons is ever changed, this
 * comment (and the syntax choice above) must be re-verified against
 * Node's `with`/`assert` support matrix, or JSON imports in `dist-es`
 * output will throw a SyntaxError on affected runtimes.
 *
 * Usage:
 *   node ../../scripts/fix-esm-json-imports.js [outputDir]
 *
 * outputDir defaults to "dist-es" resolved relative to the current
 * working directory (i.e. the package invoking this script).
 */

const fs = require('fs');
const path = require('path');

// Matches `import ... from '...json';` / `export ... from "...json"` that
// don't already carry a `with`/`assert` import attribute clause.
const JSON_IMPORT_REGEX =
  /((?:import|export)\s[^;]*?from\s*(['"])[^'"]+\.json\2)(?!\s*(?:with|assert)\s*\{)(\s*;)/g;

function fixFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');

  let changed = false;
  const updated = original.replace(JSON_IMPORT_REGEX, (match, statement, quote, semicolon) => {
    changed = true;
    return `${statement} with { type: 'json' }${semicolon}`;
  });

  if (changed) {
    fs.writeFileSync(filePath, updated, 'utf8');
  }

  return changed;
}

function walk(dir, onFile) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath, onFile);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      onFile(entryPath);
    }
  }
}

function main() {
  const outputDir = path.resolve(process.cwd(), process.argv[2] || 'dist-es');

  if (!fs.existsSync(outputDir)) {
    console.error(`[fix-esm-json-imports] Directory not found: ${outputDir}`);
    process.exit(1);
  }

  let fixedCount = 0;
  walk(outputDir, (filePath) => {
    if (fixFile(filePath)) {
      fixedCount += 1;
    }
  });

  console.log(
    `[fix-esm-json-imports] Fixed ${fixedCount} file(s) in ${path.relative(process.cwd(), outputDir)}`
  );
}

main();
