import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react";

export type ThemeName = "theme-1" | "theme-2" | "theme-3";

export const THEMES: { id: ThemeName; label: string }[] = [
  { id: "theme-1", label: "Theme 1" },
  { id: "theme-2", label: "Theme 2" },
  { id: "theme-3", label: "Theme 3" },
];

const STORAGE_KEY = "liquid-grid-theme";
const DEFAULT_THEME: ThemeName = "theme-3";

function isThemeName(value: string | null): value is ThemeName {
  return value === "theme-1" || value === "theme-2" || value === "theme-3";
}

const ThemeContext = createContext<{
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isThemeName(stored) ? stored : DEFAULT_THEME;
  });

  // useLayoutEffect (not useEffect) so data-theme is stamped before paint,
  // avoiding a flash of the wrong theme on load.
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
