import type { Cond, Expr, LanguagePack, Stmt, Value } from "./types";

export class ProseError extends Error {
  constructor(message: string, public sentence?: string) {
    super(message);
  }
}

const isIdent = (s: string) =>
  /^[A-Za-zÀ-ÿ_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF][A-Za-zÀ-ÿ0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]*$/.test(s);

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
  const opEntries: Array<[string, "+" | "-" | "*" | "/" | "%" | "**" | "//"]> = [];
  (Object.keys(lang.operators) as Array<"+" | "-" | "*" | "/" | "%" | "**" | "//">).forEach((op) => {
    for (const phrase of lang.operators[op] ?? []) opEntries.push([phrase, op]);
  });
  opEntries.sort((a, b) => b[0].length - a[0].length);
  const opAlt = opEntries.map(([p]) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const opRegex = new RegExp("\\s+(" + opAlt + ")\\s+", "i");

  // Split on top-level commas, ignoring those nested in parens / brackets / quotes.
  function splitTopLevelCommas(text: string): string[] {
    const out: string[] = [];
    let depth = 0, quote: string | null = null, start = 0;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quote) { if (c === quote && text[i - 1] !== "\\") quote = null; continue; }
      if (c === '"' || c === "'") { quote = c; continue; }
      if (c === "(" || c === "[") depth++;
      else if (c === ")" || c === "]") depth--;
      else if (c === "," && depth === 0) { out.push(text.slice(start, i)); start = i + 1; }
    }
    out.push(text.slice(start));
    return out.map((s) => s.trim()).filter(Boolean);
  }

  // Find op match outside parens/quotes; returns earliest match index (left-assoc by recursing right).
  function findOpSplit(text: string): { index: number; len: number; phrase: string } | null {
    let depth = 0, quote: string | null = null;
    const mask = text.split("");
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quote) { if (c === quote && text[i - 1] !== "\\") quote = null; mask[i] = " "; continue; }
      if (c === '"' || c === "'") { quote = c; mask[i] = " "; continue; }
      if (c === "(" || c === "[") { depth++; mask[i] = " "; continue; }
      if (c === ")" || c === "]") { depth--; mask[i] = " "; continue; }
      if (depth > 0) mask[i] = " ";
    }
    const masked = mask.join("");
    const m = masked.match(opRegex);
    if (!m || m.index === undefined) return null;
    return { index: m.index, len: m[0].length, phrase: m[1] };
  }

  function parseAtom(text: string): Expr {
    const raw = text.trim();
    const lit = parseLiteral(raw, lang);
    if (lit) return lit;
    // Parenthesized expression
    if (raw.startsWith("(") && raw.endsWith(")")) {
      return parse(raw.slice(1, -1));
    }
    // Built-in function call:  name(args)  or  Name.method(args)
    const callMatch = raw.match(/^([A-Za-z_][\w.]*)\s*\((.*)\)\s*$/s);
    if (callMatch && lang.builtins && lang.builtins[callMatch[1]]) {
      const args = splitTopLevelCommas(callMatch[2]).map(parse);
      return { kind: "call", name: callMatch[1], args };
    }
    // Property-style call:  expr.length  →  length(expr)
    const propMatch = raw.match(/^(.+)\.([A-Za-z_]\w*)$/);
    if (propMatch && lang.builtins && lang.builtins[propMatch[2]]) {
      return { kind: "call", name: propMatch[2], args: [parse(propMatch[1])] };
    }
    const t = stripArticles(raw);
    if (isIdent(t)) return { kind: "var", name: t };
    throw new ProseError(`I don't understand the value "${raw}".`);
  }

  function parse(text: string): Expr {
    const trimmed = text.trim().replace(/[.!?]+$/, "");
    const split = findOpSplit(trimmed);
    if (!split) return parseAtom(trimmed);
    const phrase = split.phrase.toLowerCase();
    const op = opEntries.find(([p]) => p.toLowerCase() === phrase)![1];
    const left = trimmed.slice(0, split.index);
    const right = trimmed.slice(split.index + split.len);
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
      const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Standard order: "left <phrase> right"
      const reMid = new RegExp("^(.+?)\\s+" + esc + "\\s+(.+)$", "i");
      const m1 = t.match(reMid);
      if (m1) return { op, left: parseExpr(m1[1]), right: parseExpr(m1[2]) };
      // Suffix order (Japanese/Chinese): "left right <phrase>"  e.g. "x が 3 より大きい"
      const reEnd = new RegExp("^(.+)\\s+(\\S+)\\s+" + esc + "$", "i");
      const m2 = t.match(reEnd);
      if (m2) return { op, left: parseExpr(m2[1]), right: parseExpr(m2[2]) };
    }
    throw new ProseError(`I can't read the condition "${text}".`);
  };
}

