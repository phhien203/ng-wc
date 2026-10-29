import assert from 'node:assert/strict';

// Use plain HTTP requests: no Angular bootstrap, browser, or upstream access.
const base = process.argv[2];
assert.ok(base, 'Usage: node scripts/check-health.mjs http://127.0.0.1:4200');

for (const pathname of ['/health', '/health?probe=1']) {
  const response = await fetch(new URL(pathname, base), { redirect: 'manual' });
  assert.equal(response.status, 200, `${pathname}: expected HTTP 200`);
  assert.match(
    response.headers.get('content-type') ?? '',
    /^application\/(?:[\w.-]+\+)?json(?:\s*;|$)/i,
    `${pathname}: expected JSON, not a missing asset or SPA HTML fallback`,
  );
  assert.deepEqual(await response.json(), { status: 'ok' }, `${pathname}: exact public contract`);
  console.log(`PASS ${pathname}: HTTP 200, JSON Content-Type, exactly {"status":"ok"}`);
}

const root = await fetch(new URL('/', base));
assert.equal(root.status, 200, '/: expected HTTP 200');
assert.match(root.headers.get('content-type') ?? '', /^text\/html(?:\s*;|$)/i);
assert.match(await root.text(), /<app-root\b/, '/: Angular app shell must remain available');
console.log('PASS /: HTTP 200, HTML app shell');
