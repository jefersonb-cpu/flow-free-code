import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme, type Theme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, resolved, setTheme } = useTheme();

  const next: Record<Theme, Theme> = { light: "dark", dark: "system", system: "light" };
  const label =
    theme === "system"
      ? `Theme: follows system (currently ${resolved}). Click to switch to light.`
      : theme === "dark"
        ? "Theme: dark. Click to follow system."
        : "Theme: light. Click to switch to dark.";

  return (
    <button
      type="button"
      onClick={() => setTheme(next[theme])}
      aria-label={label}
      title={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card/60 text-foreground transition hover:border-primary/50 hover:text-primary"
    >
      {theme === "system" ? (
        <Monitor className="h-4 w-4" />
      ) : resolved === "dark" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}
