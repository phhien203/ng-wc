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

*Resolved during implementation (2026-07-08)*: current `nx init` unconditionally converts single-app Angular CLI workspaces to the Nx standalone format — it translated `angular.json` 1:1 into a root `project.json` and deleted `angular.json`. Decision (user-confirmed): keep the `project.json` conversion. The repo layout is otherwise untouched (no `apps/`/`libs/` churn).

### 2. ~~Keep `angular.json` as the source of truth~~ `project.json` is the source of truth

Superseded by the resolution in Decision 1: the root `project.json` now defines the `wc2026` project and its targets (`build`, `serve`, `test`), using the same `@angular/build` executors as before. The plain Angular CLI (`ng serve`, `ng generate`) no longer works without `angular.json`; the equivalents are `nx serve` and `nx g @schematics/angular:<schematic>`. The `ng` npm script is removed accordingly.

### 3. Cacheable targets and inputs in `nx.json`

Mark `build` and `test` as cacheable in `nx.json` (`targetDefaults` with `cache: true`). Inputs default to all project files plus root configs (`tsconfig*.json`, `angular.json`, `package-lock.json`), which is correct for a single-project repo. Outputs for `build` are `dist/wc2026` (from `angular.json`'s `outputPath`). `serve`/`watch` are long-running and never cached.

### 4. Route npm scripts through Nx

Rewrite `package.json` scripts to delegate to Nx (e.g., `"build": "nx build"`, `"test": "nx test"`, `"start": "nx serve"`), so cache benefits apply to the commands developers already type. ~~The `ng` script stays for direct CLI access.~~ *Amended*: the `ng` script is removed — the Angular CLI cannot run without `angular.json` (see Decision 2).

*Alternative considered*: leave scripts calling `ng` and rely on Nx's script wrapping. Delegating explicitly is clearer and guarantees cache participation.

### 5. Version selection

Install the latest Nx major that officially supports Angular 22 (verify with the Nx↔Angular compatibility matrix during implementation). Pin `nx` and `@nx/angular` to the same exact version — mixed Nx package versions are a common failure mode.

*Resolved during implementation (2026-07-08)*: no stable Nx release supports Angular 22 — `@nx/angular@23.0.1` caps peers at `< 22.0.0`. Angular 22 support ships in the 23.1 line, currently prerelease. Decision (user-confirmed): pin `nx` and `@nx/angular` to exactly `23.1.0-beta.7`; upgrade to 23.1 stable when released.

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

**Rollback**: revert the commit — restores `angular.json`, removes `project.json`, `nx.json`, `.npmrc`, script changes, and devDependencies, returning the workspace to the pre-Nx Angular CLI setup.

## Open Questions

- None blocking. Nx Cloud adoption and library extraction are deliberate follow-ups, not part of this change.
