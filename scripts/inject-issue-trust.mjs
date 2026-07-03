#!/usr/bin/env node
/**
 * Replace each issue's blanket legal line ("CTRL+WATCH is a work of satirical
 * fiction…") with the per-section trust legend. The old line over-disclaimed
 * the real reviews and under-disclaimed the fictional sections; the legend
 * says exactly which is which, matching the legend in Footer.astro.
 *
 * Adds a `<!-- ctrlwatch:trust:start -->` … `:end -->` fenced block.
 * Anchor: replaces the `<p class="legal">…</p>` element where one exists;
 * issues without one get the block immediately before </footer>, falling back
 * to </body>. Fully inline-styled.
 *
 * Idempotent: re-running replaces the fenced block. `npm run inject:trust`.
 */

import { runIssueInjector } from './lib/fenced-inject.mjs';

const START_MARK = '<!-- ctrlwatch:trust:start -->';
const END_MARK = '<!-- ctrlwatch:trust:end -->';

const LEGAL_RE = /<p class="legal">[\s\S]*?<\/p>/i;
// #013 variant: bare disclaimer sentences inside <div class="footer-text">.
// Match stops before the © line so it survives the replacement.
const FOOTER_TEXT_RE =
  /CTRL\+WATCH is a work of satirical fiction\.[\s\S]*?fictional constructs created for this publication\.<br>\s*/i;

function buildBlock() {
  const line = (tag, color, text) =>
    `<span style="display:inline-block;border:1px solid ${color};color:${color};` +
    `padding:1px 5px;margin-right:6px;font-size:9px;letter-spacing:0.08em;">${tag}</span>${text}`;

  return [
    START_MARK,
    '<div style="margin:24px 0 0;font-family:\'Share Tech Mono\',monospace;font-size:11px;' +
      'color:#9090A0;line-height:2.1;text-align:left;">' +
      '<div style="font-family:\'Press Start 2P\',monospace;font-size:9px;letter-spacing:0.1em;' +
      'color:#9090A0;margin-bottom:8px;">WHAT\'S REAL HERE</div>' +
      line('REVIEWS · TOP 50 · BOSS FIGHTS', '#39FF14', 'Real channels. Real scores. Real opinions.') + '<br>' +
      line('TIME CAPSULE', '#00F0FF', 'Fiction. The dead did not sit for interviews.') + '<br>' +
      line('LETTERS &amp; STAFF', '#00F0FF', 'Dramatized. Yob is a green blob.') + '<br>' +
      line('NOW LOADING · RETRO ADS', '#00F0FF', 'Satire.') + '<br>' +
      line('HIDDEN LEVELS (#001–#016)', '#00F0FF', 'Fictional channels. Real small-channel picks from #017 onward.') +
      '<div style="margin-top:8px;"><a href="/about#how-this-is-made" style="color:#9090A0;">' +
      'How this magazine is made →</a></div>' +
      '</div>',
    END_MARK,
  ].join('\n');
}

function place(html, block, issue) {
  if (LEGAL_RE.test(html)) {
    return html.replace(LEGAL_RE, block);
  }
  if (FOOTER_TEXT_RE.test(html)) {
    return html.replace(FOOTER_TEXT_RE, block + '\n');
  }
  const at = html.indexOf('</footer>') !== -1 ? html.indexOf('</footer>') : html.lastIndexOf('</body>');
  if (at === -1) {
    console.warn(
      `! public/issues/${issue.slug}/index.html — no legal line, footer-text, <footer>, or </body> anchor, skipping`,
    );
    return null;
  }
  return html.slice(0, at) + block + '\n' + html.slice(at);
}

// Fence stays where it is on refresh; strip any legacy disclaimer a previous
// run's anchor miss left behind elsewhere.
function onRefresh(html) {
  return html.replace(LEGAL_RE, '').replace(FOOTER_TEXT_RE, '');
}

await runIssueInjector({ startMark: START_MARK, endMark: END_MARK, buildBlock, place, onRefresh });
