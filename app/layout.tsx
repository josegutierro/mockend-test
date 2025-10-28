import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Stowlog Internal Dashboard",
  description: "Internal operations dashboard for managing facilities, modules, billing, and admins.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-content2 text-foreground">
        <Providers>
          <main className="mx-auto max-w-7xl space-y-12">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
