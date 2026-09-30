"use client";

import { useEffect, useState } from "react";
import { getStoredTheme, setStoredTheme } from "@/lib/storage";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as
      | "light"
      | "dark"
      | null) ?? getStoredTheme() ?? "light";
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    setStoredTheme(next);
  };

  return (
    <button type="button" className="skill-link" onClick={toggle}>
      {theme === "dark" ? "Helles Design" : "Dunkles Design"}
    </button>
  );
}
