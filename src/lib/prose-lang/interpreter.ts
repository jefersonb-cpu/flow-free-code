import type { Cond, Expr, LanguagePack, Stmt, Value } from "./types";

export class ProseError extends Error {
  constructor(message: string, public sentence?: string) {
    super(message);
  }
}

const isIdent = (s: string) => /^[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*$/.test(s);

// Leading articles across supported languages — stripped before resolving an identifier.
const ARTICLE_RE = /^(?:the|a|an|el|la|los|las|un|una|le|les|l'|une|der|die|das|den|dem|des|ein|eine|einen|einem|einer|il|lo|gli|i|uno|o|os|as|um|uma)\s+/i;
// Trailing particles (Japanese / Chinese) — also stripped when resolving an identifier.
const TRAILING_PARTICLE_RE = /\s*(?:を|は|が|に|の|へ|で|と|から|まで|より|や|も|的|了|呢|吧|啊)\s*$/;

function stripArticles(s: string): string {
  let t = s.trim();
  while (true) {
    const a = t.replace(ARTICLE_RE, "");
    const b = a.replace(TRAILING_PARTICLE_RE, "");
    const next = b.trim();
    if (next === t) return t;
    t = next;
  }
}

function parseLiteral(token: string, lang: LanguagePack): Expr | null {
  const t = token.trim();
  if (/^-?\d+(\.\d+)?$/.test(t)) return { kind: "lit", value: parseFloat(t) };
  // String literal: "..." or '...'
  const sm = t.match(/^["'](.*)["']$/);
  if (sm) return { kind: "lit", value: sm[1] };
  if (lang.truthy.includes(t.toLowerCase())) return { kind: "lit", value: true };
  if (lang.falsy.includes(t.toLowerCase())) return { kind: "lit", value: false };
  return null;
}

export function makeExprParser(lang: LanguagePack) {
  // Build a single regex of all operator phrases, longest first.
  const opEntries: Array<[string, "+" | "-" | "*" | "/"]> = [];
  (Object.keys(lang.operators) as Array<"+" | "-" | "*" | "/">).forEach((op) => {
    for (const phrase of lang.operators[op]) opEntries.push([phrase, op]);
  });
  opEntries.sort((a, b) => b[0].length - a[0].length);
  const opRegex = new RegExp(
    "\\s+(" + opEntries.map(([p]) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\s+",
    "i",
  );

  function parseAtom(text: string): Expr {
    const raw = text.trim();
    const lit = parseLiteral(raw, lang);
    if (lit) return lit;
    const t = stripArticles(raw);
    if (isIdent(t)) return { kind: "var", name: t };
    throw new ProseError(`I don't understand the value "${raw}".`);
  }

  function parse(text: string): Expr {
    const trimmed = text.trim().replace(/[.!?]+$/, "");
    const m = trimmed.match(opRegex);
    if (!m || m.index === undefined) return parseAtom(trimmed);
    const phrase = m[1].toLowerCase();
    const op = opEntries.find(([p]) => p.toLowerCase() === phrase)![1];
    const left = trimmed.slice(0, m.index);
    const right = trimmed.slice(m.index + m[0].length);
    return { kind: "bin", op, left: parseAtom(left), right: parse(right) };
  }

  return parse;
}

export function makeCondParser(lang: LanguagePack) {
  const parseExpr = makeExprParser(lang);
  // Sort comparators by length to match the longest phrase first.
  const cmps = [...lang.comparators].sort((a, b) => b.phrase.length - a.phrase.length);
  return function parse(text: string): Cond {
    const t = text.trim();
    for (const { phrase, op } of cmps) {
      const re = new RegExp(
        "^(.+?)\\s+" + phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s+(.+)$",
        "i",
      );
      const m = t.match(re);
      if (m) return { op, left: parseExpr(m[1]), right: parseExpr(m[2]) };
    }
    throw new ProseError(`I can't read the condition "${text}".`);
  };
}

export function parseProgram(source: string, lang: LanguagePack): Stmt[] {
  // Split on periods or newlines only (avoids breaking on "!" inside quoted strings).
  const raw = source
    .replace(/\r\n/g, "\n")
    .split(/(?<=\.)\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const parseExpr = makeExprParser(lang);
  const parseCond = makeCondParser(lang);

  function parseSentence(sentence: string): Stmt {
    const text = sentence.replace(/[.!?]+$/, "").trim();
    for (const p of lang.patterns) {
      const m = text.match(p.regex);
      if (m) {
        try {
          return p.build(m.slice(1), parseSentence, parseExpr, parseCond);
        } catch (e) {
          if (e instanceof ProseError && !e.sentence) e.sentence = sentence;
          throw e;
        }
      }
    }
    throw new ProseError(`I don't recognize this sentence.`, sentence);
  }

  return raw.map(parseSentence);
}

export type RunResult = {
  output: string[];
  error?: { message: string; sentence?: string };
};

export function run(source: string, lang: LanguagePack): RunResult {
  const output: string[] = [];
  const vars = new Map<string, Value>();

  function evalExpr(e: Expr): Value {
    if (e.kind === "lit") return e.value;
    if (e.kind === "var") {
      if (!vars.has(e.name)) throw new ProseError(`Unknown name "${e.name}".`);
      return vars.get(e.name)!;
    }
    const l = evalExpr(e.left);
    const r = evalExpr(e.right);
    if (e.op === "+") {
      if (typeof l === "string" || typeof r === "string") return String(l) + String(r);
      return Number(l) + Number(r);
    }
    const ln = Number(l), rn = Number(r);
    if (e.op === "-") return ln - rn;
    if (e.op === "*") return ln * rn;
    if (e.op === "/") return ln / rn;
    return 0;
  }

  function evalCond(c: Cond): boolean {
    const l = evalExpr(c.left), r = evalExpr(c.right);
    switch (c.op) {
      case ">": return Number(l) > Number(r);
      case "<": return Number(l) < Number(r);
      case ">=": return Number(l) >= Number(r);
      case "<=": return Number(l) <= Number(r);
      case "==": return l === r || String(l) === String(r);
      case "!=": return !(l === r || String(l) === String(r));
    }
  }

  function exec(s: Stmt, depth = 0): void {
    if (depth > 200) throw new ProseError("Too much nesting.");
    switch (s.kind) {
      case "assign":
        vars.set(s.name, evalExpr(s.expr));
        return;
      case "addto": {
        const cur = vars.has(s.name) ? Number(vars.get(s.name)) : 0;
        vars.set(s.name, cur + Number(evalExpr(s.expr)));
        return;
      }
      case "subfrom": {
        const cur = vars.has(s.name) ? Number(vars.get(s.name)) : 0;
        vars.set(s.name, cur - Number(evalExpr(s.expr)));
        return;
      }
      case "print":
        output.push(String(evalExpr(s.expr)));
        return;
      case "if":
        if (evalCond(s.cond)) exec(s.then, depth + 1);
        return;
      case "repeat": {
        const n = Math.max(0, Math.floor(Number(evalExpr(s.times))));
        if (n > 10000) throw new ProseError("Too many repetitions (max 10000).");
        for (let i = 0; i < n; i++) exec(s.body, depth + 1);
        return;
      }
    }
  }

  try {
    const program = parseProgram(source, lang);
    for (const s of program) exec(s);
    return { output };
  } catch (e) {
    if (e instanceof ProseError) {
      return { output, error: { message: e.message, sentence: e.sentence } };
    }
    return { output, error: { message: (e as Error).message } };
  }
}
