import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Play, Sparkles, BookOpen, RotateCcw } from "lucide-react";
import { LANGUAGES, getLanguage } from "@/lib/prose-lang/languages";
import { run, type RunResult } from "@/lib/prose-lang/interpreter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prosa — Code in plain language" },
      {
        name: "description",
        content:
          "Write programs as coherent sentences in English, Spanish, French, German, or Italian. Each sentence is a real command.",
      },
      { property: "og:title", content: "Prosa — Code in plain language" },
      {
        property: "og:description",
        content: "A natural-language programming environment. Five languages, real execution.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [langId, setLangId] = useState("en");
  const lang = useMemo(() => getLanguage(langId), [langId]);
  const [source, setSource] = useState(lang.sample);
  const [result, setResult] = useState<RunResult | null>(null);
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  const onLangChange = (id: string) => {
    const next = getLanguage(id);
    setLangId(id);
    setSource(next.sample);
    setResult(null);
  };

  const onRun = () => setResult(run(source, lang));
  const onReset = () => {
    setSource(lang.sample);
    setResult(null);
  };

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Five human languages · one runtime</span>
            </div>
            <h1 className="font-serif text-5xl leading-none tracking-tight text-foreground sm:text-6xl">
              Prosa<span className="text-primary">.</span>
            </h1>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">
              Write programs as coherent sentences. Every command is real grammar — and real code.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => onLangChange(l.id)}
                className={[
                  "rounded-md border px-3 py-2 text-sm transition-all",
                  l.id === langId
                    ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-card/60 text-foreground hover:border-primary/50",
                ].join(" ")}
              >
                <span className="mr-1.5">{l.flag}</span>
                {l.name}
              </button>
            ))}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                  <span className="ml-3 font-mono text-xs text-muted-foreground">
                    prose.{lang.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onReset}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                    title="Reset to sample"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                  <button
                    onClick={onRun}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:brightness-110"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Run
                  </button>
                </div>
              </div>
              <textarea
                value={source}
                onChange={(e) => setSource(e.target.value)}
                spellCheck={false}
                className="min-h-[360px] w-full resize-y bg-transparent p-5 font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
                placeholder={lang.sample}
              />
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card/70">
              <div className="border-b border-border bg-card/40 px-4 py-2 font-mono text-xs text-muted-foreground">
                output
              </div>
              <div className="min-h-[120px] p-5 font-mono text-sm">
                {!result && (
                  <span className="text-muted-foreground">
                    Press <span className="text-primary">Run</span> to execute your sentences.
                  </span>
                )}
                {result?.output.map((line, i) => (
                  <div key={i} className="text-foreground">
                    <span className="mr-2 text-muted-foreground">›</span>
                    {line}
                  </div>
                ))}
                {result?.error && (
                  <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive-foreground">
                    <div className="text-destructive">⚠ {result.error.message}</div>
                    {result.error.sentence && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        in: <span className="font-mono">{result.error.sentence}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <button
                onClick={() => setShowCheatsheet((v) => !v)}
                className="mb-4 flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h2 className="font-serif text-2xl">Grammar of {lang.name}</h2>
                </div>
                <span className="text-xs text-muted-foreground">
                  {showCheatsheet ? "hide" : "show"}
                </span>
              </button>

              {showCheatsheet ? (
                <Cheatsheet langId={lang.id} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Each sentence ends with a period. Commands chain top to bottom. Inline
                  <span className="text-foreground"> if </span>and
                  <span className="text-foreground"> repeat </span>statements wrap another sentence
                  after a comma or colon.
                </p>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-border bg-card/60 p-6">
              <h3 className="font-serif text-xl">Try these</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>· Change a sentence and re-run.</li>
                <li>· Switch language — the sample translates.</li>
                <li>· Strings use "quotes". Numbers are bare.</li>
                <li>· Errors point to the offending sentence.</li>
              </ul>
            </div>
          </aside>
        </div>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Prosa interprets your prose — no AI, just grammar.
        </footer>
      </div>
    </main>
  );
}

function Cheatsheet({ langId }: { langId: string }) {
  const rows: Record<string, Array<[string, string]>> = {
    en: [
      ["Assign", `Let x be 5.  /  Set x to "hi".`],
      ["Arithmetic", `Set x to 3 plus 4 times 2.`],
      ["Mutate", `Add 1 to x.  /  Increase x by 1.`],
      ["Print", `Print x.  /  Show "hello".`],
      ["If", `If x is greater than 3, print x.`],
      ["Repeat", `Repeat 5 times: add 1 to x.`],
    ],
    es: [
      ["Asignar", `Sea x igual a 5.`],
      ["Aritmética", `Sea y igual a 3 más 4 por 2.`],
      ["Mutar", `Suma 1 a x.  /  Aumenta x en 1.`],
      ["Mostrar", `Muestra x.`],
      ["Si", `Si x es mayor que 3, muestra x.`],
      ["Repetir", `Repite 5 veces: suma 1 a x.`],
    ],
    fr: [
      ["Affecter", `Soit x égal à 5.`],
      ["Calcul", `Soit y égal à 3 plus 4 fois 2.`],
      ["Modifier", `Ajoute 1 à x.  /  Augmente x de 1.`],
      ["Afficher", `Affiche x.`],
      ["Si", `Si x est plus grand que 3, affiche x.`],
      ["Répéter", `Répète 5 fois : ajoute 1 à x.`],
    ],
    de: [
      ["Zuweisen", `Sei x gleich 5.  /  Setze x auf 5.`],
      ["Rechnen", `Setze y auf 3 plus 4 mal 2.`],
      ["Ändern", `Addiere 1 zu x.  /  Erhoehe x um 1.`],
      ["Ausgabe", `Zeige x.`],
      ["Wenn", `Wenn x groesser als 3 ist, zeige x.`],
      ["Wiederholen", `Wiederhole 5 mal: erhoehe x um 1.`],
    ],
    it: [
      ["Assegnare", `Sia x uguale a 5.`],
      ["Calcolo", `Sia y uguale a 3 più 4 per 2.`],
      ["Modificare", `Aggiungi 1 a x.  /  Aumenta x di 1.`],
      ["Mostrare", `Mostra x.`],
      ["Se", `Se x è maggiore di 3, mostra x.`],
      ["Ripetere", `Ripeti 5 volte: aggiungi 1 a x.`],
    ],
  };
  return (
    <div className="space-y-3">
      {rows[langId].map(([label, ex]) => (
        <div key={label} className="border-l-2 border-primary/40 pl-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-0.5 font-mono text-sm text-foreground">{ex}</div>
        </div>
      ))}
    </div>
  );
}
