import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Providers } from "@/components/layout/Provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareTech — Business systems, designed and engineered",
  description:
    "We build internal platforms, integrations, and operational tools for teams that have outgrown spreadsheets, glue code, and guesswork.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}