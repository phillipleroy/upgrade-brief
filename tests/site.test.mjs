import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");

test("production output contains product metadata", () => {
  assert.match(html, /ServiceNow Upgrade Briefing Generator/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("production assets use a repository-safe relative base", () => {
  assert.match(html, /(?:src|href)="\.\/assets\//);
});
