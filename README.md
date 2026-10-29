# Wc2026

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.4.

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
npm test -- --watch=false
```

## Static liveness

`GET /health` returns HTTP 200, `Content-Type: application/json`, and exactly
`{"status":"ok"}`. It serves `public/health.json` without running Angular or
contacting upstream services. It reports static serving liveness only: it does
not check application startup, APIs, dependencies, or readiness. The payload
contains no runtime settings or secrets.

Local development uses `proxy.conf.cjs` to map only `/health` (also with query
parameters) to the JSON asset through Vite's static file middleware. No proxy
upstream or application backend is used. Restart the dev server after changing
this configuration. Check it from another terminal:

```bash
npm start -- --host 127.0.0.1
# In another terminal:
npm run smoke:health -- http://127.0.0.1:4200
```

The production build copies the resource to `dist/wc2026/browser/health.json`.
An arbitrary static host will NOT make `/health` work automatically. The host
must internally map the exact `/health` path to that file, set a JSON-compatible
Content-Type, and return 404 if it is missing. The mapping must run before any
SPA HTML fallback. A redirect to `/health.json`, an HTML fallback, or an
extensionless file served as `application/octet-stream` does not meet the
contract. The development proxy is not part of the production output.

`static/nginx.conf` is a compatible Nginx server configuration. With Docker
available, these commands serve the actual production output locally (not a
deployment):

```bash
npm run build -- --configuration=production
docker run --rm --name wc2026-health -p 127.0.0.1:8080:80 \
  -v "$PWD/dist/wc2026/browser:/usr/share/nginx/html:ro" \
  -v "$PWD/static/nginx.conf:/etc/nginx/conf.d/default.conf:ro" nginx:stable-alpine
# In another terminal:
npm run smoke:health -- http://127.0.0.1:8080
docker stop wc2026-health
```

The same HTTP regression check validates the status, MIME type, exact parsed
object, and root HTML app shell for both servers. It fails for missing assets,
HTML fallback, extra payload fields, redirects, or incorrect MIME types. It
uses no browser or JavaScript execution in the served page. Run it after changes
to the asset or host configuration. This does not prove arbitrary hosting
configurations or the Angular UI work; run the unit suite separately.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
