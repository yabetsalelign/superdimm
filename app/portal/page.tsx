import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerRequestPrototype } from "@/components/customer-request-prototype";

const sampleCustomer = {
  name: "Acme Logistics",
  email: "ops@acme.logistics",
  customerId: "cust-acme",
  status: "Active",
  plan: "Managed network",
};

const sampleRequests = [
  { id: "REQ-1042", title: "Network latency investigation", status: "Open", date: "Aug 12, 2026" },
  { id: "REQ-1031", title: "Billing report cleanup", status: "Closed", date: "Jul 28, 2026" },
];

const sampleTransactions = [
  { id: "TXN-8821", description: "Monthly network package", amount: "$1,250.00", date: "Aug 01, 2026", status: "Paid" },
  { id: "TXN-8744", description: "Support invoice", amount: "$680.00", date: "Jul 01, 2026", status: "Paid" },
];

function statusVariant(status: string) {
  if (status === "Open" || status === "Paid") return "success" as const;
  if (status === "Closed") return "muted" as const;
  return "default" as const;
}

export default function PortalPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">Customer Portal</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, {sampleCustomer.name}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">See what is happening with your service and submit a complaint or request when you need help.</p>
        </div>
        <div className="shrink-0">
          <CustomerRequestPrototype />
        </div>
      </header>

      <section aria-labelledby="account-summary-heading" className="space-y-4">
        <div>
          <h2 id="account-summary-heading" className="text-xl font-semibold">Your account</h2>
          <p className="mt-1 text-sm text-muted-foreground">A quick look at your SuperDimm account.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader><CardDescription>Account status</CardDescription><CardTitle className="text-2xl">{sampleCustomer.status}</CardTitle></CardHeader>
            <CardContent><Badge variant="success">In good standing</Badge></CardContent>
          </Card>
          <Card>
            <CardHeader><CardDescription>Service plan</CardDescription><CardTitle className="text-2xl">{sampleCustomer.plan}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Your current service</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardDescription>Customer ID</CardDescription><CardTitle className="text-2xl">{sampleCustomer.customerId}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Use this when contacting support</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardDescription>Account contact</CardDescription><CardTitle className="break-words text-lg">{sampleCustomer.email}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Primary account email</p></CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>My open cases</CardTitle>
            <CardDescription>Track complaints and service issues submitted for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="pb-3 pr-4 font-medium">Issue</th><th className="pb-3 pr-4 font-medium">Status</th><th className="pb-3 pr-4 font-medium">Date</th><th className="pb-3 font-medium">Reference</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sampleRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="py-4 pr-4 font-medium">{request.title}</td>
                      <td className="py-4 pr-4"><Badge variant={statusVariant(request.status)}>{request.status}</Badge></td>
                      <td className="whitespace-nowrap py-4 pr-4 text-muted-foreground">{request.date}</td>
                      <td className="whitespace-nowrap py-4 text-muted-foreground">{request.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Your recent account activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {sampleTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0">
                <div className="min-w-0"><p className="truncate font-medium">{transaction.description}</p><p className="mt-1 text-xs text-muted-foreground">{transaction.date} · {transaction.id}</p></div>
                <div className="shrink-0 text-right"><p className="font-medium">{transaction.amount}</p><Badge variant={statusVariant(transaction.status)}>{transaction.status}</Badge></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">Sample customer view for product review. Activity shown here is prototype data.</p>
    </main>
  );
}