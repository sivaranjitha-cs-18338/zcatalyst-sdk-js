# Documentation Style Guide

This document defines the conventions used for source-level documentation
(JSDoc / TSDoc) and per-package READMEs across the `zcatalyst-sdk-js` monorepo.
The generated API reference is produced by [TypeDoc](https://typedoc.org/) from
the entry points listed in [`typedoc.json`](../typedoc.json).

## TSDoc / JSDoc conventions

We use TSDoc-flavoured JSDoc. Because we ship TypeScript types, **do not
duplicate type information** in tags.

### ✅ Do

```ts
/**
 * Retrieves a table instance without making an API call.
 *
 * @param id - The table ID or name.
 * @returns The table instance.
 * @throws {@link CatalystDataStoreError} When the provided ID is invalid.
 *
 * @example
 * ```ts
 * const datastore = new Datastore();
 * const users = datastore.table('Users');
 * ```
 */
table(id: string): Table { ... }
```

### ❌ Don't

```ts
/**
 * @param {string} id - The table ID or name.   // redundant {string}
 * @returns {Table} The table instance.         // redundant {Table}
 *
 * @example
 * const tableById = catalystApp.table(12345);  // wrong receiver, wrong type
 */
```

### Required tags on public APIs

Every exported class member that is part of the public API **must** have:

| Tag                | When                                                |
|--------------------|-----------------------------------------------------|
| Summary line       | Always — first line, terminated by a period.        |
| `@param name -`    | One per parameter, no type braces.                  |
| `@returns`         | When the function returns a value.                  |
| `@throws {@link}`  | When a typed error may be thrown.                   |
| `@example`         | At least one runnable snippet for non-trivial APIs. |

### Optional but encouraged

- `@remarks` — extra context that doesn't belong in the summary.
- `@see` — links to related symbols or external docs.
- `@deprecated` — with migration guidance.

### Internal symbols

Anything not part of the published API (helpers in `src/utils`, private fields,
re-exports used only by sibling packages) **must** be marked:

```ts
/** @internal */
export function buildPath(...) { ... }
```

`typedoc.json` sets `excludeInternal: true`, so these will be hidden from the
generated site.

### Module-level documentation

Every `src/index.ts` should begin with a module overview:

```ts
/**
 * Catalyst Datastore — relational data access for Catalyst applications.
 *
 * @packageDocumentation
 */
```

This becomes the landing page for the package in the generated docs.

### Examples

- Use realistic receivers (`const datastore = new Datastore();`), **not**
  the placeholder `catalystApp.*` left over from the legacy SDK.
- Examples should compile — no shorthand calls that wouldn't work in real code.
- Prefer ESM `import` syntax over `require`.

## Per-package README structure

To keep navigation predictable, every package README follows the same outline:

```
# @zcatalyst/<name>

<one-sentence description>

## Overview            (1–2 short paragraphs)
## Installation        (npm / yarn / pnpm)
## Quick Start         (smallest possible runnable snippet)
## API Highlights      (bullet list of main exports)
## Links               (Catalyst docs, API reference)
## License             (Apache-2.0)
```

Keep READMEs focused — long-form usage tutorials belong in the Catalyst
documentation site, not in package READMEs.

## Running the docs build

```bash
# from repository root
npx typedoc
# output is written to ./docs
```

CI does not currently publish the generated `docs/` folder; treat it as a
local artefact.
