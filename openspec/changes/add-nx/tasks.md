# Tasks: Add Nx

## 1. Install and initialize Nx

- [ ] 1.1 Check the Nx↔Angular compatibility matrix and pick the latest Nx version supporting Angular 22
- [ ] 1.2 Run `nx init` (non-interactive where possible), declining Nx Cloud
- [ ] 1.3 Verify `nx.json` was created and `nx` (plus `@nx/angular` if added) is pinned in `devDependencies` at matching versions
- [ ] 1.4 Confirm `angular.json` was not modified and Nx detects the `wc2026` project (`nx show project wc2026`)

## 2. Configure caching and scripts

- [ ] 2.1 Configure `nx.json` `targetDefaults`: `cache: true` for `build` and `test`, with `build` outputs pointing at `dist/wc2026`
- [ ] 2.2 Ensure the `test` target runs Vitest in single-run (non-watch) mode so caching is safe
- [ ] 2.3 Update `package.json` scripts to delegate to Nx (`start` → `nx serve`, `build` → `nx build`, `test` → `nx test`, `watch` → uncached watch build), keeping the `ng` script
- [ ] 2.4 Add `.nx/` to `.gitignore`

## 3. Verify behavior parity and caching

- [ ] 3.1 Run `nx build wc2026` and confirm the bundle appears in `dist/` identical in structure to the pre-Nx build
- [ ] 3.2 Run `nx build wc2026` a second time with no changes and confirm it reports a cache hit
- [ ] 3.3 Modify a file under `src/`, rerun the build, and confirm Nx re-executes instead of using the cache
- [ ] 3.4 Run `nx test wc2026` and confirm the Vitest suite passes; rerun to confirm a cache hit
- [ ] 3.5 Run `npm start`, `npm run build`, and `npm test` to confirm existing scripts still work
- [ ] 3.6 Run `git status` after task runs to confirm no `.nx/` files are tracked
