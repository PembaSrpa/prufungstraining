import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pruefungstraining",
  description: "Persoenliches Uebungsportal fuer Goethe, telc und ÖSD A1/A2 Pruefungen"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
