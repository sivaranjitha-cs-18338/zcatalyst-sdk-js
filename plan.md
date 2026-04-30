# zcatalyst-sdk-js — Documentation Audit & Plan

## Status snapshot

| State | Count | Items |
|-------|-------|-------|
| ✅ Done    | 8 | typedoc-fix, datastreams-decision, doc-style-guide, root-readme, module-doc-comments, jsdoc-functions, jsdoc-fix-existing, regenerate-docs |
| ⏳ Pending | 5 | jsdoc-auth, jsdoc-auth-client, jsdoc-transport, jsdoc-low-coverage, package-readme-template |

Generated docs: `./docs/` (2.7 MB HTML site, built from 21 packages with `npx typedoc`).
Style guide: `./DOCSTYLE.md`.

## Problem statement
Documentation in this monorepo is inconsistent and partly broken. Three layers need attention: (1) the root `README.md`, (2) per-package `README.md` files, (3) source-level JSDoc/TSDoc comments and the `typedoc.json` that drives the generated `docs/` site.

## Findings

### 1. `typedoc.json` (broken — top priority)
- References packages that **do not exist** in `packages/`:
  - `packages/filestore/src/index.ts` (no such package)
  - `packages/user-management/src/index.ts` (no such package — `UserManagement` is re-exported from `@zcatalyst/auth`)
- `filestore` is listed **twice** (duplicate entry on lines 3 and 8).
- Trailing comma after the last `entryPoints` item — invalid strict JSON.
- **Missing** existing publishable packages: `auth`, `auth-admin`, `auth-client`, `transport`, `utils`, `datastreams`.
- `docs/` only contains a stub `index.html`; no evidence the doc build is being run.

### 2. Root `README.md`
- "Available Services" table lists **Filestore** and **UserManagement** as separate components — neither exists as a package. UserManagement should be documented as an export of `@zcatalyst/auth`.
- "Usage in Serverless Functions" example imports `@zcatalyst/filestore` and calls `filestore.getAllFiles()` — won't run.
- Missing entries for `auth`, `auth-admin`, `auth-client`, `transport`, `utils`, `datastreams`.
- Install snippet only shows `@zcatalyst/auth`; "Choose your preferred package manager" line says "install the authentication module" but the section is generic.
- Coverage thresholds (50%) should be verified against `jest.config.base.js` before claiming them.

### 3. Per-package `README.md`
- Length and depth are wildly inconsistent: `utils` 60 lines, `auth` 912 lines, `datastore` 646 lines.
- `packages/datastreams/` has **no README, no `package.json`, no `src/`** — only `dist-*` outputs. Either drop it from the workspace or add proper sources/docs.
- No standard template — sections (Overview, Install, Quick Start, API, Examples, License) appear in different orders or are missing.

### 4. Source-level JSDoc / TSDoc

JSDoc file coverage (files with at least one `/** */` block / total `.ts` files in `src/`):

| Package | Coverage | Notes |
|---|---|---|
| functions | **0 / 3** | `Functions` class & `execute()` totally undocumented |
| auth-client | 1 / 8 | |
| zia | 1 / 4 | |
| mail | 1 / 4 | |
| smartbrowz | 1 / 4 | |
| circuit | 1 / 2 | |
| pipeline | 1 / 3 | |
| quick-ml | 1 / 2 | |
| zcql | 1 / 2 | |
| auth | 3 / 11 | `zcAuth.init`/`getApp` undocumented |
| auth-admin | 2 / 5 | |
| cache | 2 / 4 | |
| connector | 2 / 4 | |
| search | 2 / 3 | |
| datastore | 3 / 7 | |
| utils | 4 / 10 | |
| push-notification | 4 / 6 | |
| transport | 5 / 15 | core `Handler`, fetch/http handlers under-documented |
| job-scheduling | 5 / 7 | |
| stratus | 6 / 14 | |
| nosql | 10 / 12 | best-covered package |

