import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

// Map our internal language codes to BCP-47 tags for the SpeechRecognition API.
const LOCALES: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-PT",
  ja: "ja-JP",
  zh: "zh-CN",
  nl: "nl-NL",
};

type Props = {
  langId: string;
  onTranscript: (text: string) => void;
};

export function VoiceInputButton({ langId, onTranscript }: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Rec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(Boolean(Rec));
  }, []);

  useEffect(() => () => recognitionRef.current?.stop?.(), []);

  const start = () => {
    const Rec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Rec) {
      toast.error("Voice input isn't supported in this browser.");
      return;
    }
    const rec = new Rec();
    rec.lang = LOCALES[langId] ?? "en-US";
    rec.interimResults = false;
    rec.continuous = false;

    rec.onresult = (e: any) => {
      const text = Array.from(e.results)
        .map((r: any) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (text) onTranscript(text);
    };
    rec.onerror = (e: any) => {
      toast.error(`Voice error: ${e.error ?? "unknown"}`);
      setListening(false);
    };
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stop = () => {
    recognitionRef.current?.stop?.();
    setListening(false);
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      aria-pressed={listening}
      aria-label={listening ? "Stop voice input" : "Start voice input"}
      title={listening ? "Stop voice input" : "Dictate a sentence"}
      className={[
        "inline-flex min-h-9 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition",
        listening
          ? "border-destructive bg-destructive/10 text-destructive animate-pulse"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {listening ? (
        <>
          <MicOff className="h-3.5 w-3.5" aria-hidden="true" />
          Listening…
        </>
      ) : (
        <>
          <Mic className="h-3.5 w-3.5" aria-hidden="true" />
          Voice
        </>
      )}
    </button>
  );
}
