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

export function PortalReportForm() {
  const router = useRouter();
  const [path, setPath] = useState<DecisionPath>([]);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  // Get current level options
  function getCurrentOptions(): string[] {
    if (path.length === 0) {
      return caseCategories as unknown as string[];
    }

    let current: Record<string, any> = DECISION_TREE;

    for (const key of path) {
      current = current[key];
      if (!current) return [];
    }

    return Object.keys(current);
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

  function canSubmit(): boolean {
    // Can submit when at a leaf (deepest level)
    if (path.length === 0) return false;

    let current: Record<string, any> = DECISION_TREE;
    for (const key of path) {
      current = current[key];
      if (!current) return false;
    }

    // If current has no sub-options (is a leaf), can submit
    return !Array.isArray(current) && Object.keys(current).length === 0;
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
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <span className="text-2xl">✓</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-emerald-950">
            Support Request Submitted
          </h2>

          <p className="mt-4 text-sm text-emerald-900">
            Your service request has been successfully submitted to our operations team.
          </p>

          <div className="mt-6 rounded-lg border border-emerald-300 bg-white px-4 py-3">
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
            <p className="text-sm text-emerald-900">
              Our support team will begin investigating your issue and will update you on progress. You can track this request anytime by returning to your account.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/portal")}
              className="border-emerald-300 bg-white text-emerald-950 hover:bg-emerald-100"
            >
              Return to Portal
            </Button>
            <Button type="button" onClick={reset} className="bg-emerald-600 hover:bg-emerald-700">
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
      {/* Breadcrumb/Path Display */}
      {path.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPath([])}
            className="text-sm font-medium text-primary hover:underline"
          >
            Start Over
          </button>
          {path.map((segment, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium text-foreground">{segment}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="space-y-6">
        {/* Heading based on depth */}
        <div>
          {path.length === 0 && (
            <>
              <h2 className="text-2xl font-bold tracking-tight">
                What type of problem are you experiencing?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Select the category that best matches your issue.
              </p>
            </>
          )}
          {path.length === 1 && (
            <>
              <h2 className="text-2xl font-bold tracking-tight">
                {CATEGORY_INFO[path[0]]?.label || path[0]}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                What specific problem are you experiencing?
              </p>
            </>
          )}
          {path.length > 1 && !isAtLeaf && (
            <>
              <h2 className="text-2xl font-bold tracking-tight">
                Tell us more about your {path[path.length - 1].toLowerCase()}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Help us narrow down the issue.
              </p>
            </>
          )}
          {isAtLeaf && (
            <>
              <h2 className="text-2xl font-bold tracking-tight">
                Additional Details (Optional)
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Let us know anything else that might help us resolve this faster.
              </p>
            </>
          )}
        </div>

        {/* Options grid (only show if not at leaf) */}
        {!isAtLeaf && (
          <div className="grid gap-3">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => selectOption(option)}
                className="rounded-lg border-2 border-border p-4 text-left transition-all hover:border-primary hover:bg-muted/40"
              >
                <p className="font-semibold text-foreground">{option}</p>
              </button>
            ))}
          </div>
        )}

        {/* Final details form (only show at leaf) */}
        {isAtLeaf && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Issue
              </p>
              <p className="mt-2 font-semibold text-foreground">{generateTitle()}</p>
            </div>

            <div className="space-y-2">
              <textarea
                placeholder="Tell us anything else that might help..."
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                Optional. Anything else you'd like our team to know?
              </p>
            </div>

            {isFollowUp && (
              <div className="rounded bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-950">
                  ⚠️ Follow-up Issue Detected
                </p>
                <p className="mt-1 text-xs text-amber-900">
                  We noticed this might be related to a previous issue. Our team will check the case history.
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex justify-between gap-3 border-t border-border pt-6">
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        )}

        {/* Navigation buttons (only show if not at leaf) */}
        {!isAtLeaf && (
          <div className="flex justify-between gap-3 border-t border-border pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={path.length === 0 ? () => router.push("/portal") : goBack}
            >
              {path.length === 0 ? "Cancel" : "Back"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
