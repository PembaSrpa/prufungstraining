import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pruefungstraining",
  description: "Persoenliches Uebungsportal fuer Goethe, telc und ÖSD A1/A2 Pruefungen"
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("pruefungstraining.theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
