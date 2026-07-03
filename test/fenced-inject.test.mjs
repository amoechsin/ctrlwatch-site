import { test } from 'node:test';
import assert from 'node:assert/strict';
import { replaceFenced } from '../scripts/lib/fenced-inject.mjs';

const S = '<!-- ctrlwatch:x:start -->';
const E = '<!-- ctrlwatch:x:end -->';
const block = (content) => `${S}\n${content}\n${E}`;

test('returns null when either mark is missing', () => {
  assert.equal(replaceFenced('<html></html>', S, E, block('a')), null);
  assert.equal(replaceFenced(`<html>${S}</html>`, S, E, block('a')), null);
});

test('replaces the full fence including stale content', () => {
  const html = `<body>before\n${block('OLD')}\nafter</body>`;
  const out = replaceFenced(html, S, E, block('NEW'));
  assert.ok(out.includes('NEW'));
  assert.ok(!out.includes('OLD'));
  assert.ok(out.startsWith('<body>before\n'));
  assert.ok(out.endsWith('\nafter</body>'));
});

test('re-running with the same block is byte-stable (idempotency)', () => {
  let html = `<body>${block('PAYLOAD')}</body>`;
  for (let i = 0; i < 3; i++) {
    html = replaceFenced(html, S, E, block('PAYLOAD'));
  }
  assert.equal(html, `<body>${block('PAYLOAD')}</body>`);
});

test('fence position never moves on refresh', () => {
  const html = `<a>${block('v1')}</a><b>anchor</b>`;
  const out = replaceFenced(html, S, E, block('v2'));
  assert.equal(out.indexOf(S), html.indexOf(S));
});
