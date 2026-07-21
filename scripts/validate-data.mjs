import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "src/data/releaseEntries.json");
const entries = JSON.parse(fs.readFileSync(file, "utf8"));

const allowed = {
  roles: new Set(["platform-owner", "architect", "developer", "product-manager"]),
  products: new Set(["Platform", "Creator & Development", "ITSM", "CMDB & ITOM", "Next Experience", "SPM"]),
  classifications: new Set(["risk", "change", "opportunity", "deprecation"]),
  priorities: new Set(["critical", "high", "medium", "informational"]),
};
const errors = [];
const ids = new Set();

if (!Array.isArray(entries) || entries.length < 20 || entries.length > 30) {
  errors.push("Dataset must contain between 20 and 30 entries.");
}

for (const [index, entry] of entries.entries()) {
  const at = `Entry ${index + 1}${entry.id ? ` (${entry.id})` : ""}`;
  for (const key of ["id", "title", "releaseFrom", "releaseTo", "products", "roles", "classification", "priority", "officialSummary", "editorialImplication", "recommendedActions", "source"]) {
    if (entry[key] == null || entry[key] === "") errors.push(`${at}: missing ${key}.`);
  }
  if (ids.has(entry.id)) errors.push(`${at}: duplicate id.`);
  ids.add(entry.id);
  if (!/^[a-z0-9-]+$/.test(entry.id ?? "")) errors.push(`${at}: id must be lowercase kebab-case.`);
  if (entry.releaseFrom !== "Zurich" || entry.releaseTo !== "Australia") errors.push(`${at}: unsupported release path.`);
  if (!Array.isArray(entry.products) || !entry.products.length || entry.products.some((value) => !allowed.products.has(value))) errors.push(`${at}: invalid products.`);
  if (!Array.isArray(entry.roles) || !entry.roles.length || entry.roles.some((value) => !allowed.roles.has(value))) errors.push(`${at}: invalid roles.`);
  if (!allowed.classifications.has(entry.classification)) errors.push(`${at}: invalid classification.`);
  if (!allowed.priorities.has(entry.priority)) errors.push(`${at}: invalid priority.`);
  if (!Array.isArray(entry.recommendedActions) || !entry.recommendedActions.length) errors.push(`${at}: at least one recommended action is required.`);
  try {
    const url = new URL(entry.source?.url);
    if (url.protocol !== "https:" || !url.hostname.endsWith("servicenow.com")) errors.push(`${at}: source must be an official HTTPS ServiceNow URL.`);
  } catch {
    errors.push(`${at}: invalid source URL.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.source?.verifiedAt ?? "")) errors.push(`${at}: invalid verification date.`);
  if (entry.officialSummary === entry.editorialImplication) errors.push(`${at}: official fact and editorial interpretation must be distinct.`);
}

for (const product of allowed.products) {
  if (!entries.some((entry) => entry.products.includes(product))) errors.push(`Missing coverage for ${product}.`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${entries.length} source-backed release entries.`);
