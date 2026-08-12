import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MaybeAdminShell } from "@/components/maybe-admin-shell";
import { Providers } from "@/app/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          <MaybeAdminShell>{children}</MaybeAdminShell>
        </Providers>
      </body>
    </html>
  );
}