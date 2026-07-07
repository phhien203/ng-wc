# Design: Add Nx

## Context

The repo is a single-app Angular 22 CLI workspace (`wc2026`) built with `@angular/build`, tested with Vitest, and managed with npm. There is no monorepo tooling; every build and test run executes from scratch. Nx offers incremental adoption for exactly this shape of project: it can layer computation caching over the existing Angular CLI setup without restructuring the repo.

## Goals / Non-Goals

**Goals:**
- Nx installed and functional: `nx build|test|serve wc2026` work and hit the cache on unchanged inputs.
- Zero change to application behavior, build output, or test results.
- Existing npm scripts keep working unchanged from the developer's point of view.

**Non-Goals:**
- Converting to an Nx-style workspace layout (`apps/`, `libs/`, `project.json` per project).
- Nx Cloud / remote caching, distributed task execution, or CI changes.
- Extracting features into libraries (possible follow-up, not this change).
- Adding lint targets or new tooling beyond what exists today.

## Decisions

### 1. Incremental adoption via `nx init`, not workspace migration

Run `npx nx@latest init` in the repo. This adds the `nx` package, generates `nx.json`, and leaves `angular.json` as the project definition (Nx reads Angular CLI workspaces natively via `@nx/angular`). 

*Alternative considered*: full migration with `@nx/angular:ng-add` / regenerating as an Nx workspace with `apps/` + `project.json`. Rejected for now — it churns every path in the repo for no immediate benefit on a single app, and can be done later if the workspace grows.

### 2. Keep `angular.json` as the source of truth

No `project.json` files. Nx infers the `wc2026` project and its targets (`build`, `serve`, `test`) from `angular.json`. This keeps the Angular CLI fully usable (`ng serve` etc. still work) and minimizes diff surface.

### 3. Cacheable targets and inputs in `nx.json`

Mark `build` and `test` as cacheable in `nx.json` (`targetDefaults` with `cache: true`). Inputs default to all project files plus root configs (`tsconfig*.json`, `angular.json`, `package-lock.json`), which is correct for a single-project repo. Outputs for `build` are `dist/wc2026` (from `angular.json`'s `outputPath`). `serve`/`watch` are long-running and never cached.

### 4. Route npm scripts through Nx

Rewrite `package.json` scripts to delegate to Nx (e.g., `"build": "nx build"`, `"test": "nx test"`, `"start": "nx serve"`), so cache benefits apply to the commands developers already type. The `ng` script stays for direct CLI access.

*Alternative considered*: leave scripts calling `ng` and rely on Nx's script wrapping. Delegating explicitly is clearer and guarantees cache participation.

### 5. Version selection

Install the latest Nx major that officially supports Angular 22 (verify with the Nx↔Angular compatibility matrix during implementation). Pin `nx` and `@nx/angular` to the same exact version — mixed Nx package versions are a common failure mode.

## Risks / Trade-offs

- [Nx version incompatible with Angular 22] → Check the compatibility matrix before installing; if the latest Nx doesn't yet support Angular 22, install the newest release that does.
- [Stale cache masks a real rebuild] → Rely on Nx's default input hashing which includes all project files and lockfile; document `nx reset` as the escape hatch.
- [Vitest test target not cache-safe (e.g., watch mode default)] → Ensure the cached `test` target runs in single-run mode; keep `watch` uncached.
- [Extra tooling layer for a single app] → Accepted: cost is one devDependency and one config file; benefit is caching now and a scaling path later.
- [`nx init` interactive prompts (Nx Cloud opt-in)] → Decline Nx Cloud; run with flags for non-interactive setup where available.

## Migration Plan

1. Run `nx init`, decline Nx Cloud, verify `nx.json` and dependency additions.
2. Configure cacheable targets, update npm scripts, extend `.gitignore` with `.nx/`.
3. Verify: `nx build wc2026` twice (second run cached), touch a source file and confirm re-execution, run `npm test` and `npm run build` to confirm parity.

**Rollback**: revert the commit — removes `nx.json`, script changes, and devDependencies; `angular.json` was never modified, so the Angular CLI workflow is untouched.

## Open Questions

- None blocking. Nx Cloud adoption and library extraction are deliberate follow-ups, not part of this change.
