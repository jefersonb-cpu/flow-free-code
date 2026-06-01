import type { LanguagePack, LangPattern, Stmt } from "./types";

// ---------- Shared pattern factories ----------
function patAssign(re: RegExp): LangPattern {
  return {
    regex: re,
    build: ([name, expr], _i, parseExpr): Stmt => ({
      kind: "assign",
      name,
      expr: parseExpr(expr),
    }),
  };
}
function patAddTo(re: RegExp, exprFirst = true): LangPattern {
  return {
    regex: re,
    build: (g, _i, parseExpr): Stmt => {
      const [expr, name] = exprFirst ? [g[0], g[1]] : [g[1], g[0]];
      return { kind: "addto", name, expr: parseExpr(expr) };
    },
  };
}
function patSubFrom(re: RegExp, exprFirst = true): LangPattern {
  return {
    regex: re,
    build: (g, _i, parseExpr): Stmt => {
      const [expr, name] = exprFirst ? [g[0], g[1]] : [g[1], g[0]];
      return { kind: "subfrom", name, expr: parseExpr(expr) };
    },
  };
}
function patPrint(re: RegExp): LangPattern {
  return {
    regex: re,
    build: ([expr], _i, parseExpr): Stmt => ({ kind: "print", expr: parseExpr(expr) }),
  };
}
function patIf(re: RegExp): LangPattern {
  return {
    regex: re,
    build: ([cond, inner], parseInner, _e, parseCond): Stmt => ({
      kind: "if",
      cond: parseCond(cond),
      then: parseInner(inner),
    }),
  };
}
function patRepeat(re: RegExp): LangPattern {
  return {
    regex: re,
    build: ([times, inner], parseInner, parseExpr): Stmt => ({
      kind: "repeat",
      times: parseExpr(times),
      body: parseInner(inner),
    }),
  };
}

// ---------- English ----------
const english: LanguagePack = {
  id: "en",
  name: "English",
  flag: "🇬🇧",
  sample: `Let counter be 0.
Repeat 5 times: increase counter by 1.
Print counter.
If counter is greater than 3, print "Big number!".`,
  operators: {
    "+": ["plus", "added to"],
    "-": ["minus"],
    "*": ["times", "multiplied by"],
    "/": ["divided by", "over"],
  },
  comparators: [
    { phrase: "is greater than or equal to", op: ">=" },
    { phrase: "is less than or equal to", op: "<=" },
    { phrase: "is greater than", op: ">" },
    { phrase: "is less than", op: "<" },
    { phrase: "is not equal to", op: "!=" },
    { phrase: "is equal to", op: "==" },
    { phrase: "equals", op: "==" },
    { phrase: "is", op: "==" },
  ],
  truthy: ["true", "yes"],
  falsy: ["false", "no"],
  patterns: [
    patAssign(/^Let\s+([A-Za-z_]\w*)\s+be\s+(.+)$/i),
    patAssign(/^Set\s+([A-Za-z_]\w*)\s+to\s+(.+)$/i),
    patAddTo(/^Add\s+(.+?)\s+to\s+([A-Za-z_]\w*)$/i, true),
    patAddTo(/^Increase\s+([A-Za-z_]\w*)\s+by\s+(.+)$/i, false),
    patSubFrom(/^Subtract\s+(.+?)\s+from\s+([A-Za-z_]\w*)$/i, true),
    patSubFrom(/^Decrease\s+([A-Za-z_]\w*)\s+by\s+(.+)$/i, false),
    patIf(/^If\s+(.+?),\s*(?:then\s+)?(.+)$/i),
    patRepeat(/^Repeat\s+(.+?)\s+times?:?\s+(.+)$/i),
    patPrint(/^(?:Print|Show|Display|Say)\s+(.+)$/i),
  ],
};

