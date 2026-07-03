/**
 * Top 50 ranking parser for issue HTML — extracted from inject-issue-seo.mjs
 * so it can be fixture-tested without triggering the injector on import.
 */

export function decodeEntities(s) {
  return String(s)
    .replace(/<[^>]+>/g, '') // strip any inline tags inside the cell
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

/**
 * Parse the Top 50 ranking from issue HTML -> [{position, name}].
 *
 * Issue HTML spans several template generations with inconsistent markup
 * (#014: td.rank + classless channel td; #002/#007–#013: td.rank-num, with
 * #006/#013 using td.channel-cell; #001/#003–#005: older templates). Rather
 * than match one fixed cell pattern, this walks each <tr> and pulls a rank
 * cell (class rank|rank-num) and a channel cell (class channel-cell, else the
 * first classless <td>, else the td right after the rank). It then VALIDATES
 * that the result is a contiguous 1..N with N>=40 — if the top rows are
 * rendered outside the table (giving e.g. 47 rows starting at position 4) the
 * parse is rejected and the ItemList is omitted, rather than emit broken
 * structured data.
 */
export function parseTop50(html) {
  // Find the ranking table: prefer the known class, else any table whose
  // header row mentions both Channel and Score.
  let table = html.match(/<table[^>]*class="[^"]*top50-table[^"]*"[^>]*>([\s\S]*?)<\/table>/i);
  if (!table) {
    for (const t of html.matchAll(/<table[\s\S]*?<\/table>/gi)) {
      if (/>\s*Channel\s*</i.test(t[0]) && />\s*Score\s*</i.test(t[0])) {
        table = [t[0], t[0]];
        break;
      }
    }
  }
  if (!table) return [];

  // Column-position parse: every ranking table is Rank | Channel | Score |
  // Genre | Movement, so the channel is the cell immediately after the cell
  // whose text is the (pure-integer) rank. This is robust to the differing
  // cell CLASSES across templates (rank vs rank-num, classed vs classless
  // channel) — class-based heuristics mis-grabbed genre/movement cells.
  const items = [];
  for (const row of table[1].matchAll(/<tr[\s\S]*?<\/tr>/gi)) {
    const cells = [...row[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) =>
      decodeEntities(c[1]),
    );
    const ri = cells.findIndex((c) => /^\d+$/.test(c.trim()));
    if (ri === -1 || ri + 1 >= cells.length) continue;
    // Some templates embed a movement annotation in the channel cell
    // (e.g. "Defunctland (Prev. #32)") — strip a trailing parenthetical.
    const name = cells[ri + 1]
      .trim()
      .replace(/\s*\((?:prev\.?|previously|was|new|re-?eval)\b[^)]*\)\s*$/i, '')
      .trim();
    if (name && !/^\d+$/.test(name)) {
      items.push({ position: Number(cells[ri].trim()), name });
    }
  }

  // Validate: contiguous 1..N, N>=40. Otherwise reject (omit ItemList).
  items.sort((a, b) => a.position - b.position);
  if (items.length < 40) return [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].position !== i + 1) return [];
  }
  return items;
}
