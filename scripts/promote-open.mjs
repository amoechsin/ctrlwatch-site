#!/usr/bin/env node
// Open all pre-fill submit URLs for an issue's distribution pack in the default browser.
//   Usage: node scripts/promote-open.mjs <issue-number>  (e.g. 001)
//   Or:    npm run promote:open -- 001
//
// Reads marketing/issue-NNN-distribution.md and opens every Reddit submit URL, HN
// submitlink URL, and YouTube channel /about URL it finds. xdg-open on Linux,
// `open` on macOS, `start` on Windows.

import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { platform } from "node:os";
import { setTimeout as sleep } from "node:timers/promises";

const PROMO_URL_RE =
  /https:\/\/(?:www\.reddit\.com\/r\/[^/\s)]+\/submit\?[^\s)>"`]+|news\.ycombinator\.com\/submitlink\?[^\s)>"`]+|www\.youtube\.com\/@[^/\s)]+\/about)/g;

function openerCommand() {
  switch (platform()) {
    case "darwin":
      return { cmd: "open", args: [] };
    case "win32":
      return { cmd: "cmd", args: ["/c", "start", ""] };
    default:
      return { cmd: "xdg-open", args: [] };
  }
}

function openUrl(url) {
  const { cmd, args } = openerCommand();
  const child = spawn(cmd, [...args, url], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}

async function main() {
  const issue = process.argv[2];
  if (!issue || !/^\d{3}$/.test(issue)) {
    console.error("Usage: node scripts/promote-open.mjs <NNN>  (e.g. 001)");
    process.exit(1);
  }

  const path = resolve("marketing", `issue-${issue}-distribution.md`);
  let md;
  try {
    md = await readFile(path, "utf8");
  } catch {
    console.error(`No distribution pack found at ${path}`);
    console.error(`Generate one first with the ctrlwatch-promoter agent.`);
    process.exit(1);
  }

  const urls = [...new Set(md.match(PROMO_URL_RE) ?? [])];
  if (urls.length === 0) {
    console.error(`No promo URLs found in ${path}.`);
    console.error(
      `Regenerate the pack with the updated ctrlwatch-promoter agent to get one-click submit URLs.`,
    );
    process.exit(1);
  }

  console.log(`Opening ${urls.length} tab(s) for issue ${issue}:`);
  for (const url of urls) {
    const label =
      url.includes("reddit.com") ? "reddit"
      : url.includes("ycombinator.com") ? "hn    "
      : url.includes("youtube.com") ? "yt    "
      : "?     ";
    const short = url.length > 100 ? url.slice(0, 97) + "..." : url;
    console.log(`  [${label}] ${short}`);
    openUrl(url);
    await sleep(250);
  }
  console.log(`\nReview each tab and hit Submit / Send when you're ready.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
