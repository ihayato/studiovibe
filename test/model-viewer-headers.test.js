import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../worker.prod-20260918.js', import.meta.url), 'utf8');
const start = source.indexOf('var SECURITY_HEADERS = {');
const end = source.indexOf('\n__name(withSecurityHeaders,', start);
assert.ok(start >= 0 && end > start);
const context = vm.createContext({ Response, Headers, BOTID_PREFIX: '/botid-test/' });
vm.runInContext(source.slice(start, end), context);
const apply = context.withSecurityHeaders;

test('versioned model viewers permit same-origin embedding and keep response data', async () => {
  for (const path of ['/luna-occulta/media/models/xiaolan-20261005/', '/luna-occulta/media/models/anne-20261005/index.html']) {
    const response = apply(new Response('viewer', {status: 200, headers: {'content-type': 'text/html', 'cache-control': 'public, max-age=0'}}), path);
    assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.equal(response.headers.get('content-security-policy'), "frame-ancestors 'self'");
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('cache-control'), 'public, max-age=0');
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'viewer');
  }
});

test('other pages, nested routes, and files retain embedding denial', () => {
  for (const path of ['/', '/luna-occulta/fanworks/models', '/luna-occulta/api/en/email/checkin', '/luna-occulta/media/models/', '/luna-occulta/media/models/xiaolan-20261005/bundle.js', '/luna-occulta/media/models/xiaolan-20261005/other.html', '/luna-occulta/media/models/xiaolan-20261005/nested/index.html', '/luna-occulta/media/models/xiaolan/index.html', '/luna-occulta/media/models/xiaolan-20261005/index.html/extra']) {
    const response = apply(new Response('other'), path);
    assert.equal(response.headers.get('x-frame-options'), 'DENY', path);
    assert.equal(response.headers.get('content-security-policy'), null, path);
  }
});

test('viewer exception preserves unrelated CSP directives and replaces only frame ancestors', () => {
  const response = apply(new Response('viewer', {headers: {'content-security-policy': "default-src 'self'; frame-ancestors 'none'; script-src 'self'; object-src 'none'"}}), '/luna-occulta/media/models/anne-20261005/');
  assert.equal(response.headers.get('content-security-policy'), "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'self'");
});

test('existing BotID exception remains unchanged', () => {
  const response = apply(new Response('challenge', {status: 404}), '/botid-test/challenge');
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(response.headers.get('content-security-policy'), "frame-ancestors 'self'");
});
