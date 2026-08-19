export const caseStatuses = [
  "open",
  "assigned",
  "in_progress",
  "pending_customer",
  "escalated",
  "resolved",
  "closed",
] as const;

export const casePriorities = ["low", "medium", "high", "critical"] as const;

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

export function getCaseCategory(title: string, description?: string | null) {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  if (text.includes("bill") || text.includes("charg")) return "Billing";
  if (text.includes("sim") || text.includes("mobile")) return "SIM / Mobile";
  if (text.includes("internet") || text.includes("network") || text.includes("connect")) return "Network";
  if (text.includes("plan") || text.includes("package")) return "Plan";
  if (text.includes("account") || text.includes("access")) return "Account";
  return "Other";
}

export function getSuggestedTeam(category: string) {
  const teams: Record<string, string> = {
    Billing: "Billing Support",
    "SIM / Mobile": "SIM Support",
    Network: "Network Support",
    Plan: "Technical Support",
    Account: "Technical Support",
  };
  return teams[category] ?? "Technical Support";
}

export function formatCaseLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}