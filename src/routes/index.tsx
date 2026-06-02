import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Sparkles, BookOpen, RotateCcw, Search, Save } from "lucide-react";
import { LANGUAGES, getLanguage } from "@/lib/prose-lang/languages";
import { run, type RunResult } from "@/lib/prose-lang/interpreter";
import { useAuth } from "@/lib/auth-context";
import { createSnippet, recordRun } from "@/lib/snippets";
import { VoiceInputButton } from "@/components/voice-input-button";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prosa — Code in plain language" },
      {
        name: "description",
        content:
          "Write programs as coherent sentences in 8 human languages — English, Spanish, French, German, Italian, Portuguese, Japanese, Chinese. Each sentence is a real command.",
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
  const [query, setQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onLangChange = (id: string) => {
    const next = getLanguage(id);
    setLangId(id);
    setSource(next.sample);
    setResult(null);
  };

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const executeAndPersist = (code: string) => {
    const r = run(code, lang);
    setResult(r);
    if (user) {
      const outputText = r.output.join("\n") + (r.error ? `\n⚠ ${r.error.message}` : "");
      recordRun({
        user_id: user.id,
        language: lang.id,
        source: code,
        output: outputText,
        success: !r.error,
      }).catch(() => {});
    }
  };

  const onRun = () => executeAndPersist(source);
  const onReset = () => {
    setSource(lang.sample);
    setResult(null);
  };

  const onSave = async () => {
    if (!isAuthenticated || !user) {
      navigate({ to: "/login", search: { redirect: "/" } });
      return;
    }
    setSaving(true);
    try {
      const title = source.split("\n")[0]?.slice(0, 60).trim() || "Untitled snippet";
      const snippet = await createSnippet({
        owner_id: user.id,
        title,
        language: lang.id,
        source,
        visibility: "private",
      });
      toast.success("Snippet saved.");
      navigate({ to: "/snippets/$id", params: { id: snippet.id } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Cmd/Ctrl+Enter runs the program from inside the editor.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        executeAndPersist(el.value);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, user]);

  return (
    <section className="px-4 py-10 sm:px-8 sm:py-16" aria-labelledby="prosa-heading">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>Eight human languages · one runtime</span>
            </div>
            <h1
              id="prosa-heading"
              className="font-serif text-5xl leading-none tracking-tight text-foreground sm:text-6xl"
            >
              Prosa<span className="text-primary">.</span>
            </h1>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">
              Write programs as coherent sentences. Every command is real grammar — and real code.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="Choose a human language">
            {LANGUAGES.map((l) => {
              const active = l.id === langId;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onLangChange(l.id)}
                  aria-pressed={active}
                  aria-label={`Use ${l.name}`}
                  className={[
                    "min-h-11 rounded-md border px-3 py-2 text-sm transition-all",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                      : "border-border bg-card/60 text-foreground hover:border-primary/50",
                  ].join(" ")}
                >
                  <span className="mr-1.5" aria-hidden="true">{l.flag}</span>
                  {l.name}
                </button>
              );
            })}
          </nav>
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
                  <VoiceInputButton
                    langId={lang.id}
                    onTranscript={(text) => {
                      setSource((prev) => {
                        const sep = prev.trimEnd().length === 0 ? "" : prev.endsWith("\n") ? "" : "\n";
                        const sentence = /[.!?。]$/.test(text.trim()) ? text.trim() : text.trim() + ".";
                        return prev + sep + sentence;
                      });
                    }}
                  />
                  <button
                    type="button"
                    onClick={onReset}
                    aria-label="Reset editor to the sample program"
                    title="Reset to sample"
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    aria-label={isAuthenticated ? "Save snippet to your account" : "Sign in to save"}
                    title={isAuthenticated ? "Save" : "Sign in to save"}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={onRun}
                    aria-label="Run program (Ctrl or Cmd + Enter)"
                    title="Run (⌘/Ctrl + Enter)"
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:brightness-110"
                  >
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    Run
                  </button>
                </div>
              </div>
              <label htmlFor="prosa-editor" className="sr-only">
                Prosa source code
              </label>
              <textarea
                id="prosa-editor"
                ref={textareaRef}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                spellCheck={false}
                aria-describedby="prosa-editor-hint"
                className="min-h-[360px] w-full resize-y bg-transparent p-5 font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
                placeholder={lang.sample}
              />
              <p id="prosa-editor-hint" className="sr-only">
                Press Control or Command plus Enter to run the program.
              </p>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card/70">
              <div className="border-b border-border bg-card/40 px-4 py-2 font-mono text-xs text-muted-foreground">
                output
              </div>
              <div
                className="min-h-[120px] p-5 font-mono text-sm"
                role="status"
                aria-live="polite"
                aria-atomic="false"
              >
                {!result && (
                  <span className="text-muted-foreground">
                    Press <span className="text-primary">Run</span> to execute your sentences
                    {" "}<kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-foreground">⌘/Ctrl + Enter</kbd>.
                  </span>
                )}
                {result?.output.map((line, i) => (
                  <div key={i} className="text-foreground">
                    <span className="mr-2 text-muted-foreground" aria-hidden="true">›</span>
                    {line}
                  </div>
                ))}
                {result?.error && (
                  <div
                    role="alert"
                    className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive-foreground"
                  >
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
                type="button"
                onClick={() => setShowCheatsheet((v) => !v)}
                aria-expanded={showCheatsheet}
                aria-controls="cheatsheet-panel"
                className="mb-4 flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h2 className="font-serif text-2xl">Grammar of {lang.name}</h2>
                </div>
                <span className="text-xs text-muted-foreground">
                  {showCheatsheet ? "hide" : "show"}
                </span>
              </button>

              {showCheatsheet ? (
                <div id="cheatsheet-panel">
                  <div className="relative mb-3">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <label htmlFor="cheatsheet-search" className="sr-only">
                      Search grammar
                    </label>
                    <input
                      id="cheatsheet-search"
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search the grammar…"
                      className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <Cheatsheet langId={lang.id} query={query} />
                </div>
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
    </section>
  );
}

function Cheatsheet({ langId, query = "" }: { langId: string; query?: string }) {
  const rows: Record<string, Array<[string, string]>> = {
    en: [
      ["Assign", `Let x be 5.  /  Set x to "hi".  /  Define score as 0.\nSuppose age is 30.  /  Now total becomes 100.\nCreate a variable called name with the value "Ana".\nStore 42 in answer.  /  Assign 7 to lucky.`],
      ["Arithmetic", `Set x to 3 plus 4 times 2 minus 1.\nLet greeting be "Hello, " plus name.`],
      ["Mutate", `Add 1 to x.  /  Increase x by 1.  /  Bump x by 2.\nGive x 5 more.  /  Take 3 away from x.  /  Reduce x by 1.`],
      ["Print", `Print x.  /  Show me the value of x.\nKindly display "hello".  /  Tell me about score.\nWhat is x?  /  Announce "done".`],
      ["If", `If x is greater than 3, then print x.\nWhenever score is at least 100, say "win!".\nProvided that age is at most 17, print "minor".`],
      ["Repeat", `Repeat 5 times: please add 1 to x.\nDo the following 3 times: print "hi".\n4 times in a row, increase x by 2.`],
    ],
    es: [
      ["Asignar", `Sea x igual a 5.  /  Define score como 0.\nSupongamos que edad es 30.  /  Ahora total se convierte en 100.\nCrea una variable llamada nombre con el valor "Ana".\nGuarda 42 en respuesta.  /  Asigna 7 a suerte.`],
      ["Aritmética", `Sea y igual a 3 más 4 por 2 menos 1.`],
      ["Mutar", `Suma 1 a x.  /  Aumenta x en 1.\nDale a x 5 más.  /  Quita 3 de x.  /  Reduce x en 1.`],
      ["Mostrar", `Muestra x.  /  Imprime el valor de x.\nPor favor di "hola".  /  Dime sobre score.\n¿Cuánto vale x?`],
      ["Si", `Si x es mayor que 3, entonces muestra x.\nCuando score es al menos 100, di "¡ganaste!".\nEn caso de que edad sea como máximo 17, muestra "menor".`],
      ["Repetir", `Repite 5 veces: por favor suma 1 a x.\nHaz lo siguiente 3 veces: muestra "hola".\n4 veces seguidas, aumenta x en 2.`],
    ],
    fr: [
      ["Affecter", `Soit x égal à 5.  /  Définis score comme 0.\nSupposons que age est 30.  /  Maintenant total devient 100.\nCrée une variable appelée nom avec la valeur "Ana".\nRange 42 dans reponse.  /  Assigne 7 à chance.`],
      ["Calcul", `Soit y égal à 3 plus 4 fois 2 moins 1.`],
      ["Modifier", `Ajoute 1 à x.  /  Augmente x de 1.\nDonne à x 5 de plus.  /  Retire 3 de x.  /  Réduis x de 1.`],
      ["Afficher", `Affiche x.  /  Imprime la valeur de x.\nS'il te plaît dis "salut".  /  Dis-moi la valeur de score.\nQue vaut x ?`],
      ["Si", `Si x est plus grand que 3, alors affiche x.\nQuand score est au moins 100, dis "gagné !".\nAu cas où age est au plus 17, affiche "mineur".`],
      ["Répéter", `Répète 5 fois : s'il te plaît ajoute 1 à x.\nFais ceci 3 fois : affiche "salut".\n4 fois de suite, augmente x de 2.`],
    ],
    de: [
      ["Zuweisen", `Sei x gleich 5.  /  Definiere score als 0.\nAngenommen alter ist 30.  /  Jetzt wird total gleich 100.\nErstelle eine Variable namens name mit dem Wert "Ana".\nSpeichere 42 in antwort.  /  Weise 7 dem glueck zu.`],
      ["Rechnen", `Setze y auf 3 plus 4 mal 2 minus 1.`],
      ["Ändern", `Addiere 1 zu x.  /  Erhoehe x um 1.\nGib dem x 5 dazu.  /  Nimm 3 von x.  /  Verringere x um 1.`],
      ["Ausgabe", `Zeige x.  /  Drucke den Wert von x.\nBitte sage "hallo".  /  Sag mir den Wert von score.\nWas ist x?`],
      ["Wenn", `Wenn x groesser als 3 ist, dann zeige x.\nSobald score mindestens 100 ist, sage "gewonnen!".\nFalls alter hoechstens 17 ist, zeige "minderjaehrig".`],
      ["Wiederholen", `Wiederhole 5 mal: bitte erhoehe x um 1.\nMache Folgendes 3 mal: zeige "hallo".\n4 mal hintereinander, erhoehe x um 2.`],
    ],
    it: [
      ["Assegnare", `Sia x uguale a 5.  /  Definisci score come 0.\nSupponiamo che eta sia 30.  /  Adesso total diventa 100.\nCrea una variabile chiamata nome con il valore "Ana".\nSalva 42 nel risposta.  /  Assegna 7 a fortuna.`],
      ["Calcolo", `Sia y uguale a 3 più 4 per 2 meno 1.`],
      ["Modificare", `Aggiungi 1 a x.  /  Aumenta x di 1.\nDai a x 5 in più.  /  Togli 3 da x.  /  Riduci x di 1.`],
      ["Mostrare", `Mostra x.  /  Stampa il valore di x.\nPer favore dì "ciao".  /  Dimmi il valore di score.\nQuanto vale x?`],
      ["Se", `Se x è maggiore di 3, allora mostra x.\nQuando score è almeno 100, dì "vinto!".\nNel caso in cui eta sia al massimo 17, mostra "minorenne".`],
      ["Ripetere", `Ripeti 5 volte: per favore aggiungi 1 a x.\nFai questo 3 volte: mostra "ciao".\n4 volte di seguito, aumenta x di 2.`],
    ],
    pt: [
      ["Atribuir", `Seja x igual a 5.  /  Defina score como 0.\nSuponha que idade é 30.  /  Agora total se torna 100.\nCrie uma variável chamada nome com o valor "Ana".\nGuarde 42 em resposta.  /  Atribua 7 a sorte.`],
      ["Aritmética", `Seja y igual a 3 mais 4 vezes 2 menos 1.`],
      ["Modificar", `Some 1 ao x.  /  Aumente x em 1.\nDê ao x 5 a mais.  /  Tire 3 do x.  /  Diminua x em 1.`],
      ["Mostrar", `Mostre x.  /  Imprima o valor de x.\nPor favor diga "oi".  /  Diga-me o valor de score.\nQuanto vale x?`],
      ["Se", `Se x é maior que 3, então mostre x.\nQuando score é pelo menos 100, diga "vitória!".\nCaso idade é no máximo 17, mostre "menor".`],
      ["Repetir", `Repita 5 vezes: por favor some 1 ao x.\nFaça o seguinte 3 vezes: mostre "oi".\n4 vezes seguidas, aumente x em 2.`],
    ],
    ja: [
      ["代入", `counter を 0 にする。\nx は 10 とする。\n42 を answer に 代入する。`],
      ["計算", `3 足す 4 掛ける 2 引く 1`],
      ["変更", `counter に 1 を 足す。\ncounter を 2 増やす。\ncounter から 3 を 引く。\ncounter を 1 減らす。`],
      ["表示", `counter を 表示する。\n"こんにちは" と 言う。`],
      ["条件", `もし counter が 3 より大きい なら、 counter を 表示する。\nもし score が 100 以上 なら、 "勝ち！" と 言う。`],
      ["繰り返し", `5 回 繰り返す: counter に 1 を 足す。\n3 回、 "やあ" と 言う。`],
    ],
    zh: [
      ["赋值", `设 counter 为 0。\n让 x 等于 10。\n把 42 赋值给 answer。`],
      ["运算", `3 加 4 乘 2 减 1`],
      ["修改", `把 1 加到 counter。\n增加 counter 2。\n从 counter 减去 3。\n减少 counter 1。`],
      ["显示", `显示 counter。\n请 输出 "你好"。\n告诉我 score 的值。`],
      ["条件", `如果 counter 大于 3, 那么 显示 counter。\n当 score 大于等于 100, 时 说 "赢了!"。`],
      ["循环", `重复 5 次: 请把 1 加到 counter。\n连续 3 次, 显示 "嗨"。`],
    ],
  };

  const q = query.trim().toLowerCase();
  const filtered = rows[langId].filter(
    ([label, ex]) => !q || label.toLowerCase().includes(q) || ex.toLowerCase().includes(q),
  );

  return (
    <div className="space-y-3">
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No matches for "{query}".</p>
      )}
      {filtered.map(([label, ex]) => (
        <div key={label} className="border-l-2 border-primary/40 pl-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-0.5 whitespace-pre-line font-mono text-sm text-foreground">{ex}</div>
        </div>
      ))}
    </div>
  );
}
