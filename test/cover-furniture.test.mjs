import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeXml } from '../scripts/lib/cover-palette.mjs';

test('escapeXml escapes the five XML entities', () => {
  assert.equal(escapeXml('A & B <c>'), 'A &amp; B &lt;c&gt;');
  assert.equal(escapeXml(`"quote" 'apos'`), '&quot;quote&quot; &apos;apos&apos;');
  assert.equal(escapeXml('plain text'), 'plain text');
});
