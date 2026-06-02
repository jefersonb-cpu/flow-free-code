import { Link, useNavigate } from "@tanstack/react-router";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { NotificationBell } from "./notification-bell";
import { toast } from "sonner";

export function SiteHeader() {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else {
      toast.success("Signed out.");
      navigate({ to: "/" });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2" aria-label="Prosa — go to home">
          <span className="font-serif text-2xl leading-none tracking-tight text-foreground">
            Prosa<span className="text-primary">.</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2" aria-label="Site">
          <Link
            to="/snippets"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            activeProps={{ className: "hidden text-sm text-foreground sm:inline" }}
          >
            Browse
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/my-snippets"
                className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
                activeProps={{ className: "hidden text-sm text-foreground sm:inline" }}
              >
                My snippets
              </Link>
              <Link
                to="/history"
                className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
                activeProps={{ className: "hidden text-sm text-foreground sm:inline" }}
              >
                History
              </Link>
            </>
          )}
          <ThemeToggle />
          {loading ? null : isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
              >
                {user?.email}
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
