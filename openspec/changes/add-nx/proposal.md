# Add Nx

## Why

The project is a single Angular CLI workspace where every `ng build` / `ng test` run starts from scratch. Adopting Nx adds computation caching and a consistent task runner now, and lays the foundation for scaling into a multi-project workspace (e.g., extracting the bracket-wheel or fixture-list features into libraries) later.

## What Changes

- Add Nx to the existing repo using the incremental adoption path (`nx init`), keeping the current single-app layout and `angular.json` intact.
- Add `nx.json` configuring cacheable targets (`build`, `test`) and their inputs/outputs so repeated runs with unchanged sources hit the cache.
- Route existing npm scripts (`start`, `build`, `watch`, `test`) through Nx so caching applies without changing developer muscle memory.
- Add the `nx` devDependency (and `@nx/angular` plugin) pinned to a version compatible with Angular 22.
- Add Nx cache directory (`.nx/`) to `.gitignore`.
- No application code, routes, or component behavior changes.

## Capabilities

### New Capabilities

- `nx-task-running`: Running, caching, and orchestrating workspace tasks (build, test, serve) through Nx, including cache invalidation on source changes and unchanged-input cache hits.

### Modified Capabilities

<!-- none — no existing capability's requirements change; quarterfinal-schedule is unaffected -->

## Impact

- **Dependencies**: adds `nx` and `@nx/angular` to `devDependencies`; no runtime dependencies change.
- **Config files**: new `nx.json`; possible minimal edits to `package.json` scripts and `.gitignore`; `angular.json` and `tsconfig*.json` remain the source of truth for the app.
- **Developer workflow**: `npm start`, `npm run build`, `npm test` keep working; `nx build wc2026` / `nx test wc2026` become available with caching.
- **CI**: unaffected initially; cache benefits apply locally, and remote caching (Nx Cloud) is explicitly out of scope for this change.
- **Application behavior**: none — build output and test results must be identical before and after.
