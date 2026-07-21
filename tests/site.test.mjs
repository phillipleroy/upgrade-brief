import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const monthlyEntries = JSON.parse(fs.readFileSync(new URL("../src/data/monthlyReleaseEntries.json", import.meta.url), "utf8"));

test("production output contains product metadata", () => {
  assert.match(html, /ServiceNow Upgrade Briefing Generator/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("production assets use a repository-safe relative base", () => {
  assert.match(html, /(?:src|href)="\.\/assets\//);
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
