export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-background/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-8">
        <p>© {new Date().getFullYear()} Prosa — natural-language programming.</p>
        <p>
          Eight human languages · one runtime ·{" "}
          <span className="text-foreground">no AI, just grammar.</span>
        </p>
      </div>
    </footer>
  );
}
