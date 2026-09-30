import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const monthlyEntries = JSON.parse(fs.readFileSync(new URL("../src/data/monthlyReleaseEntries.json", import.meta.url), "utf8"));
const australiaEntries = JSON.parse(fs.readFileSync(new URL("../src/data/releaseEntriesAustralia.json", import.meta.url), "utf8"));
const brazilEntries = JSON.parse(fs.readFileSync(new URL("../src/data/releaseEntriesBrazil.json", import.meta.url), "utf8"));
const appSource = fs.readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const radarSource = fs.readFileSync(new URL("../src/ImpactRadar.tsx", import.meta.url), "utf8");

test("production output contains product metadata", () => {
  assert.match(html, /Upgrade Brief — Release Intelligence/);
  assert.doesNotMatch(html, /ServiceNow Upgrade Brief & Monthly Release Radar/);
  assert.match(html, /og\.png/);
  assert.match(html, /og:image:width/);
  assert.match(html, /og:url/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("production assets use a repository-safe relative base", () => {
  assert.match(html, /(?:src|href)="\.\/assets\//);
});

test("impact radar provides interactive and accessible source-backed markers", () => {
  assert.match(radarSource, /Impact radar/);
  assert.match(radarSource, /role="img"/);
  assert.match(radarSource, /href={`#entry-\${entry\.id}`}/);
  assert.match(radarSource, /Priorities shown here are editorial guidance/);
});

test("family selector supports cumulative Zurich-to-Brazil briefings", () => {
  assert.equal(australiaEntries.length, 30);
  assert.equal(brazilEntries.length, 24);
  assert.ok(australiaEntries.every((entry) => entry.releaseFrom === "Zurich" && entry.releaseTo === "Australia"));
  assert.ok(brazilEntries.every((entry) => entry.releaseFrom === "Australia" && entry.releaseTo === "Brazil"));
  assert.match(appSource, /id="source-family"/);
  assert.match(appSource, /params\.get\("from"\)/);
  assert.match(appSource, /\[\.\.\.australiaEntries, \.\.\.brazilEntries\]/);
});

test("monthly archive contains balanced, source-backed July through September editions", () => {
  const expectedProducts = new Set(["Platform", "Creator & Development", "ITSM", "CMDB & ITOM", "Next Experience", "SPM"]);
  assert.equal(monthlyEntries.length, 38);
  assert.deepEqual(new Set(monthlyEntries.map((entry) => entry.month)), new Set(["2026-07", "2026-08", "2026-09"]));
  for (const month of ["2026-07", "2026-08", "2026-09"]) {
    const entries = monthlyEntries.filter((entry) => entry.month === month);
    assert.ok(entries.length >= 10);
    assert.deepEqual(new Set(entries.flatMap((entry) => entry.products)), expectedProducts);
  }
  assert.ok(monthlyEntries.some((entry) => entry.releaseKind === "platform-patch"));
  assert.ok(monthlyEntries.some((entry) => entry.releaseKind === "store-application"));
  assert.ok(monthlyEntries.every((entry) => new URL(entry.source.url).hostname.endsWith("servicenow.com")));
});
