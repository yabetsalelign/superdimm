"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { caseCategories } from "@/lib/case-utils";

type DecisionPath = string[];

// Progressive decision tree structure
// Each category branches into more specific problems
const DECISION_TREE: Record<string, Record<string, Record<string, string[]>>> = {
  network: {
    "Mobile Data": {
      "Data Not Working": ["No Mobile Data At All", "Intermittent / Dropping", "Slow Speed"],
      "Poor Signal": ["No Signal", "Weak Signal in Area"],
    },
    "Home Internet": {
      "Internet Not Working": ["No Internet At All", "Intermittent Outages", "Slow Speed"],
      "Fiber / Broadband": ["Installation Problem", "Speed Below Advertised"],
    },
  },
  sim: {
    "SIM Activation": {
      "New SIM": ["Not Working", "Replacement Issue", "eSIM Provisioning"],
    },
    "SIM Problem": {
      "SIM Status": ["Lost or Damaged", "Not Recognized", "PUK Code Needed"],
    },
  },
  billing: {
    "Invoice & Charges": {
      "Charge Issue": ["Unexpected Charge", "Charge Seems Incorrect", "Missing Invoice"],
    },
    "Payment & Refund": {
      "Payment Status": ["Not Processed", "Refund Needed", "Payment Method Issue"],
    },
  },
  plan: {
    "Modify Plan": {
      "Change Service": ["Want to Upgrade", "Want to Downgrade", "Modify Add-ons"],
    },
    "Plan Information": {
      "Plan Details": ["Data Limit Question", "Service Details", "Renewal Terms"],
    },
  },
  provisioning: {
    "New Service": {
      "Setup Issue": ["Installation Not Scheduled", "Installation Failed", "Device Activation"],
    },
    "Hardware": {
      "Equipment": ["Router Not Working", "Device Provisioning", "Equipment Exchange"],
    },
  },
  account: {
    "Login Issue": {
      "Access Problem": ["Forgot Password", "Account Locked", "Cannot Sign In"],
    },
    "Account Problem": {
      "Profile Issue": ["Email/Phone Change", "Profile Update", "Account Verification"],
    },
  },
  other: {
    "General": {
      "Inquiry": ["General Question", "Technical Support", "Other Issue"],
    },
  },
};

// Category icons and labels
const CATEGORY_INFO: Record<
  string,
  { icon: string; label: string; description: string }
> = {
  network: {
    icon: "📡",
    label: "Network / Internet",
    description: "Issues with connectivity, internet speed, fiber outages, signal strength, or network drops.",
  },
  sim: {
    icon: "📱",
    label: "SIM & Mobile",
    description: "Problems with SIM activation, mobile connectivity, PUK codes, or eSIM provisioning.",
  },
  billing: {
    icon: "💳",
    label: "Billing & Invoices",
    description: "Questions about charges, invoices, payments, refunds, or billing discrepancies.",
  },
  plan: {
    icon: "📦",
    label: "Plan & Subscription",
    description: "Changes to service plans, upgrades, downgrades, or package modifications.",
  },
  provisioning: {
    icon: "⚙️",
    label: "Service Activation",
    description: "Help with new service setup, installation, device provisioning, or hardware activation.",
  },
  account: {
    icon: "🔐",
    label: "Account & Access",
    description: "Login issues, password resets, account recovery, or access problems.",
  },
  other: {
    icon: "❓",
    label: "General Support",
    description: "Any other issues or questions not covered by the above categories.",
  },
};

// Concise helper descriptions for branch options
const OPTION_DESCRIPTIONS: Record<string, string> = {
  // Network
  "Mobile Data": "Cellular 4G/5G data connections on mobile devices.",
  "Home Internet": "Fixed wireless, broadband, or enterprise fiber connections.",
  "Data Not Working": "Cannot access internet or establish a data connection.",
  "Poor Signal": "Low cellular bars, dropped calls, or weak coverage.",
  "Internet Not Working": "Total service interruption or no internet access.",
  "Fiber / Broadband": "Physical line faults, installation delays, or throughput issues.",
  // SIM
  "SIM Activation": "New SIM setup, SIM replacements, or eSIM profiles.",
  "SIM Problem": "Physical SIM damage, device recognition errors, or PIN/PUK lock.",
  "New SIM": "First-time setup or newly issued SIM card issues.",
  "SIM Status": "SIM card is lost, blocked, or not detected in device.",
  // Billing
  "Invoice & Charges": "Clarification on monthly statements, unknown line items, or fees.",
  "Payment & Refund": "Failed transactions, processing errors, or refund requests.",
  "Charge Issue": "Unexpected line item, rate change, or billing discrepancy.",
  "Payment Status": "Payment posted but not reflected, or payment method declined.",
  // Plan
  "Modify Plan": "Upgrade speed, downgrade package, or adjust add-on services.",
  "Plan Information": "Inquire about data allowances, contract terms, or renewal dates.",
  "Change Service": "Request changes to your active service package.",
  "Plan Details": "Review package features, quotas, or service terms.",
  // Service Activation
  "New Service": "Scheduled line setup, on-site technician visits, or service start.",
  "Hardware": "Modems, routers, optical network terminals (ONT), or accessories.",
  "Setup Issue": "Pending installation or activation failure.",
  "Equipment": "Faulty hardware, exchange requests, or device configuration.",
  // Account
  "Login Issue": "Forgotten passwords, two-factor auth, or portal sign-in errors.",
  "Account Problem": "Authorized contact changes, profile information, or security settings.",
  "Access Problem": "Locked credentials or inability to authenticate.",
  "Profile Issue": "Update contact details, company information, or email.",
  // Other
  "General": "Inquiries or support requests not covered in other sections.",
  "Inquiry": "General support assistance from our customer care team.",
};

