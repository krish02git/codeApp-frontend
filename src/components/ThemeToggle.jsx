import useTheme from "../theme/useTheme";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.99 12.74A8.5 8.5 0 1 1 11.26 3.01 6.7 6.7 0 0 0 20.99 12.74z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { isLight, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isLight ? "dark" : "light"} theme`}
      title={`Switch to ${isLight ? "dark" : "light"} theme`}
      className="theme-toggle fixed bottom-5 right-5 z-[10000] h-11 w-11 rounded-full border shadow-lg backdrop-blur-xl transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
    >
      <span className="sr-only">Toggle theme</span>
      <span className="theme-toggle-icon h-5 w-5">
        {isLight ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}
