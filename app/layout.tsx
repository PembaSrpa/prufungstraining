import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pruefungstraining",
  description: "Persoenliches Uebungsportal fuer Goethe, telc und ÖSD A1/A2 Pruefungen"
};

// Runs before first paint: apply the saved theme, else the OS preference.
const themeInitScript = `(function(){try{var t=localStorage.getItem("pruefungstraining.theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
