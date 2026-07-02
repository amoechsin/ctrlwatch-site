#!/usr/bin/env node
// Pull GoatCounter campaign analytics into an issue's distribution pack tracking table.
//   Usage: node scripts/promote-status.mjs <issue-number>  (e.g. 001)
//   Or:    npm run promote:status -- 001
//
// Requires: GOATCOUNTER_TOKEN env var (create at https://ctrlwatch.goatcounter.com/user/api)
//
// Reads marketing/issue-NNN-distribution.md, fetches /api/v0/stats/campaigns from
// GoatCounter, maps each table row's Source to its visit count, and rewrites the
// "Visits at 48h" column in place. Preserves Notes column.

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const GC_BASE = "https://ctrlwatch.goatcounter.com";
const HISTORY_START = "2025-01-01T00:00:00Z";

function die(msg) {
  console.error(msg);
  process.exit(1);
}

async function fetchCampaigns(token) {
  const url = new URL("/api/v0/stats/campaigns", GC_BASE);
  url.searchParams.set("start", HISTORY_START);
  url.searchParams.set("limit", "100");

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    die(
      `GoatCounter API error: ${res.status} ${res.statusText}\n${body.slice(0, 500)}`,
    );
  }

  const json = await res.json();
  // Response shape: { stats: [{ id, name, count, ... }], more: bool }
  // `name` is the utm_source value, `count` is total pageviews.
  const map = new Map();
  for (const row of json.stats ?? []) {
    if (row.name) map.set(row.name, row.count ?? 0);
  }
  return map;
}

function updateTable(md, counts) {
  // Find the tracking table: a markdown table whose header row contains "Source" and "Visits".
  const lines = md.split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (
      /^\|\s*Source\s*\|/.test(lines[i]) &&
      /Visits/i.test(lines[i]) &&
      /Notes/i.test(lines[i])
    ) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) {
    die("Could not find tracking table (header `| Source | Visits ... | Notes |`).");
  }

  // Separator line is headerIdx+1; data rows follow until a non-table line.
  let updatedRows = 0;
  for (let i = headerIdx + 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith("|")) break;

    const cells = line.split("|").map((c) => c.trim());
    // Expected: ["", "<source>", "<visits>", "<notes>", ""]
    if (cells.length < 4) continue;
    const source = cells[1];
    if (!source) continue;

    const count = counts.get(source);
    const visitCell = count == null ? cells[2] || "—" : String(count);
    const notesCell = cells[3] ?? "";

    lines[i] = `| ${source} | ${visitCell} | ${notesCell} |`;
    if (count != null) updatedRows++;
  }

  return { md: lines.join("\n"), updatedRows };
}

async function main() {
  const issue = process.argv[2];
  if (!issue || !/^\d{3}$/.test(issue)) {
    die("Usage: node scripts/promote-status.mjs <NNN>  (e.g. 001)");
  }

  const token = process.env.GOATCOUNTER_TOKEN;
  if (!token) {
    die(
      "GOATCOUNTER_TOKEN env var not set.\n" +
        "Create a token at https://ctrlwatch.goatcounter.com/user/api\n" +
        "Then: export GOATCOUNTER_TOKEN=<token>",
    );
  }

  const path = resolve("marketing", `issue-${issue}-distribution.md`);
  let md;
  try {
    md = await readFile(path, "utf8");
  } catch {
    die(`No distribution pack found at ${path}`);
  }

  console.log(`Fetching campaign stats from GoatCounter...`);
  const counts = await fetchCampaigns(token);
  console.log(`Got ${counts.size} campaign source(s) from API.`);

  const { md: updated, updatedRows } = updateTable(md, counts);
  await writeFile(path, updated, "utf8");

  console.log(`Updated ${updatedRows} row(s) in ${path}.`);
  if (updatedRows === 0) {
    console.log(
      `\nNo matching sources found. Either no traffic yet, or the UTM tags in the table\n` +
        `don't match what's been clicked. Check https://ctrlwatch.goatcounter.com → Campaigns.`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
