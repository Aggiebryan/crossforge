import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrossForge CRM",
  description: "Operating system for a contract wholesaling business.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
