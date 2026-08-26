import type { Metadata } from "next";
import { MaybeAdminShell } from "@/components/maybe-admin-shell";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SuperDimm Admin Dashboard",
  description: "Internal telecom administration dashboard built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-background text-foreground font-sans">
        <Providers>
          <MaybeAdminShell>{children}</MaybeAdminShell>
        </Providers>
      </body>
    </html>
  );
}