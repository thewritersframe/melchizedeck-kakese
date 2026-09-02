import { useEffect, useState } from "react";
import { Sun, Moon, MonitorSmartphone } from "lucide-react";

type Theme = "system" | "light" | "dark";

const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (theme === "light") root.classList.add("light");
  if (theme === "dark") root.classList.add("dark");
};

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    applyTheme(theme);
    localStorage.setItem("theme", theme);
    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [theme, ready]);

  const changeTheme = () =>
    setTheme((c) => (c === "system" ? "light" : c === "light" ? "dark" : "system"));

  const label =
    theme === "light" ? "Light mode" : theme === "dark" ? "Dark mode" : "Auto (device settings)";

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : MonitorSmartphone;

  return (
    <button
      type="button"
      onClick={changeTheme}
      aria-label={`Theme: ${label}. Click to change.`}
      title={`${label} • Click to change`}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/60 text-foreground transition-colors duration-200 hover:border-gold/60 hover:text-gold"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
