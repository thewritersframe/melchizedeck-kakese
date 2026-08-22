import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem("theme");

  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }

  return "system";
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  root.classList.remove("light", "dark");

  if (theme === "light") {
    root.classList.add("light");
  }

  if (theme === "dark") {
    root.classList.add("dark");
  }
};

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const storedTheme = getStoredTheme();

    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  useEffect(() => {
    if (theme !== "system") {
      applyTheme(theme);
      localStorage.setItem("theme", theme);
      return;
    }

    applyTheme("system");
    localStorage.setItem("theme", "system");

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  const changeTheme = () => {
    setTheme((current) => {
      if (current === "system") return "light";
      if (current === "light") return "dark";
      return "system";
    });
  };

  const icon =
    theme === "light"
      ? "☀️"
      : theme === "dark"
      ? "🌙"
      : "⚙️";

  const label =
    theme === "light"
      ? "Light mode"
      : theme === "dark"
      ? "Dark mode"
      : "System theme";

  return (
    <button
      type="button"
      onClick={changeTheme}
      aria-label={`Theme: ${label}. Click to change.`}
      title={`${label} • Click to change`}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all duration-200 hover:bg-muted"
    >
      <span className="text-lg" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}
