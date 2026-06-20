import { useEffect, useMemo, useState } from "react";
import ThemeContext from "./themeContext";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";

  const savedTheme = window.localStorage.getItem("codeable-theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.appTheme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("codeable-theme", theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    isLight: theme === "light",
    toggleTheme: () => setTheme((current) => current === "light" ? "dark" : "light"),
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
