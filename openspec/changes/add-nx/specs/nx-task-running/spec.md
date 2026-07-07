# nx-task-running

## ADDED Requirements

### Requirement: Nx runs workspace tasks
The workspace SHALL provide Nx as the task runner so that `nx build wc2026`, `nx test wc2026`, and `nx serve wc2026` execute the same underlying Angular builders as the existing `ng` commands.

#### Scenario: Build through Nx
- **WHEN** a developer runs `nx build wc2026`
- **THEN** the application builds with the same configuration and output as `ng build`, producing the bundle under `dist/`

#### Scenario: Test through Nx
- **WHEN** a developer runs `nx test wc2026`
- **THEN** the Vitest suite runs with the same results as `ng test`

### Requirement: Cacheable build and test targets
Nx SHALL cache the `build` and `test` targets, keyed on their input files, so repeated runs with unchanged inputs are served from the cache instead of re-executing.

#### Scenario: Cache hit on unchanged sources
- **WHEN** a developer runs `nx build wc2026` twice in a row without modifying any source or configuration file
- **THEN** the second run completes from the Nx cache and reports it was retrieved from cache

#### Scenario: Cache invalidation on source change
- **WHEN** a developer modifies a file under `src/` and runs `nx build wc2026` again
- **THEN** Nx re-executes the build instead of serving the stale cached output

### Requirement: Existing npm scripts keep working
The existing npm scripts (`start`, `build`, `watch`, `test`) SHALL continue to work after Nx adoption, preserving current developer workflows.

#### Scenario: npm scripts unchanged in behavior
- **WHEN** a developer runs `npm start`, `npm run build`, or `npm test`
- **THEN** each command performs its pre-Nx behavior (serve, production build, test run) successfully

### Requirement: Nx cache is not committed
The Nx local cache and workspace-data directory (`.nx/`) SHALL be excluded from version control.

#### Scenario: Cache directory ignored by git
- **WHEN** Nx tasks have run and populated `.nx/`
- **THEN** `git status` shows no untracked or modified files from the `.nx/` directory
