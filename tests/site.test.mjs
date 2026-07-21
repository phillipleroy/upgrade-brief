import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const monthlyEntries = JSON.parse(fs.readFileSync(new URL("../src/data/monthlyReleaseEntries.json", import.meta.url), "utf8"));
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

test("monthly archive contains a balanced, source-backed July launch edition", () => {
  assert.equal(monthlyEntries.length, 15);
  assert.deepEqual(new Set(monthlyEntries.map((entry) => entry.month)), new Set(["2026-07"]));
  assert.deepEqual(
    new Set(monthlyEntries.flatMap((entry) => entry.products)),
    new Set(["Platform", "Creator & Development", "ITSM", "CMDB & ITOM", "Next Experience", "SPM"]),
  );
  assert.ok(monthlyEntries.some((entry) => entry.releaseKind === "platform-patch"));
  assert.ok(monthlyEntries.some((entry) => entry.releaseKind === "store-application"));
  assert.ok(monthlyEntries.every((entry) => new URL(entry.source.url).hostname.endsWith("servicenow.com")));
});
