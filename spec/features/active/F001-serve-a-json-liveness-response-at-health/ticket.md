---
opened: 2026-10-29
---

# F001 · Serve a JSON liveness response at /health

## Outcome

An operator can GET `/health` and receive HTTP 200 with JSON `{"status":"ok"}` without booting Angular or contacting upstream services. This Angular-only app has no backend; this is static serving liveness, not readiness or dependency health.

## Scope

- Use the existing Angular asset/build and development serving mechanisms; inspect `project.json`, `public/`, and existing Vitest tests first.
- Make the exact `/health` URL return JSON, not the SPA HTML fallback, in local development and from the production build using a documented compatible static serving configuration.
- Add automated regression coverage and document usage, response contract, serving requirements, and limitations.

## Out of scope

- Introducing an application backend, dependency probes, authentication, metrics, or unrelated UI changes.
- Merging, pushing, deploying, installing global tools, or changing external hosting settings.

## Acceptance

- GET `/health` returns HTTP 200, a JSON-compatible Content-Type, and exactly the parsed object `{"status":"ok"}`; the response is not HTML and requires no JavaScript execution.
- The health resource is included in the production output; document any static host mapping/MIME requirements honestly rather than implying arbitrary hosts support them.
- Tests cover the response contract and guard against a missing health asset / SPA HTML fallback; include repeatable HTTP smoke checks for both the local dev server and a compatible production-output server.
- Run the full existing non-watch unit test suite and production build; record commands, results, and any pre-existing failures or warnings.
- Existing root app serving remains functional. No sensitive runtime/configuration data is exposed.
- Keep changes small, commit implementation on the worker branch, and report commit SHA, changed files, test evidence, and unresolved checks. Do not merge, push, or deploy.

## Notes

- Repository inspection: Angular 22 / Nx, `@angular/build:application`, assets copied from `public/`, `@angular/build:dev-server`, Vitest via `@angular/build:unit-test`; no backend or configured Angular routes.
- Human approval is required before merge, push, or deployment. Independent review follows the implementation and coordinator diff inspection.
