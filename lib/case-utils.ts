export const caseCategories = [
  "network",
  "sim",
  "billing",
  "plan",
  "provisioning",
  "account",
  "other",
] as const;

export type CaseCategory = (typeof caseCategories)[number];

export const caseStatuses = [
  "open",
  "assigned",
  "in_progress",
  "pending_customer",
  "escalated",
  "resolved",
  "closed",
] as const;

export type CaseStatus = (typeof caseStatuses)[number];

export const casePriorities = ["low", "medium", "high", "critical"] as const;

export type CasePriority = (typeof casePriorities)[number];

export const supportTeams = [
  { value: "Network Support", label: "Network Support" },
  { value: "Billing Support", label: "Billing Support" },
  { value: "SIM Support", label: "SIM Support" },
  { value: "Technical Support", label: "Technical Support" },
  { value: "Enterprise Support", label: "Enterprise Support" },
] as const;

export function getCaseReference(id: string) {
  return `SR-${id.slice(-5).toUpperCase()}`;
}

export function formatCategoryLabel(category?: string | null) {
  if (!category) return "Network";
  const map: Record<string, string> = {
    network: "Network / Internet",
    sim: "SIM & Mobile",
    billing: "Billing & Invoices",
    plan: "Plan & Subscription",
    provisioning: "Service Activation",
    account: "Account & Access",
    other: "General Support",
  };
  return map[category.toLowerCase()] ?? formatCaseLabel(category);
}

export function inferCaseCategory(title: string, description?: string | null): CaseCategory {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  if (text.includes("bill") || text.includes("charg") || text.includes("invoice") || text.includes("payment")) return "billing";
  if (text.includes("sim") || text.includes("mobile") || text.includes("puk") || text.includes("esim")) return "sim";
  if (text.includes("internet") || text.includes("network") || text.includes("connect") || text.includes("latency") || text.includes("fiber")) return "network";
  if (text.includes("plan") || text.includes("package") || text.includes("upgrade") || text.includes("bundle")) return "plan";
  if (text.includes("activation") || text.includes("install") || text.includes("provision")) return "provisioning";
  if (text.includes("account") || text.includes("access") || text.includes("login") || text.includes("password")) return "account";
  return "other";
}

export function getSuggestedTeam(category: string) {
  const cat = category.toLowerCase();
  const teams: Record<string, string> = {
    billing: "Billing Support",
    sim: "SIM Support",
    network: "Network Support",
    plan: "Technical Support",
    provisioning: "Technical Support",
    account: "Enterprise Support",
    other: "Technical Support",
  };
  return teams[cat] ?? "Technical Support";
}

export function formatCaseLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}