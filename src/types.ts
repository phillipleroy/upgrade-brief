export const roles = ["platform-owner", "architect", "developer", "product-manager"] as const;
export const products = ["Platform", "Creator & Development", "ITSM", "CMDB & ITOM", "Next Experience", "SPM"] as const;
export const classifications = ["risk", "change", "opportunity", "deprecation"] as const;
export const priorities = ["critical", "high", "medium", "informational"] as const;
export const monthlyChangeTypes = ["new", "changed", "fixed", "removed", "patch"] as const;
export const releaseKinds = ["store-application", "platform-patch"] as const;

export type Role = (typeof roles)[number];
export type Product = (typeof products)[number];
export type Classification = (typeof classifications)[number];
export type Priority = (typeof priorities)[number];
export type Focus = "all" | "risks" | "opportunities";
export type ViewMode = "upgrade" | "monthly";
export type MonthlyFocus = "all" | "actions" | "new" | "fixes";
export type MonthlyChangeType = (typeof monthlyChangeTypes)[number];
export type ReleaseKind = (typeof releaseKinds)[number];

export interface ReleaseEntry {
  id: string;
  title: string;
  releaseFrom: "Zurich";
  releaseTo: "Australia";
  products: Product[];
  roles: Role[];
  classification: Classification;
  priority: Priority;
  officialSummary: string;
  editorialImplication: string;
  recommendedActions: string[];
  source: { title: string; url: string; verifiedAt: string };
}

export interface MonthlyReleaseEntry {
  id: string;
  title: string;
  month: string;
  releaseKind: ReleaseKind;
  application: string;
  version: string;
  products: Product[];
  roles: Role[];
  changeType: MonthlyChangeType;
  priority: Priority;
  officialSummary: string;
  editorialImplication: string;
  recommendedActions: string[];
  familyCompatibility: string[];
  source: { title: string; url: string; verifiedAt: string };
}