// ---------- Spanish ----------
const spanish: LanguagePack = {
  id: "es",
  name: "Español",
  flag: "🇪🇸",
  sample: `Sea contador igual a 0.
Repite 5 veces: aumenta contador en 1.
Muestra contador.
Si contador es mayor que 3, muestra "¡Número grande!".`,
  operators: {
    "+": ["más", "mas"],
    "-": ["menos"],
    "*": ["por", "multiplicado por"],
    "/": ["dividido por", "entre"],
  },
  comparators: [
    { phrase: "es mayor o igual que", op: ">=" },
    { phrase: "es menor o igual que", op: "<=" },
    { phrase: "es mayor que", op: ">" },
    { phrase: "es menor que", op: "<" },
    { phrase: "no es igual a", op: "!=" },
    { phrase: "es igual a", op: "==" },
    { phrase: "es", op: "==" },
  ],
  truthy: ["verdadero", "sí", "si"],
  falsy: ["falso", "no"],
  patterns: [
    patAssign(/^Sea\s+([A-Za-zÀ-ÿ_]\w*)\s+igual\s+a\s+(.+)$/i),
    patAssign(/^Define\s+([A-Za-zÀ-ÿ_]\w*)\s+como\s+(.+)$/i),
    patAddTo(/^Suma\s+(.+?)\s+a\s+([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patAddTo(/^Aumenta\s+([A-Za-zÀ-ÿ_]\w*)\s+en\s+(.+)$/i, false),
    patSubFrom(/^Resta\s+(.+?)\s+de\s+([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patSubFrom(/^Disminuye\s+([A-Za-zÀ-ÿ_]\w*)\s+en\s+(.+)$/i, false),
    patIf(/^Si\s+(.+?),\s*(?:entonces\s+)?(.+)$/i),
    patRepeat(/^Repite\s+(.+?)\s+veces:?\s+(.+)$/i),
    patPrint(/^(?:Muestra|Imprime|Di)\s+(.+)$/i),
  ],
};

// ---------- French ----------
const french: LanguagePack = {
  id: "fr",
  name: "Français",
  flag: "🇫🇷",
  sample: `Soit compteur égal à 0.
Répète 5 fois : augmente compteur de 1.
Affiche compteur.
Si compteur est plus grand que 3, affiche "Grand nombre !".`,
  operators: {
    "+": ["plus"],
    "-": ["moins"],
    "*": ["fois", "multiplié par"],
    "/": ["divisé par", "sur"],
  },
  comparators: [
    { phrase: "est plus grand ou égal à", op: ">=" },
    { phrase: "est plus petit ou égal à", op: "<=" },
    { phrase: "est plus grand que", op: ">" },
    { phrase: "est plus petit que", op: "<" },
    { phrase: "n'est pas égal à", op: "!=" },
    { phrase: "est égal à", op: "==" },
    { phrase: "vaut", op: "==" },
    { phrase: "est", op: "==" },
  ],
  truthy: ["vrai", "oui"],
  falsy: ["faux", "non"],
  patterns: [
    patAssign(/^Soit\s+([A-Za-zÀ-ÿ_]\w*)\s+égal\s+à\s+(.+)$/i),
    patAssign(/^Définis\s+([A-Za-zÀ-ÿ_]\w*)\s+à\s+(.+)$/i),
    patAddTo(/^Ajoute\s+(.+?)\s+à\s+([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patAddTo(/^Augmente\s+([A-Za-zÀ-ÿ_]\w*)\s+de\s+(.+)$/i, false),
    patSubFrom(/^Soustrais\s+(.+?)\s+de\s+([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patSubFrom(/^Diminue\s+([A-Za-zÀ-ÿ_]\w*)\s+de\s+(.+)$/i, false),
    patIf(/^Si\s+(.+?),\s*(?:alors\s+)?(.+)$/i),
    patRepeat(/^Répète\s+(.+?)\s+fois\s*:?\s+(.+)$/i),
    patPrint(/^(?:Affiche|Imprime|Dis)\s+(.+)$/i),
  ],
};

// ---------- German ----------
const german: LanguagePack = {
  id: "de",
  name: "Deutsch",
  flag: "🇩🇪",
  sample: `Sei zaehler gleich 0.
Wiederhole 5 mal: erhoehe zaehler um 1.
Zeige zaehler.
Wenn zaehler groesser als 3 ist, zeige "Grosse Zahl!".`,
  operators: {
    "+": ["plus"],
    "-": ["minus"],
    "*": ["mal", "multipliziert mit"],
    "/": ["geteilt durch"],
  },
  comparators: [
    { phrase: "groesser oder gleich", op: ">=" },
    { phrase: "kleiner oder gleich", op: "<=" },
    { phrase: "groesser als", op: ">" },
    { phrase: "kleiner als", op: "<" },
    { phrase: "ungleich", op: "!=" },
    { phrase: "gleich", op: "==" },
    { phrase: "ist", op: "==" },
  ],
  truthy: ["wahr", "ja"],
  falsy: ["falsch", "nein"],
  patterns: [
    patAssign(/^Sei\s+([A-Za-zÄÖÜäöüß_]\w*)\s+gleich\s+(.+)$/i),
    patAssign(/^Setze\s+([A-Za-zÄÖÜäöüß_]\w*)\s+auf\s+(.+)$/i),
    patAddTo(/^Addiere\s+(.+?)\s+zu\s+([A-Za-zÄÖÜäöüß_]\w*)$/i, true),
    patAddTo(/^Erhoehe\s+([A-Za-zÄÖÜäöüß_]\w*)\s+um\s+(.+)$/i, false),
    patSubFrom(/^Subtrahiere\s+(.+?)\s+von\s+([A-Za-zÄÖÜäöüß_]\w*)$/i, true),
    patSubFrom(/^Verringere\s+([A-Za-zÄÖÜäöüß_]\w*)\s+um\s+(.+)$/i, false),
    // German: "Wenn X ist, dann Y" — capture the condition before "ist"
    {
      regex: /^Wenn\s+(.+?)\s+ist,\s*(?:dann\s+)?(.+)$/i,
      build: ([cond, inner], parseInner, _e, parseCond): Stmt => ({
        kind: "if",
        cond: parseCond(cond),
        then: parseInner(inner),
      }),
    },
    patIf(/^Wenn\s+(.+?),\s*(?:dann\s+)?(.+)$/i),
    patRepeat(/^Wiederhole\s+(.+?)\s+mal\s*:?\s+(.+)$/i),
    patPrint(/^(?:Zeige|Drucke|Sage)\s+(.+)$/i),
  ],
};

// ---------- Italian ----------
const italian: LanguagePack = {
  id: "it",
  name: "Italiano",
  flag: "🇮🇹",
  sample: `Sia contatore uguale a 0.
Ripeti 5 volte: aumenta contatore di 1.
Mostra contatore.
Se contatore è maggiore di 3, mostra "Numero grande!".`,
  operators: {
    "+": ["più", "piu"],
    "-": ["meno"],
    "*": ["per", "moltiplicato per"],
    "/": ["diviso", "diviso per"],
  },
  comparators: [
    { phrase: "è maggiore o uguale a", op: ">=" },
    { phrase: "è minore o uguale a", op: "<=" },
    { phrase: "è maggiore di", op: ">" },
    { phrase: "è minore di", op: "<" },
    { phrase: "non è uguale a", op: "!=" },
    { phrase: "è uguale a", op: "==" },
    { phrase: "è", op: "==" },
  ],
  truthy: ["vero", "sì", "si"],
  falsy: ["falso", "no"],
  patterns: [
    patAssign(/^Sia\s+([A-Za-zÀ-ÿ_]\w*)\s+uguale\s+a\s+(.+)$/i),
    patAssign(/^Imposta\s+([A-Za-zÀ-ÿ_]\w*)\s+a\s+(.+)$/i),
    patAddTo(/^Aggiungi\s+(.+?)\s+a\s+([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patAddTo(/^Aumenta\s+([A-Za-zÀ-ÿ_]\w*)\s+di\s+(.+)$/i, false),
    patSubFrom(/^Sottrai\s+(.+?)\s+da\s+([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patSubFrom(/^Diminuisci\s+([A-Za-zÀ-ÿ_]\w*)\s+di\s+(.+)$/i, false),
    patIf(/^Se\s+(.+?),\s*(?:allora\s+)?(.+)$/i),
    patRepeat(/^Ripeti\s+(.+?)\s+volte:?\s+(.+)$/i),
    patPrint(/^(?:Mostra|Stampa|Dì|Di)\s+(.+)$/i),
  ],
};

export const LANGUAGES: LanguagePack[] = [english, spanish, french, german, italian];
export function getLanguage(id: string): LanguagePack {
  return LANGUAGES.find((l) => l.id === id) ?? english;
}
