import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Button } from "@/components/ui/button";
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
      <body className="min-h-full flex min-h-screen flex-col">
        <header className="border-b border-border bg-background/90 px-6 py-4 backdrop-blur-sm shadow-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold">SuperDimm Admin</p>
            </div>
            <nav className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/">Dashboard</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/profile">Profile</Link>
              </Button>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}