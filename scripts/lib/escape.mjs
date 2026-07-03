/**
 * Shared escaping for the injector family and cover pipeline.
 *
 * escapeHtml escapes &, <, >, " — enough for text nodes and double-quoted
 * attributes, which is all the injectors emit. Single quotes are deliberately
 * NOT escaped: the historical per-script copies didn't escape them either,
 * and widening the set would churn every committed fenced block in the issue
 * HTML for no safety gain.
 */
export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** XML flavor (adds apostrophe) — used by the SVG cover furniture. */
export function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
