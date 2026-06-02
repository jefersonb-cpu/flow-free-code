import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2" aria-label="Prosa — go to home">
          <span className="font-serif text-2xl leading-none tracking-tight text-foreground">
            Prosa<span className="text-primary">.</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Site">
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
