## SDK Refactoring & Quality Improvements

Comprehensive refactoring of the Catalyst JavaScript SDK with **major authentication flow revamp**, documentation improvements, and code quality enhancements.

---

### 🔐 Authentication Flow Revamp (Major)

**Complete restructure of authentication architecture:**

**New package split:**
- `@zcatalyst/auth-admin` - Server-side (Node.js) Catalyst app initialization, credential management, and admin-scoped authentication
  - CatalystApp initialization from request headers
  - Multiple credential types: RefreshToken, AccessToken, Ticket, ApplicationDefault
  - Environment-based config loading (headers, catalystHeaders, custom credentials)
  - Multi-app instance management with named apps
  
- `@zcatalyst/auth-client` - Browser-side credential, token, CSRF, and session management
  - Replaced monolithic ConfigManager with lightweight ConfigStore
  - Session synchronization utilities (JWT expiry, Stratus JWT lifecycle)
  - CSRF token collection and validation
  - Project config initialization from `/catalyst-sdk/sdk/init`

**Unified `@zcatalyst/auth` entry point:**
- **Dual entry points** for Node vs Browser:
  - `node.ts` - Dynamically imports `@zcatalyst/auth-admin` for server-side
  - `web.ts` - Browser authentication flows (sign-in, sign-up, sign-out, session management)
  - `index.browser.ts` - Browser bundle entry (auto-resolved by bundlers)
- **Merged user-management** - `UserManagement` class integrated into main auth package
- **Single `zcAuth` API** - Consistent initialization across Node and Browser

**Key improvements:**
- Eliminated 700+ lines from auth-client by removing redundant ConfigManager
- Fixed credential scope validation (admin vs user credential mismatch checks)
- Improved error handling with specific CatalystAuthError types
- SSR-safe browser detection (`typeof window === 'undefined'`)
- Dynamic import pattern for auth-admin (reduces browser bundle size)

---

### 🏗️ Package Restructure

### 🏗️ Package Restructure

**Authentication packages (see above for details):**
- Created `@zcatalyst/auth-admin` and `@zcatalyst/auth-client`
- Restructured `@zcatalyst/auth` with dual entry points
- Merged `@zcatalyst/user-management` into `@zcatalyst/auth`

**Other consolidations:**
- `@zcatalyst/filestore` - Replaced by `@zcatalyst/stratus` 
- `@zcatalyst/search` - Search APIs moved to `@zcatalyst/datastore`
- `@zcatalyst/zcql` - ZCQL APIs moved to `@zcatalyst/datastore`
- Removed stale `datastreams` artifacts

**Renamed:**
- `packages/pipeline` → `packages/pipelines` (aligns with package name `@zcatalyst/pipelines`)
- `Pipeline` class → `Pipelines` class

---

### 📚 Documentation Improvements

**Root README:**
- Simplified service descriptions - now focuses on what each package does rather than marketing copy
- Added **Scope & Environment** table showing which packages are admin-only vs dual-scope (admin + user)
- Added **Testing** section with test commands and conventions
- Updated all examples to use current package structure
- Fixed package references (`@zcatalyst/filestore` → `@zcatalyst/stratus`, etc.)

**Package READMEs:**
- Added **Operation Scope** tables to dual-scope packages (auth, datastore, functions, push-notification, stratus) showing which methods are admin-only vs user-accessible
- Marked `auth-admin` and `auth-client` as internal packages ("Consumed transitively. Do not install directly.")
- Updated environment statements for 11 admin-only packages
- Added comprehensive credential type examples to `auth-admin` README
- Fixed 53 broken Catalyst documentation links (URL structure updates)
- Removed boilerplate "exception information + metadata" text from 11 READMEs
- Fixed job-scheduling Prerequisites (Job Pools mandatory; Functions optional)

**Code Documentation:**
- Added full TSDoc to ~419 public methods across all 19 packages
- Each method now has: description, @param, @returns, @throws, @example
- Improved inline code comments and examples

---

### 🔧 Package Configuration

**Modern bundling standards:**
- Removed redundant `browser` field from auth, datastore, push-notification (kept only in stratus/transport for Node builtin stubs)
- Added `"sideEffects": false` to 6 dual packages for better tree-shaking
- Added full conditional exports map to stratus package
- Removed dead `browser`/`exports` from connector package
- Removed top-level `browser` field-map from functions package

**Test infrastructure:**
- Added Jest configuration for all packages
- Created base configs for Node vs Browser testing (`config/jest.config.base.*.js`)
- Added test setup files and utilities
- Improved test coverage across packages

---

### ✅ Quality Metrics

- **326 files changed**, 19,612 insertions(+), 12,949 deletions(-)
- **38 commits** in this branch
- All 19 packages build successfully
- 0 vulnerabilities in `pnpm audit`
- 18 Dependabot alerts resolved in lockfile
- Full TypeScript coverage with explicit return types

---

### 📦 Package Changes Summary

| Package | Status | Changes |
|---------|--------|---------|
| auth | Restructured | Combined user-management, added dual entry points (node.ts, web.ts, index.browser.ts) |
| auth-admin | New | Server-side credential and app initialization |
| auth-client | New | Browser token, CSRF, session management |
| stratus | Updated | Bug fixes, improved docs, full TSDoc |
| datastore | Updated | Added ZCQL/Search docs, scope tables |
| functions | Updated | Dual entry points, removed redundant browser config |
| push-notification | Updated | Scope tables, package config cleanup |
| pipelines | Renamed | pipeline → pipelines, class rename |
| filestore | Deleted | Functionality moved to stratus |
| search | Deleted | APIs moved to datastore |
| zcql | Deleted | APIs moved to datastore |
| All others | Updated | READMEs, TSDoc, link fixes, config cleanup |

---

### 🚀 Migration Notes

If you were using:
- `@zcatalyst/filestore` → migrate to `@zcatalyst/stratus`
- `@zcatalyst/search` → use `Datastore.executeSearchQuery()`
- `@zcatalyst/zcql` → use `Datastore.executeZCQLQuery()`
- `@zcatalyst/user-management` → use `@zcatalyst/auth` (UserManagement class)
- `Pipeline` class → use `Pipelines` class
