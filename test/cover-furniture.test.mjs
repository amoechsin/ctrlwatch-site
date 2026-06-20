import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeXml } from '../scripts/lib/cover-palette.mjs';
import { starPath, frame, buildFurnitureSvg, buildBackgroundSvg, MAX_FLASHES } from '../scripts/lib/cover-furniture.mjs';

test('escapeXml escapes the five XML entities', () => {
  assert.equal(escapeXml('A & B <c>'), 'A &amp; B &lt;c&gt;');
  assert.equal(escapeXml(`"quote" 'apos'`), '&quot;quote&quot; &apos;apos&apos;');
  assert.equal(escapeXml('plain text'), 'plain text');
});

test('starPath emits 2*spikes vertices, closed', () => {
  const d = starPath(10, 90, 30);
  assert.ok(d.startsWith('M'));
  assert.ok(d.trimEnd().endsWith('Z'));
  assert.equal((d.match(/L/g) || []).length, 19); // 20 points → M + 19 L
});

test('frame classifies aspect and shrinks the logo on wide targets', () => {
  assert.equal(frame(1080, 1440).aspect, 'portrait');
  assert.equal(frame(1080, 1080).aspect, 'square');
  assert.equal(frame(1200, 630).aspect, 'wide');
  assert.ok(frame(1200, 630).logoSize < frame(1080, 1440).logoSize);
});

const SAMPLE = {
  slug: '016', number: '#016', date: 'July 2026', title: 'THE GAMING ISSUE',
  coverColor: '#00F0FF', price: '£4.99',
  coverLines: ['▶ BOSS FIGHT: A vs B'],
};

test('buildFurnitureSvg returns wrapped svg with logo + escaped title', () => {
  const { svg, warnings } = buildFurnitureSvg({ ...SAMPLE, title: 'TASTE & TECH' }, { width: 1080, height: 1440 });
  assert.ok(svg.startsWith('<svg'));
  assert.ok(svg.trimEnd().endsWith('</svg>'));
  assert.ok(svg.includes('CTRL'));
  assert.ok(svg.includes('TASTE &amp;')); // & escaped (title may wrap across lines)
  assert.equal(warnings.length, 0);
});

test('buildFurnitureSvg caps flashes at MAX_FLASHES and warns', () => {
  const flashes = Array.from({ length: 8 }, (_, i) => ({ kind: 'tab', text: `F${i}`, color: '#FFE600' }));
  const { svg, warnings } = buildFurnitureSvg({ ...SAMPLE, flashes }, { width: 1080, height: 1440 });
  assert.equal(warnings.length, 1);
  assert.equal((svg.match(/data-flash="1"/g) || []).length, MAX_FLASHES);
});

test('buildBackgroundSvg sizes to target', () => {
  const svg = buildBackgroundSvg({ width: 1200, height: 630, coverColor: '#FF00AA' });
  assert.ok(svg.includes('width="1200"'));
  assert.ok(svg.includes('height="630"'));
});