Quality issues observed inside existing JSDoc blocks:
- **Redundant TS types in JSDoc** (`@param {string} id`) — TypeDoc/TSDoc convention is to omit types since TypeScript provides them.
- **Type drift**: `getTableDetails` JSDoc says `id: string | number` but signature is `id: string`. `table()` JSDoc shows `catalystApp.table(12345)` (number) for a `string` parameter.
- **Misleading examples**: many examples use `catalystApp.xyz(...)` although the methods live on the component class (e.g. `Datastore`, `Table`). New users won't have a `catalystApp` symbol to call.
- **No class-level docstrings** on most exported classes (e.g. `Datastore`, `Functions`, `Segment`, `Handler`).
- **No `@packageDocumentation` / module-level comment** in any `index.ts`, so TypeDoc shows empty package overviews.
- Inconsistent voice/punctuation across packages.
- Internal helpers in `utils` lack `@internal` markers, so they leak into generated docs even with `excludeInternal: true`.

## Proposed approach

Three workstreams, executed in this order so we don't re-document things twice:

**A. Fix `typedoc.json` and the docs build first** — everything downstream depends on TypeDoc actually being able to run.

**B. Standardise per-package READMEs** with a shared template; rewrite root README to match the real package list.

**C. Fill JSDoc gaps** package-by-package, starting with the worst-covered (`functions`, `auth`, `auth-client`, `transport`) and adopting a single style guide.

## Todos

1. **typedoc-fix** — Rewrite `typedoc.json`: remove `filestore` and `user-management`, deduplicate, fix trailing comma, add `auth`, `auth-admin`, `auth-client`, `transport`, `utils`, decide on `datastreams`. Verify `npx typedoc` runs clean and regenerates `docs/`.
2. **datastreams-decision** — Confirm whether `packages/datastreams` is intentional. If yes, restore `src/`, `package.json`, `README.md`. If no, remove from workspace.
3. **doc-style-guide** — Add a short `CONTRIBUTING`-section (or `docs/STYLE.md`) defining the JSDoc convention: no redundant `@param` types, mandatory `@example`, `@throws`, `@returns` on public APIs, `@internal` for non-exported helpers, `@packageDocumentation` in every `src/index.ts`.
4. **root-readme** — Update root `README.md`: correct "Available Services" table, replace broken Filestore example with a working one, add missing packages, verify coverage numbers against `jest.config.base.js`.
5. **package-readme-template** — Define a shared template (Overview / Install / Quick Start / API highlights / Links / License) and apply to all 21 package READMEs; trim oversized ones (`auth`, `datastore`, `push-notification`, `stratus`) and expand undersized ones (`utils`).
6. **jsdoc-functions** — Document `Functions` class + `execute()` (currently 0/3).
7. **jsdoc-auth** — Add class docs for `Authentication`, document `zcAuth.init`, `zcAuth.getApp`, browser/web variants.
8. **jsdoc-auth-client** — Bring 1/8 → full coverage on public exports.
9. **jsdoc-transport** — Document `Handler`, `IRequestConfig`, fetch/http handlers; this is consumed by every other package.
10. **jsdoc-low-coverage** — Sweep `zia`, `mail`, `smartbrowz`, `circuit`, `pipeline`, `quick-ml`, `zcql` to reach parity with `nosql`.
11. **jsdoc-fix-existing** — Correct the type-drift / `catalystApp.*` example issues in `datastore` and any other package re-using the same boilerplate.
12. **module-doc-comments** — Add `/** @packageDocumentation ... */` to every `src/index.ts` so TypeDoc shows a per-package overview.
13. **regenerate-docs** — Run TypeDoc after all the above; verify generated `docs/` is committed (or deliberately ignored) per repo policy.

## Notes / open questions
- Should `datastreams` be revived or removed? (see todo 2) ans: removed
- Is `docs/` meant to be checked into git, or built in CI? Currently committed but stub-only.ans:  built in CI
- Confirm the project still uses JSDoc-style `@param {type}` (legacy) or wants pure TSDoc — affects todo 3. ans: wants pure TSDoc