function getContextualHint(category?: string): string {
  switch (category) {
    case "network":
      return "e.g., When did the disruption start? Is it affecting a specific location or device?";
    case "sim":
      return "e.g., Provide your phone number or ICCID / eSIM order reference if available.";
    case "billing":
      return "e.g., Include any invoice number, charge date, or discrepancy amount.";
    case "plan":
      return "e.g., Which plan tier or add-on would you like to switch to or inquire about?";
    case "provisioning":
      return "e.g., Mention your scheduled installation date or equipment model.";
    case "account":
      return "e.g., Provide the email or account username you are trying to access.";
    default:
      return "e.g., Describe what happened and any troubleshooting steps you have already tried.";
  }
}

export function PortalReportForm() {
  const router = useRouter();
  const [path, setPath] = useState<DecisionPath>([]);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  function getNodeAtCurrentPath(): { node: any; isLeaf: boolean } {
    if (path.length === 0) {
      return { node: DECISION_TREE, isLeaf: false };
    }

    let current: any = DECISION_TREE;

    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      if (!current) return { node: null, isLeaf: false };

      if (Array.isArray(current)) {
        if (current.includes(segment) && i === path.length - 1) {
          return { node: null, isLeaf: true };
        }
        return { node: null, isLeaf: false };
      }

      current = current[segment];
    }

    if (current === undefined || current === null) {
      return { node: null, isLeaf: false };
    }

    return { node: current, isLeaf: false };
  }

  // Get current level options
  function getCurrentOptions(): string[] {
    const { node, isLeaf } = getNodeAtCurrentPath();
    if (isLeaf || !node) return [];
    if (Array.isArray(node)) {
      return node;
    }
    return Object.keys(node);
  }

  function selectOption(option: string) {
    setPath([...path, option]);
    setError(null);
  }

  function goBack() {
    if (path.length > 0) {
      setPath(path.slice(0, -1));
      setError(null);
    }
  }

  function jumpToStep(depth: number) {
    setPath(path.slice(0, depth));
    setError(null);
  }

  function canSubmit(): boolean {
    return getNodeAtCurrentPath().isLeaf;
  }

  // Check if this is a follow-up issue
  const isFollowUp = /previous\s+issue|not\s+fixed|still\s+(not\s+)?working/i.test(
    additionalDetails
  );

  // Generate title from path
  function generateTitle(): string {
    if (path.length === 0) return "";
    const category = path[0];
    const categoryInfo = CATEGORY_INFO[category];
    const categoryLabel = categoryInfo?.label || category;

    if (path.length === 1) {
      return categoryLabel;
    }

    // Use the last selection in path as the specific issue
    return `${categoryLabel} - ${path[path.length - 1]}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const category = path[0];
      const title = generateTitle();
      const description = additionalDetails.trim() || null;

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title,
          description,
        }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Unable to submit support ticket.");
      }

      const item = await response.json();
      const ref = `SR-${item.id.slice(-5).toUpperCase()}`;
      setReference(ref);
    } catch (err: any) {
      setError(err.message || "A network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function reset() {
    setPath([]);
    setAdditionalDetails("");
    setReference(null);
    setError(null);
  }

  // Success state
  if (reference) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center shadow-xs">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <span className="text-2xl font-bold">✓</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-emerald-950">
            Support Request Submitted
          </h2>

          <p className="mt-4 text-sm text-emerald-900 leading-relaxed">
            Your service request has been successfully submitted to our operations team.
          </p>

          <div className="mt-6 rounded-lg border border-emerald-300 bg-white px-4 py-3 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Your Reference Number
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-emerald-950">
              {reference}
            </p>
            <p className="mt-2 text-xs text-emerald-800">
              Keep this number for future communications about this request.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-sm text-emerald-900 leading-relaxed">
              Our support team will begin investigating your issue and will update you on progress. You can track this request anytime by returning to your account.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/portal")}
              className="border-emerald-300 bg-white text-emerald-950 hover:bg-emerald-100 font-medium"
            >
              Return to Portal
            </Button>
            <Button
              type="button"
              onClick={reset}
              className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
            >
              Report Another Problem
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const options = getCurrentOptions();
  const isAtLeaf = canSubmit();

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Interactive Breadcrumb Navigation */}
      {path.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setPath([])}
            className="font-medium text-primary hover:underline transition-colors"
          >
            Start Over
          </button>
          {path.map((segment, idx) => {
            const isLast = idx === path.length - 1;
            const label = idx === 0 && CATEGORY_INFO[segment] ? CATEGORY_INFO[segment].label : segment;

            return (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="text-muted-foreground/60 font-semibold">/</span>
                {isLast ? (
                  <span className="font-semibold text-foreground">{label}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => jumpToStep(idx + 1)}
                    className="font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors"
                  >
                    {label}
                  </button>
                )}
              </div>
            );
          })}
        </nav>
      )}

      {/* Main card container */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 space-y-6">
        {/* Headings */}
        <div>
          {path.length === 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Step 1 of 4 · Service Category
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                What type of problem are you experiencing?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Select the category that best matches your issue to route your request to the right team.
              </p>
            </>
          )}
          {path.length === 1 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Step 2 of 4 · Specific Problem
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {CATEGORY_INFO[path[0]]?.label || path[0]}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Select the specific service area having trouble.
              </p>
            </>
          )}
          {path.length === 2 && !isAtLeaf && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Step 3 of 4 · Narrow Issue
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {path[path.length - 1]}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Help us narrow down what symptom you are observing.
              </p>
            </>
          )}
          {path.length === 3 && !isAtLeaf && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Step 4 of 4 · Specific Reportable Issue
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {path[path.length - 1]}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose the statement that best describes the exact issue.
              </p>
            </>
          )}
          {isAtLeaf && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Final Step · Review & Submit
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Review Your Support Request
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Confirm your issue selection and add optional details before submitting.
              </p>
            </>
          )}
        </div>

        {/* Options grid (when not at leaf) */}
        {!isAtLeaf && (
          <div className="grid gap-3 sm:grid-cols-1">
            {options.map((option) => {
              const catInfo = path.length === 0 ? CATEGORY_INFO[option] : null;
              const title = catInfo ? catInfo.label : option;
              const desc = catInfo ? catInfo.description : OPTION_DESCRIPTIONS[option];

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectOption(option)}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-background p-4 text-left shadow-2xs transition-all duration-150 hover:border-primary hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      {catInfo?.icon && <span className="text-xl shrink-0">{catInfo.icon}</span>}
                      <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {title}
                      </p>
                    </div>
                    {desc && (
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed pl-0.5">
                        {desc}
                      </p>
                    )}
                  </div>
                  {/* Subtle Right Chevron Affordance */}
                  <svg
                    className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>
        )}

        {/* Final Report Form (when at leaf) */}
        {isAtLeaf && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Generated Issue Summary with Edit/Change Action */}
            <div className="flex items-start justify-between gap-4 rounded-xl border border-border/80 bg-muted/20 p-4">
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Identified Problem
                </p>
                <p className="font-semibold text-foreground text-base leading-snug">
                  {generateTitle()}
                </p>
                <p className="text-xs text-muted-foreground font-mono truncate pt-0.5">
                  {path.map((segment, idx) => (idx === 0 && CATEGORY_INFO[segment] ? CATEGORY_INFO[segment].label : segment)).join(" → ")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goBack}
                className="shrink-0 text-xs font-medium"
              >
                Change
              </Button>
            </div>

            {/* Optional Additional Details */}
            <div className="space-y-2">
              <label htmlFor="additional-details" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Additional Details (Optional)
              </label>
              <textarea
                id="additional-details"
                placeholder="Tell us anything else that might help our technicians resolve this faster..."
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                maxLength={1000}
                rows={4}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate max-w-[80%]">{getContextualHint(path[0])}</span>
                <span className={additionalDetails.length >= 900 ? "text-amber-600 font-medium" : ""}>
                  {additionalDetails.length} / 1000
                </span>
              </div>
            </div>

            {isFollowUp && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5">
                <p className="text-xs font-semibold text-amber-950">
                  ⚠️ Follow-up Issue Detected
                </p>
                <p className="mt-1 text-xs text-amber-900 leading-relaxed">
                  We noticed this might be related to a previous ticket. Our operations queue will link this with your case history.
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3.5">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-6">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ← Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 font-semibold px-6 shadow-sm"
              >
                {isSubmitting ? "Submitting Request..." : "Submit Support Request"}
              </Button>
            </div>
          </form>
        )}

        {/* Secondary Navigation (when not at leaf) */}
        {!isAtLeaf && (
          <div className="flex items-center justify-between border-t border-border/60 pt-5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={path.length === 0 ? () => router.push("/portal") : goBack}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← {path.length === 0 ? "Cancel" : "Back"}
            </Button>
            <span className="text-xs font-medium text-muted-foreground">
              Step {path.length + 1} of 4
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