export function parseProgram(source: string, lang: LanguagePack): Stmt[] {
  // Split on Latin period+space, CJK period (。), or newlines. Avoids breaking on "!" inside strings.
  const raw = source
    .replace(/\r\n/g, "\n")
    .split(/(?<=\.)\s+|(?<=[。｡])\s*|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const parseExpr = makeExprParser(lang);
  const parseCond = makeCondParser(lang);

  // Discourse openers stripped from the start of any sentence before pattern matching.
  // Covers all supported languages so patterns don't each need to list them.
  const OPENERS_RE =
    /^(?:please|kindly|now|finally,?|then,?|next,?|after\s+that,?|por\s+favor|ahora|finalmente,?|luego,?|entonces,?|s'il\s+te\s+pla[îi]t|maintenant|enfin,?|ensuite,?|puis,?|bitte|jetzt|schliesslich,?|dann,?|danach,?|per\s+favore|ora|adesso|infine,?|poi,?|dopo,?|agora|finalmente,?|depois,?|então,?|entao,?|请|现在|最后[,，]?|然后[,，]?|接下来[,，]?)\s+/i;

  function parseSentence(sentence: string): Stmt {
    let text = sentence.replace(/[.!?。｡！？]+$/, "").trim();
    // Strip one or more leading discourse openers so patterns match the core sentence.
    while (true) {
      const next = text.replace(OPENERS_RE, "");
      if (next === text) break;
      text = next.trim();
    }
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
    if (e.kind === "call") {
      const fn = lang.builtins?.[e.name];
      if (!fn) throw new ProseError(`Unknown function "${e.name}".`);
      return fn(e.args.map(evalExpr));
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
    if (e.op === "%") return ln % rn;
    if (e.op === "**") return Math.pow(ln, rn);
    if (e.op === "//") {
      if (rn === 0) throw new ProseError("Division by zero.");
      return Math.floor(ln / rn);
    }
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
      case "noop":
        return;
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
      case "mulby": {
        const cur = vars.has(s.name) ? Number(vars.get(s.name)) : 0;
        vars.set(s.name, cur * Number(evalExpr(s.expr)));
        return;
      }
      case "divby": {
        const cur = vars.has(s.name) ? Number(vars.get(s.name)) : 0;
        const d = Number(evalExpr(s.expr));
        if (d === 0) throw new ProseError("Division by zero.");
        vars.set(s.name, cur / d);
        return;
      }
      case "print":
        output.push(String(evalExpr(s.expr)));
        return;
      case "if":
        if (evalCond(s.cond)) exec(s.then, depth + 1);
        return;
      case "ifelse":
        if (evalCond(s.cond)) exec(s.then, depth + 1);
        else exec(s.else, depth + 1);
        return;
      case "repeat": {
        const n = Math.max(0, Math.floor(Number(evalExpr(s.times))));
        if (n > 10000) throw new ProseError("Too many repetitions (max 10000).");
        for (let i = 0; i < n; i++) exec(s.body, depth + 1);
        return;
      }
      case "while": {
        let guard = 0;
        while (evalCond(s.cond)) {
          if (++guard > 10000) throw new ProseError("While loop ran too long (max 10000 iterations).");
          exec(s.body, depth + 1);
        }
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
