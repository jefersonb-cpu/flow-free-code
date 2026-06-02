import { Twitter, Linkedin, Link as LinkIcon, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ShareButtons({ title, path }: { title: string; path: string }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied.");
    } catch {
      toast.error("Couldn't copy.");
    }
  };

  return (
    <div className="flex items-center gap-1" aria-label="Share">
      <Button variant="ghost" size="icon" asChild aria-label="Share on Twitter / X">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Twitter className="h-4 w-4" />
        </a>
      </Button>
      <Button variant="ghost" size="icon" asChild aria-label="Share on LinkedIn">
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin className="h-4 w-4" />
        </a>
      </Button>
      <Button variant="ghost" size="icon" asChild aria-label="Share via email">
        <a href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}>
          <Mail className="h-4 w-4" />
        </a>
      </Button>
      <Button variant="ghost" size="icon" onClick={copy} aria-label="Copy link">
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
