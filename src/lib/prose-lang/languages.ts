import type { LanguagePack, LangPattern, Stmt, Value } from "./types";

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
function patAssignSwapped(re: RegExp): LangPattern {
  // For patterns where the value comes BEFORE the name, e.g. "Give x the value 5" -> ... actually still name-first.
  // Used for "Store 5 in x" style.
  return {
    regex: re,
    build: ([expr, name], _i, parseExpr): Stmt => ({
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
function patRepeatSwapped(re: RegExp): LangPattern {
  // For "Do <body> <times> times" style — body first, then count.
  return {
    regex: re,
    build: ([inner, times], parseInner, parseExpr): Stmt => ({
      kind: "repeat",
      times: parseExpr(times),
      body: parseInner(inner),
    }),
  };
}
function patMulBy(re: RegExp, exprFirst = false): LangPattern {
  return {
    regex: re,
    build: (g, _i, parseExpr): Stmt => {
      const [expr, name] = exprFirst ? [g[0], g[1]] : [g[1], g[0]];
      return { kind: "mulby", name, expr: parseExpr(expr) };
    },
  };
}
function patDivBy(re: RegExp, exprFirst = false): LangPattern {
  return {
    regex: re,
    build: (g, _i, parseExpr): Stmt => {
      const [expr, name] = exprFirst ? [g[0], g[1]] : [g[1], g[0]];
      return { kind: "divby", name, expr: parseExpr(expr) };
    },
  };
}
function patWhile(re: RegExp): LangPattern {
  return {
    regex: re,
    build: ([cond, inner], parseInner, _e, parseCond): Stmt => ({
      kind: "while",
      cond: parseCond(cond),
      body: parseInner(inner),
    }),
  };
}
function patIfElse(re: RegExp): LangPattern {
  return {
    regex: re,
    build: ([cond, thn, els], parseInner, _e, parseCond): Stmt => ({
      kind: "ifelse",
      cond: parseCond(cond),
      then: parseInner(thn),
      else: parseInner(els),
    }),
  };
}
function patComment(re: RegExp): LangPattern {
  return { regex: re, build: (): Stmt => ({ kind: "noop" }) };
}

// ---------- English ----------
const english: LanguagePack = {
  id: "en",
  name: "English",
  flag: "🇬🇧",
  sample: `Let the counter be 0.
Repeat 5 times: please increase the counter by 1.
Kindly show me the counter.
If the counter is greater than 3, then say "That is a big number!".
Now give the counter 10 more.
Finally, print "The final value is " plus the counter.`,
  operators: {
    "+": ["plus", "added to", "combined with", "and then"],
    "-": ["minus", "less"],
    "*": ["times", "multiplied by"],
    "/": ["divided by", "over"],
  },
  comparators: [
    { phrase: "is greater than or equal to", op: ">=" },
    { phrase: "is less than or equal to", op: "<=" },
    { phrase: "is at least", op: ">=" },
    { phrase: "is at most", op: "<=" },
    { phrase: "is greater than", op: ">" },
    { phrase: "is bigger than", op: ">" },
    { phrase: "is more than", op: ">" },
    { phrase: "is less than", op: "<" },
    { phrase: "is smaller than", op: "<" },
    { phrase: "is fewer than", op: "<" },
    { phrase: "is not equal to", op: "!=" },
    { phrase: "is different from", op: "!=" },
    { phrase: "is the same as", op: "==" },
    { phrase: "is equal to", op: "==" },
    { phrase: "equals", op: "==" },
    { phrase: "matches", op: "==" },
    { phrase: "is", op: "==" },
  ],
  truthy: ["true", "yes"],
  falsy: ["false", "no"],
  patterns: [
    // --- Assignment (many natural variants) ---
    patAssign(/^(?:Please\s+)?Let\s+(?:the\s+)?([A-Za-z_]\w*)\s+be\s+(?:equal\s+to\s+)?(.+)$/i),
    patAssign(/^(?:Please\s+)?Set\s+(?:the\s+)?([A-Za-z_]\w*)\s+to\s+(.+)$/i),
    patAssign(/^(?:Please\s+)?Define\s+(?:the\s+)?([A-Za-z_]\w*)\s+as\s+(.+)$/i),
    patAssign(/^(?:Please\s+)?Make\s+(?:the\s+)?([A-Za-z_]\w*)\s+(?:equal\s+to|be)\s+(.+)$/i),
    patAssign(/^Suppose\s+(?:that\s+)?(?:the\s+)?([A-Za-z_]\w*)\s+is\s+(.+)$/i),
    patAssign(/^Assume\s+(?:that\s+)?(?:the\s+)?([A-Za-z_]\w*)\s+(?:is|equals)\s+(.+)$/i),
    patAssign(/^Imagine\s+(?:that\s+)?(?:the\s+)?([A-Za-z_]\w*)\s+(?:is|equals)\s+(.+)$/i),
    patAssign(/^Now\s+(?:the\s+)?([A-Za-z_]\w*)\s+(?:is|becomes|equals)\s+(.+)$/i),
    patAssign(/^(?:Create|Declare)\s+(?:a\s+)?(?:new\s+)?(?:variable\s+)?(?:called\s+)?([A-Za-z_]\w*)\s+(?:with\s+(?:the\s+)?value\s+|equal\s+to\s+|holding\s+|as\s+)(.+)$/i),
    patAssignSwapped(/^(?:Please\s+)?Store\s+(.+?)\s+(?:in|into)\s+(?:the\s+)?([A-Za-z_]\w*)$/i),
    patAssignSwapped(/^(?:Please\s+)?(?:Save|Put|Place)\s+(.+?)\s+(?:in|into)\s+(?:the\s+)?([A-Za-z_]\w*)$/i),
    patAssignSwapped(/^(?:Please\s+)?Assign\s+(.+?)\s+to\s+(?:the\s+)?([A-Za-z_]\w*)$/i),

    // --- Add / Increase ---
    patAddTo(/^(?:Please\s+)?Add\s+(.+?)\s+(?:to|into|onto)\s+(?:the\s+)?([A-Za-z_]\w*)$/i, true),
    patAddTo(/^(?:Please\s+)?(?:Increase|Increment|Raise|Grow|Bump)\s+(?:the\s+)?([A-Za-z_]\w*)\s+by\s+(.+)$/i, false),
    patAddTo(/^(?:Please\s+)?Give\s+(?:the\s+)?([A-Za-z_]\w*)\s+(.+?)\s+more$/i, false),

    // --- Subtract / Decrease ---
    patSubFrom(/^(?:Please\s+)?(?:Subtract|Remove|Take)\s+(.+?)\s+(?:from|off|away\s+from)\s+(?:the\s+)?([A-Za-z_]\w*)$/i, true),
    patSubFrom(/^(?:Please\s+)?(?:Decrease|Decrement|Reduce|Lower|Shrink)\s+(?:the\s+)?([A-Za-z_]\w*)\s+by\s+(.+)$/i, false),

    // --- Conditionals ---
    patIf(/^If\s+(.+?),\s*(?:then\s+)?(.+)$/i),
    patIf(/^Whenever\s+(.+?),\s*(.+)$/i),
    patIf(/^In\s+case\s+(.+?),\s*(.+)$/i),
    patIf(/^Provided\s+that\s+(.+?),\s*(.+)$/i),
    patIf(/^Only\s+if\s+(.+?),\s*(.+)$/i),

    // --- Repeat ---
    patRepeat(/^(?:Please\s+)?Repeat\s+(.+?)\s+times?:?\s+(.+)$/i),
    patRepeat(/^Do\s+the\s+following\s+(.+?)\s+times?:?\s+(.+)$/i),
    patRepeat(/^(.+?)\s+times?\s+in\s+a\s+row,?\s+(.+)$/i),
    patRepeatSwapped(/^Do\s+this\s+(.+?)\s+a\s+total\s+of\s+(.+?)\s+times?$/i),

    // --- Print / Display ---
    patPrint(/^(?:Please\s+|Kindly\s+|Now\s+|Finally,?\s+)?(?:Print|Show|Display|Say|Write|Output|Announce|Log|Echo|Report)\s+(?:me\s+|out\s+|the\s+value\s+of\s+)?(.+)$/i),
    patPrint(/^(?:Please\s+)?Tell\s+(?:me|us)\s+(?:about\s+|the\s+value\s+of\s+)?(.+)$/i),
    patPrint(/^What\s+is\s+(.+?)\??$/i),
  ],
};

// ---------- Spanish ----------
const spanish: LanguagePack = {
  id: "es",
  name: "Español",
  flag: "🇪🇸",
  sample: `Sea el contador igual a 0.
Repite 5 veces: por favor aumenta el contador en 1.
Por favor muestra el contador.
Si el contador es mayor que 3, entonces di "¡Qué número tan grande!".
Ahora dale al contador 10 más.
Finalmente, imprime "El valor final es " más el contador.`,
  operators: {
    "+": ["más", "mas", "sumado a", "junto con"],
    "-": ["menos"],
    "*": ["por", "multiplicado por"],
    "/": ["dividido por", "entre"],
  },
  comparators: [
    { phrase: "es mayor o igual que", op: ">=" },
    { phrase: "es menor o igual que", op: "<=" },
    { phrase: "es al menos", op: ">=" },
    { phrase: "es como máximo", op: "<=" },
    { phrase: "es mayor que", op: ">" },
    { phrase: "es más grande que", op: ">" },
    { phrase: "es menor que", op: "<" },
    { phrase: "es más pequeño que", op: "<" },
    { phrase: "no es igual a", op: "!=" },
    { phrase: "es distinto de", op: "!=" },
    { phrase: "es diferente de", op: "!=" },
    { phrase: "es igual a", op: "==" },
    { phrase: "equivale a", op: "==" },
    { phrase: "es lo mismo que", op: "==" },
    { phrase: "es", op: "==" },
  ],
  truthy: ["verdadero", "sí", "si"],
  falsy: ["falso", "no"],
  patterns: [
    // Assign
    patAssign(/^(?:Por\s+favor\s+)?Sea\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)\s+igual\s+a\s+(.+)$/i),
    patAssign(/^(?:Por\s+favor\s+)?Define\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)\s+como\s+(.+)$/i),
    patAssign(/^(?:Por\s+favor\s+)?Haz\s+que\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)\s+(?:sea|valga)\s+(.+)$/i),
    patAssign(/^Supongamos\s+que\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)\s+(?:es|vale)\s+(.+)$/i),
    patAssign(/^Imagina\s+que\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)\s+(?:es|vale)\s+(.+)$/i),
    patAssign(/^Ahora\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)\s+(?:es|vale|se\s+convierte\s+en)\s+(.+)$/i),
    patAssign(/^(?:Crea|Declara)\s+(?:una\s+)?(?:nueva\s+)?(?:variable\s+)?(?:llamada\s+)?([A-Za-zÀ-ÿ_]\w*)\s+(?:con\s+(?:el\s+)?valor\s+|igual\s+a\s+|como\s+)(.+)$/i),
    patAssignSwapped(/^(?:Por\s+favor\s+)?(?:Guarda|Almacena|Pon|Coloca)\s+(.+?)\s+en\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)$/i),
    patAssignSwapped(/^(?:Por\s+favor\s+)?Asigna\s+(.+?)\s+a\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)$/i),

    // Add
    patAddTo(/^(?:Por\s+favor\s+)?(?:Suma|Añade|Agrega)\s+(.+?)\s+a\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patAddTo(/^(?:Por\s+favor\s+)?(?:Aumenta|Incrementa)\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)\s+en\s+(.+)$/i, false),
    patAddTo(/^(?:Por\s+favor\s+)?Dale\s+a\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)\s+(.+?)\s+más$/i, false),

    // Sub
    patSubFrom(/^(?:Por\s+favor\s+)?(?:Resta|Quita|Sustrae)\s+(.+?)\s+(?:de|a)\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patSubFrom(/^(?:Por\s+favor\s+)?(?:Disminuye|Decrementa|Reduce)\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)\s+en\s+(.+)$/i, false),

    // If
    patIf(/^Si\s+(.+?),\s*(?:entonces\s+)?(.+)$/i),
    patIf(/^Cuando\s+(.+?),\s*(.+)$/i),
    patIf(/^En\s+caso\s+de\s+que\s+(.+?),\s*(.+)$/i),
    patIf(/^Siempre\s+que\s+(.+?),\s*(.+)$/i),

    // Repeat
    patRepeat(/^(?:Por\s+favor\s+)?Repite\s+(.+?)\s+veces:?\s+(.+)$/i),
    patRepeat(/^Haz\s+lo\s+siguiente\s+(.+?)\s+veces:?\s+(.+)$/i),
    patRepeat(/^(.+?)\s+veces\s+seguidas,?\s+(.+)$/i),

    // Print
    patPrint(/^(?:Por\s+favor\s+|Ahora\s+|Finalmente,?\s+)?(?:Muestra|Imprime|Di|Escribe|Anuncia|Reporta)\s+(?:me\s+|el\s+valor\s+de\s+)?(.+)$/i),
    patPrint(/^(?:Por\s+favor\s+)?Dime\s+(?:el\s+valor\s+de\s+|sobre\s+)?(.+)$/i),
    patPrint(/^¿?Cuánto\s+(?:vale|es)\s+(.+?)\??$/i),
  ],
};

// ---------- French ----------
const french: LanguagePack = {
  id: "fr",
  name: "Français",
  flag: "🇫🇷",
  sample: `Soit le compteur égal à 0.
Répète 5 fois : s'il te plaît augmente le compteur de 1.
Affiche s'il te plaît le compteur.
Si le compteur est plus grand que 3, alors dis "Quel grand nombre !".
Maintenant donne au compteur 10 de plus.
Enfin, affiche "La valeur finale est " plus le compteur.`,
  operators: {
    "+": ["plus", "ajouté à"],
    "-": ["moins"],
    "*": ["fois", "multiplié par"],
    "/": ["divisé par", "sur"],
  },
  comparators: [
    { phrase: "est plus grand ou égal à", op: ">=" },
    { phrase: "est plus petit ou égal à", op: "<=" },
    { phrase: "est au moins", op: ">=" },
    { phrase: "est au plus", op: "<=" },
    { phrase: "est plus grand que", op: ">" },
    { phrase: "est supérieur à", op: ">" },
    { phrase: "est plus petit que", op: "<" },
    { phrase: "est inférieur à", op: "<" },
    { phrase: "n'est pas égal à", op: "!=" },
    { phrase: "est différent de", op: "!=" },
    { phrase: "est égal à", op: "==" },
    { phrase: "est le même que", op: "==" },
    { phrase: "vaut", op: "==" },
    { phrase: "est", op: "==" },
  ],
  truthy: ["vrai", "oui"],
  falsy: ["faux", "non"],
  patterns: [
    // Assign
    patAssign(/^(?:S'il\s+te\s+plaît\s+)?Soit\s+(?:le\s+|la\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+égal\s+à\s+(.+)$/i),
    patAssign(/^(?:S'il\s+te\s+plaît\s+)?Définis\s+(?:le\s+|la\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+(?:comme|à)\s+(.+)$/i),
    patAssign(/^(?:S'il\s+te\s+plaît\s+)?Fais\s+que\s+(?:le\s+|la\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+(?:soit|vaille)\s+(.+)$/i),
    patAssign(/^Supposons\s+que\s+(?:le\s+|la\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+(?:est|vaut|soit)\s+(.+)$/i),
    patAssign(/^Imagine\s+que\s+(?:le\s+|la\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+(?:est|vaut)\s+(.+)$/i),
    patAssign(/^Maintenant\s+(?:le\s+|la\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+(?:est|vaut|devient)\s+(.+)$/i),
    patAssign(/^(?:Crée|Déclare)\s+(?:une\s+)?(?:nouvelle\s+)?(?:variable\s+)?(?:appelée\s+)?([A-Za-zÀ-ÿ_]\w*)\s+(?:avec\s+(?:la\s+)?valeur\s+|égale\s+à\s+|comme\s+)(.+)$/i),
    patAssignSwapped(/^(?:S'il\s+te\s+plaît\s+)?(?:Range|Stocke|Mets|Place)\s+(.+?)\s+dans\s+(?:le\s+|la\s+|l')?([A-Za-zÀ-ÿ_]\w*)$/i),
    patAssignSwapped(/^(?:S'il\s+te\s+plaît\s+)?Assigne\s+(.+?)\s+à\s+(?:le\s+|la\s+|l')?([A-Za-zÀ-ÿ_]\w*)$/i),

    // Add
    patAddTo(/^(?:S'il\s+te\s+plaît\s+)?Ajoute\s+(.+?)\s+à\s+(?:le\s+|la\s+|l')?([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patAddTo(/^(?:S'il\s+te\s+plaît\s+)?(?:Augmente|Incrémente)\s+(?:le\s+|la\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+de\s+(.+)$/i, false),
    patAddTo(/^(?:S'il\s+te\s+plaît\s+)?Donne\s+(?:au?\s+|à\s+la\s+|à\s+l')?([A-Za-zÀ-ÿ_]\w*)\s+(.+?)\s+de\s+plus$/i, false),

    // Sub
    patSubFrom(/^(?:S'il\s+te\s+plaît\s+)?(?:Soustrais|Retire|Enlève)\s+(.+?)\s+(?:de|à)\s+(?:le\s+|la\s+|l')?([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patSubFrom(/^(?:S'il\s+te\s+plaît\s+)?(?:Diminue|Décrémente|Réduis)\s+(?:le\s+|la\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+de\s+(.+)$/i, false),

    // If
    patIf(/^Si\s+(.+?),\s*(?:alors\s+)?(.+)$/i),
    patIf(/^Quand\s+(.+?),\s*(.+)$/i),
    patIf(/^Lorsque\s+(.+?),\s*(.+)$/i),
    patIf(/^Au\s+cas\s+où\s+(.+?),\s*(.+)$/i),

    // Repeat
    patRepeat(/^(?:S'il\s+te\s+plaît\s+)?Répète\s+(.+?)\s+fois\s*:?\s+(.+)$/i),
    patRepeat(/^Fais\s+(?:ceci|cela|ce\s+qui\s+suit)\s+(.+?)\s+fois\s*:?\s+(.+)$/i),
    patRepeat(/^(.+?)\s+fois\s+de\s+suite,?\s+(.+)$/i),

    // Print
    patPrint(/^(?:S'il\s+te\s+plaît\s+|Maintenant\s+|Enfin,?\s+)?(?:Affiche|Imprime|Dis|Écris|Annonce)\s+(?:moi\s+|s'il\s+te\s+plaît\s+|la\s+valeur\s+de\s+)?(.+)$/i),
    patPrint(/^(?:S'il\s+te\s+plaît\s+)?Dis-moi\s+(?:la\s+valeur\s+de\s+)?(.+)$/i),
    patPrint(/^Que\s+vaut\s+(.+?)\s*\??$/i),
  ],
};

// ---------- German ----------
const german: LanguagePack = {
  id: "de",
  name: "Deutsch",
  flag: "🇩🇪",
  sample: `Sei der zaehler gleich 0.
Wiederhole 5 mal: bitte erhoehe den zaehler um 1.
Bitte zeige den zaehler.
Wenn der zaehler groesser als 3 ist, dann sage "Was fuer eine grosse Zahl!".
Jetzt gib dem zaehler 10 dazu.
Schliesslich, drucke "Der Endwert ist " plus den zaehler.`,
  operators: {
    "+": ["plus", "und", "zusammen mit"],
    "-": ["minus", "weniger"],
    "*": ["mal", "multipliziert mit"],
    "/": ["geteilt durch"],
  },
  comparators: [
    { phrase: "groesser oder gleich", op: ">=" },
    { phrase: "kleiner oder gleich", op: "<=" },
    { phrase: "mindestens", op: ">=" },
    { phrase: "hoechstens", op: "<=" },
    { phrase: "groesser als", op: ">" },
    { phrase: "mehr als", op: ">" },
    { phrase: "kleiner als", op: "<" },
    { phrase: "weniger als", op: "<" },
    { phrase: "ungleich", op: "!=" },
    { phrase: "verschieden von", op: "!=" },
    { phrase: "gleich", op: "==" },
    { phrase: "dasselbe wie", op: "==" },
    { phrase: "ist", op: "==" },
  ],
  truthy: ["wahr", "ja"],
  falsy: ["falsch", "nein"],
  patterns: [
    // Assign
    patAssign(/^(?:Bitte\s+)?Sei\s+(?:der\s+|die\s+|das\s+)?([A-Za-zÄÖÜäöüß_]\w*)\s+gleich\s+(.+)$/i),
    patAssign(/^(?:Bitte\s+)?Setze\s+(?:der\s+|die\s+|das\s+|den\s+)?([A-Za-zÄÖÜäöüß_]\w*)\s+auf\s+(.+)$/i),
    patAssign(/^(?:Bitte\s+)?Definiere\s+(?:der\s+|die\s+|das\s+)?([A-Za-zÄÖÜäöüß_]\w*)\s+als\s+(.+)$/i),
    patAssign(/^Angenommen\s+(?:der\s+|die\s+|das\s+)?([A-Za-zÄÖÜäöüß_]\w*)\s+(?:ist|sei)\s+(.+)$/i),
    patAssign(/^Stell\s+dir\s+vor,?\s+(?:der\s+|die\s+|das\s+)?([A-Za-zÄÖÜäöüß_]\w*)\s+ist\s+(.+)$/i),
    patAssign(/^Jetzt\s+(?:ist|wird)\s+(?:der\s+|die\s+|das\s+)?([A-Za-zÄÖÜäöüß_]\w*)\s+(?:gleich\s+)?(.+)$/i),
    patAssign(/^(?:Erstelle|Erzeuge|Erklaere)\s+(?:eine\s+)?(?:neue\s+)?(?:Variable\s+)?(?:namens\s+)?([A-Za-zÄÖÜäöüß_]\w*)\s+(?:mit\s+(?:dem\s+)?Wert\s+|gleich\s+|als\s+)(.+)$/i),
    patAssignSwapped(/^(?:Bitte\s+)?(?:Speichere|Lege|Stecke)\s+(.+?)\s+(?:in|in\s+den|in\s+die|in\s+das)\s+([A-Za-zÄÖÜäöüß_]\w*)$/i),
    patAssignSwapped(/^(?:Bitte\s+)?Weise\s+(.+?)\s+(?:der|dem)\s+([A-Za-zÄÖÜäöüß_]\w*)\s+zu$/i),

    // Add
    patAddTo(/^(?:Bitte\s+)?Addiere\s+(.+?)\s+(?:zu|zur|zum)\s+(?:der\s+|die\s+|das\s+|den\s+)?([A-Za-zÄÖÜäöüß_]\w*)$/i, true),
    patAddTo(/^(?:Bitte\s+)?(?:Erhoehe|Steigere|Vergroessere)\s+(?:der\s+|die\s+|das\s+|den\s+)?([A-Za-zÄÖÜäöüß_]\w*)\s+um\s+(.+)$/i, false),
    patAddTo(/^(?:Bitte\s+)?Gib\s+(?:der\s+|die\s+|das\s+|dem\s+)?([A-Za-zÄÖÜäöüß_]\w*)\s+(.+?)\s+dazu$/i, false),

    // Sub
    patSubFrom(/^(?:Bitte\s+)?(?:Subtrahiere|Entferne|Nimm)\s+(.+?)\s+(?:von|aus)\s+(?:der\s+|die\s+|das\s+|den\s+|dem\s+)?([A-Za-zÄÖÜäöüß_]\w*)$/i, true),
    patSubFrom(/^(?:Bitte\s+)?(?:Verringere|Verkleinere|Reduziere)\s+(?:der\s+|die\s+|das\s+|den\s+)?([A-Za-zÄÖÜäöüß_]\w*)\s+um\s+(.+)$/i, false),

    // If — "Wenn X ist, ..." with condition before "ist"
    {
      regex: /^Wenn\s+(.+?)\s+ist,\s*(?:dann\s+)?(.+)$/i,
      build: ([cond, inner], parseInner, _e, parseCond): Stmt => ({
        kind: "if",
        cond: parseCond(cond),
        then: parseInner(inner),
      }),
    },
    patIf(/^Wenn\s+(.+?),\s*(?:dann\s+)?(.+)$/i),
    patIf(/^Falls\s+(.+?),\s*(?:dann\s+)?(.+)$/i),
    patIf(/^Sobald\s+(.+?),\s*(.+)$/i),
    patIf(/^Immer\s+wenn\s+(.+?),\s*(.+)$/i),

    // Repeat
    patRepeat(/^(?:Bitte\s+)?Wiederhole\s+(.+?)\s+mal\s*:?\s+(.+)$/i),
    patRepeat(/^Mache\s+(?:das|Folgendes)\s+(.+?)\s+mal\s*:?\s+(.+)$/i),
    patRepeat(/^(.+?)\s+mal\s+hintereinander,?\s+(.+)$/i),

    // Print
    patPrint(/^(?:Bitte\s+|Jetzt\s+|Schliesslich,?\s+)?(?:Zeige|Drucke|Sage|Schreibe|Gib\s+aus|Melde)\s+(?:mir\s+|den\s+Wert\s+von\s+)?(.+)$/i),
    patPrint(/^(?:Bitte\s+)?Sag\s+mir\s+(?:den\s+Wert\s+von\s+)?(.+)$/i),
    patPrint(/^Was\s+ist\s+(.+?)\??$/i),
  ],
};

// ---------- Italian ----------
const italian: LanguagePack = {
  id: "it",
  name: "Italiano",
  flag: "🇮🇹",
  sample: `Sia il contatore uguale a 0.
Ripeti 5 volte: per favore aumenta il contatore di 1.
Per favore mostra il contatore.
Se il contatore è maggiore di 3, allora dì "Che numero grande!".
Adesso dai al contatore 10 in più.
Infine, stampa "Il valore finale è " più il contatore.`,
  operators: {
    "+": ["più", "piu", "sommato a"],
    "-": ["meno"],
    "*": ["per", "moltiplicato per"],
    "/": ["diviso", "diviso per"],
  },
  comparators: [
    { phrase: "è maggiore o uguale a", op: ">=" },
    { phrase: "è minore o uguale a", op: "<=" },
    { phrase: "è almeno", op: ">=" },
    { phrase: "è al massimo", op: "<=" },
    { phrase: "è maggiore di", op: ">" },
    { phrase: "è più grande di", op: ">" },
    { phrase: "è minore di", op: "<" },
    { phrase: "è più piccolo di", op: "<" },
    { phrase: "non è uguale a", op: "!=" },
    { phrase: "è diverso da", op: "!=" },
    { phrase: "è uguale a", op: "==" },
    { phrase: "è lo stesso di", op: "==" },
    { phrase: "vale", op: "==" },
    { phrase: "è", op: "==" },
  ],
  truthy: ["vero", "sì", "si"],
  falsy: ["falso", "no"],
  patterns: [
    // Assign
    patAssign(/^(?:Per\s+favore\s+)?Sia\s+(?:il\s+|la\s+|lo\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+uguale\s+a\s+(.+)$/i),
    patAssign(/^(?:Per\s+favore\s+)?Imposta\s+(?:il\s+|la\s+|lo\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+a\s+(.+)$/i),
    patAssign(/^(?:Per\s+favore\s+)?Definisci\s+(?:il\s+|la\s+|lo\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+come\s+(.+)$/i),
    patAssign(/^(?:Per\s+favore\s+)?Fai\s+(?:in\s+modo\s+)?che\s+(?:il\s+|la\s+|lo\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+(?:sia|valga)\s+(.+)$/i),
    patAssign(/^Supponiamo\s+che\s+(?:il\s+|la\s+|lo\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+(?:sia|valga)\s+(.+)$/i),
    patAssign(/^Immagina\s+che\s+(?:il\s+|la\s+|lo\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+(?:sia|valga)\s+(.+)$/i),
    patAssign(/^(?:Ora|Adesso)\s+(?:il\s+|la\s+|lo\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+(?:è|vale|diventa)\s+(.+)$/i),
    patAssign(/^(?:Crea|Dichiara)\s+(?:una\s+)?(?:nuova\s+)?(?:variabile\s+)?(?:chiamata\s+)?([A-Za-zÀ-ÿ_]\w*)\s+(?:con\s+(?:il\s+)?valore\s+|uguale\s+a\s+|come\s+)(.+)$/i),
    patAssignSwapped(/^(?:Per\s+favore\s+)?(?:Salva|Memorizza|Metti|Riponi)\s+(.+?)\s+(?:in|nel|nella|nello)\s+([A-Za-zÀ-ÿ_]\w*)$/i),
    patAssignSwapped(/^(?:Per\s+favore\s+)?Assegna\s+(.+?)\s+a\s+(?:il\s+|la\s+|lo\s+|l')?([A-Za-zÀ-ÿ_]\w*)$/i),

    // Add
    patAddTo(/^(?:Per\s+favore\s+)?Aggiungi\s+(.+?)\s+a\s+(?:il\s+|la\s+|lo\s+|l')?([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patAddTo(/^(?:Per\s+favore\s+)?(?:Aumenta|Incrementa)\s+(?:il\s+|la\s+|lo\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+di\s+(.+)$/i, false),
    patAddTo(/^(?:Per\s+favore\s+)?Dai\s+a\s+(?:il\s+|la\s+|lo\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+(.+?)\s+in\s+più$/i, false),

    // Sub
    patSubFrom(/^(?:Per\s+favore\s+)?(?:Sottrai|Togli|Rimuovi)\s+(.+?)\s+(?:da|a)\s+(?:il\s+|la\s+|lo\s+|l')?([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patSubFrom(/^(?:Per\s+favore\s+)?(?:Diminuisci|Decrementa|Riduci)\s+(?:il\s+|la\s+|lo\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+di\s+(.+)$/i, false),

    // If
    patIf(/^Se\s+(.+?),\s*(?:allora\s+)?(.+)$/i),
    patIf(/^Quando\s+(.+?),\s*(.+)$/i),
    patIf(/^Nel\s+caso\s+in\s+cui\s+(.+?),\s*(.+)$/i),
    patIf(/^Ogni\s+volta\s+che\s+(.+?),\s*(.+)$/i),

    // Repeat
    patRepeat(/^(?:Per\s+favore\s+)?Ripeti\s+(.+?)\s+volte:?\s+(.+)$/i),
    patRepeat(/^Fai\s+(?:quanto\s+segue|questo)\s+(.+?)\s+volte:?\s+(.+)$/i),
    patRepeat(/^(.+?)\s+volte\s+di\s+seguito,?\s+(.+)$/i),

    // Print
    patPrint(/^(?:Per\s+favore\s+|Ora\s+|Adesso\s+|Infine,?\s+)?(?:Mostra|Stampa|Dì|Di|Scrivi|Annuncia|Riporta)\s+(?:mi\s+|il\s+valore\s+di\s+)?(.+)$/i),
    patPrint(/^(?:Per\s+favore\s+)?Dimmi\s+(?:il\s+valore\s+di\s+)?(.+)$/i),
    patPrint(/^Quanto\s+(?:vale|è)\s+(.+?)\??$/i),
  ],
};

// ---------- Portuguese ----------
const portuguese: LanguagePack = {
  id: "pt",
  name: "Português",
  flag: "🇵🇹",
  sample: `Seja o contador igual a 0.
Repita 5 vezes: por favor some 1 ao contador.
Por favor mostre o contador.
Se o contador é maior que 3, então diga "Que número grande!".
Agora dê ao contador 10 a mais.
Finalmente, imprima "O valor final é " mais o contador.`,
  operators: {
    "+": ["mais", "somado a"],
    "-": ["menos"],
    "*": ["vezes", "multiplicado por"],
    "/": ["dividido por", "sobre"],
  },
  comparators: [
    { phrase: "é maior ou igual a", op: ">=" },
    { phrase: "é menor ou igual a", op: "<=" },
    { phrase: "é pelo menos", op: ">=" },
    { phrase: "é no máximo", op: "<=" },
    { phrase: "é maior que", op: ">" },
    { phrase: "é menor que", op: "<" },
    { phrase: "não é igual a", op: "!=" },
    { phrase: "é diferente de", op: "!=" },
    { phrase: "é igual a", op: "==" },
    { phrase: "equivale a", op: "==" },
    { phrase: "é", op: "==" },
  ],
  truthy: ["verdadeiro", "sim"],
  falsy: ["falso", "não", "nao"],
  patterns: [
    patAssign(/^(?:Por\s+favor\s+)?Seja\s+(?:o\s+|a\s+)?([A-Za-zÀ-ÿ_]\w*)\s+igual\s+a\s+(.+)$/i),
    patAssign(/^(?:Por\s+favor\s+)?Defina\s+(?:o\s+|a\s+)?([A-Za-zÀ-ÿ_]\w*)\s+como\s+(.+)$/i),
    patAssign(/^(?:Por\s+favor\s+)?Faça\s+(?:o\s+|a\s+)?([A-Za-zÀ-ÿ_]\w*)\s+(?:ser|valer)\s+(.+)$/i),
    patAssign(/^Suponha\s+que\s+(?:o\s+|a\s+)?([A-Za-zÀ-ÿ_]\w*)\s+(?:é|seja|vale)\s+(.+)$/i),
    patAssign(/^Agora\s+(?:o\s+|a\s+)?([A-Za-zÀ-ÿ_]\w*)\s+(?:é|vale|se\s+torna)\s+(.+)$/i),
    patAssign(/^(?:Crie|Declare)\s+(?:uma\s+)?(?:nova\s+)?(?:variável\s+)?(?:chamada\s+)?([A-Za-zÀ-ÿ_]\w*)\s+(?:com\s+(?:o\s+)?valor\s+|igual\s+a\s+|como\s+)(.+)$/i),
    patAssignSwapped(/^(?:Por\s+favor\s+)?(?:Guarde|Armazene|Coloque)\s+(.+?)\s+em\s+(?:o\s+|a\s+)?([A-Za-zÀ-ÿ_]\w*)$/i),
    patAssignSwapped(/^(?:Por\s+favor\s+)?Atribua\s+(.+?)\s+a\s+(?:o\s+|a\s+)?([A-Za-zÀ-ÿ_]\w*)$/i),

    patAddTo(/^(?:Por\s+favor\s+)?(?:Some|Adicione|Acrescente)\s+(.+?)\s+(?:a|ao|à)\s+(?:o\s+|a\s+)?([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patAddTo(/^(?:Por\s+favor\s+)?(?:Aumente|Incremente|Eleve)\s+(?:o\s+|a\s+)?([A-Za-zÀ-ÿ_]\w*)\s+em\s+(.+)$/i, false),
    patAddTo(/^(?:Por\s+favor\s+)?Dê\s+(?:ao\s+|à\s+|a\s+)?([A-Za-zÀ-ÿ_]\w*)\s+(.+?)\s+a\s+mais$/i, false),

    patSubFrom(/^(?:Por\s+favor\s+)?(?:Subtraia|Tire|Remova)\s+(.+?)\s+(?:de|do|da)\s+(?:o\s+|a\s+)?([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patSubFrom(/^(?:Por\s+favor\s+)?(?:Diminua|Decremente|Reduza)\s+(?:o\s+|a\s+)?([A-Za-zÀ-ÿ_]\w*)\s+em\s+(.+)$/i, false),

    patIf(/^Se\s+(.+?),\s*(?:então\s+|entao\s+)?(.+)$/i),
    patIf(/^Quando\s+(.+?),\s*(.+)$/i),
    patIf(/^Caso\s+(.+?),\s*(.+)$/i),
    patIf(/^Sempre\s+que\s+(.+?),\s*(.+)$/i),

    patRepeat(/^(?:Por\s+favor\s+)?Repita\s+(.+?)\s+vezes:?\s+(.+)$/i),
    patRepeat(/^Faça\s+o\s+seguinte\s+(.+?)\s+vezes:?\s+(.+)$/i),
    patRepeat(/^(.+?)\s+vezes\s+seguidas,?\s+(.+)$/i),

    patPrint(/^(?:Por\s+favor\s+|Agora\s+|Finalmente,?\s+)?(?:Mostre|Imprima|Diga|Escreva|Anuncie|Exiba)\s+(?:me\s+|o\s+valor\s+de\s+)?(.+)$/i),
    patPrint(/^(?:Por\s+favor\s+)?Diga[- ]me\s+(?:o\s+valor\s+de\s+|sobre\s+)?(.+)$/i),
    patPrint(/^Quanto\s+(?:vale|é)\s+(.+?)\??$/i),
  ],
};

// ---------- Japanese ----------
// Japanese identifiers in samples use latin names (counter, x) for clarity,
// but the engine accepts CJK identifiers too.
const JID = "[A-Za-z_\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FFF][A-Za-z0-9_\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FFF]*";
const japanese: LanguagePack = {
  id: "ja",
  name: "日本語",
  flag: "🇯🇵",
  sample: `counter を 0 にする。
5 回 繰り返す: counter に 1 を 足す。
counter を 表示する。
もし counter が 3 より大きい なら、 "大きい数だ！" を 表示する。
counter に 10 を 足す。
"最終値は " 足す counter を 表示する。`,
  operators: {
    "+": ["足す", "プラス", "たす"],
    "-": ["引く", "マイナス", "ひく"],
    "*": ["掛ける", "かける", "×"],
    "/": ["割る", "わる"],
  },
  comparators: [
    // longer phrases first
    { phrase: "以上", op: ">=" },
    { phrase: "以下", op: "<=" },
    { phrase: "より大きい", op: ">" },
    { phrase: "より小さい", op: "<" },
    { phrase: "と等しくない", op: "!=" },
    { phrase: "と異なる", op: "!=" },
    { phrase: "と等しい", op: "==" },
    { phrase: "と同じ", op: "==" },
  ],
  truthy: ["真", "はい"],
  falsy: ["偽", "いいえ"],
  patterns: [
    // Assign:  "X を 5 にする"  /  "X は 5 とする"
    patAssign(new RegExp("^(" + JID + ")\\s+を\\s+(.+?)\\s+にする$", "i")),
    patAssign(new RegExp("^(" + JID + ")\\s+は\\s+(.+?)\\s+(?:とする|だ)$", "i")),
    patAssignSwapped(new RegExp("^(.+?)\\s+を\\s+(" + JID + ")\\s+に\\s+(?:代入する|入れる|保存する)$", "i")),

    // Add: "X に N を 足す" → name=X, expr=N (exprFirst=false captures [name,expr])
    patAddTo(new RegExp("^(" + JID + ")\\s+に\\s+(.+?)\\s+を\\s+(?:足す|加える)$", "i"), false),
    patAddTo(new RegExp("^(" + JID + ")\\s+を\\s+(.+?)\\s+(?:増やす|増加させる)$", "i"), false),

    // Sub: "X から N を 引く"
    patSubFrom(new RegExp("^(" + JID + ")\\s+から\\s+(.+?)\\s+を\\s+引く$", "i"), false),
    patSubFrom(new RegExp("^(" + JID + ")\\s+を\\s+(.+?)\\s+(?:減らす|減少させる)$", "i"), false),

    // If: "もし <cond> なら、 <stmt>"
    patIf(/^もし\s+(.+?)\s+なら[、,]\s*(.+)$/i),
    patIf(/^(.+?)\s+の場合[、,]\s*(.+)$/i),

    // Repeat: "5 回 繰り返す: <stmt>"
    patRepeat(/^(.+?)\s+回\s+繰り返す[：:]\s*(.+)$/i),
    patRepeat(/^(.+?)\s+回[、,]\s*(.+)$/i),

    // Print: "X を 表示する"  /  "X と 言う"
    patPrint(/^(.+?)\s+を\s+(?:表示|出力|印刷|表示する)する?$/i),
    patPrint(/^(.+?)\s+と\s+(?:言う|表示する|出力する|書く)$/i),
  ],
};

// ---------- Chinese (Simplified) ----------
const chinese: LanguagePack = {
  id: "zh",
  name: "中文",
  flag: "🇨🇳",
  sample: `设 counter 为 0。
重复 5 次: 请把 1 加到 counter。
请显示 counter。
如果 counter 大于 3, 那么 显示 "好大的数!"。
把 10 加到 counter。
显示 "最终值是 " 加 counter。`,
  operators: {
    "+": ["加", "加上"],
    "-": ["减", "减去"],
    "*": ["乘", "乘以"],
    "/": ["除以"],
  },
  comparators: [
    { phrase: "大于等于", op: ">=" },
    { phrase: "小于等于", op: "<=" },
    { phrase: "至少是", op: ">=" },
    { phrase: "至多是", op: "<=" },
    { phrase: "大于", op: ">" },
    { phrase: "小于", op: "<" },
    { phrase: "不等于", op: "!=" },
    { phrase: "等于", op: "==" },
    { phrase: "是", op: "==" },
  ],
  truthy: ["真", "是"],
  falsy: ["假", "否"],
  patterns: [
    // Assign
    patAssign(/^(?:请\s*)?设\s+([A-Za-z_]\w*)\s+为\s+(.+)$/i),
    patAssign(/^(?:请\s*)?让\s+([A-Za-z_]\w*)\s+等于\s+(.+)$/i),
    patAssign(/^(?:请\s*)?定义\s+([A-Za-z_]\w*)\s+为\s+(.+)$/i),
    patAssign(/^现在\s+([A-Za-z_]\w*)\s+(?:是|等于|变成)\s+(.+)$/i),
    patAssignSwapped(/^(?:请\s*)?(?:把|将)\s+(.+?)\s+(?:存入|保存到|赋值给)\s+([A-Za-z_]\w*)$/i),

    // Add: "把 N 加到 X" — expr first
    patAddTo(/^(?:请\s*)?(?:把|将)\s+(.+?)\s+加到\s+([A-Za-z_]\w*)(?:\s+上)?$/i, true),
    patAddTo(/^(?:请\s*)?(?:增加|增大)\s+([A-Za-z_]\w*)\s+(.+)$/i, false),
    patAddTo(/^(?:请\s*)?让\s+([A-Za-z_]\w*)\s+增加\s+(.+)$/i, false),

    // Sub: "从 X 中 减去 N"
    patSubFrom(/^(?:请\s*)?从\s+([A-Za-z_]\w*)\s+中?\s*减去\s+(.+)$/i, false),
    patSubFrom(/^(?:请\s*)?(?:减少|降低)\s+([A-Za-z_]\w*)\s+(.+)$/i, false),

    // If
    patIf(/^如果\s+(.+?)[,，]\s*(?:那么|则)?\s*(.+)$/i),
    patIf(/^当\s+(.+?)[,，]\s*(?:时)?\s*(.+)$/i),
    patIf(/^假如\s+(.+?)[,，]\s*(.+)$/i),

    // Repeat
    patRepeat(/^(?:请\s*)?重复\s+(.+?)\s+次[:：]\s*(.+)$/i),
    patRepeat(/^做\s+(.+?)\s+次以下事情[:：]\s*(.+)$/i),
    patRepeat(/^连续\s+(.+?)\s+次[,，]\s*(.+)$/i),

    // Print
    patPrint(/^(?:请\s*|现在\s*|最后[,，]?\s*)?(?:显示|打印|输出|说|告诉我)\s+(?:一下\s+|关于\s+|的值\s+)?(.+)$/i),
    patPrint(/^(.+?)\s+是\s*多少\??$/i),
  ],
};

// Tag each base pack as the "normal" register.
[english, spanish, french, german, italian, portuguese, japanese, chinese].forEach((p) => {
  p.baseId = p.id;
  p.register = "normal";
});

// ---------- Extra grammar shared across all base languages ----------
// Each base pack gains: modulo operator, multiply-by, divide-by, while-loop,
// if/else, and comment patterns — translated into the base language.
type Extras = {
  modulo: string[];
  patterns: LangPattern[];
};
const ID_EN = "[A-Za-z_]\\w*";
const ID_LATIN = "[A-Za-zÀ-ÿ_]\\w*";
const ID_DE = "[A-Za-zÄÖÜäöüß_]\\w*";

const EXTRAS: Record<string, Extras> = {
  en: {
    modulo: ["modulo", "mod", "remainder of"],
    patterns: [
      patIfElse(/^If\s+(.+?),\s*(?:then\s+)?(.+?),?\s+(?:otherwise|else|or\s+else)\s+(.+)$/i),
      patWhile(/^While\s+(.+?),\s*(?:keep\s+|do\s+)?(.+)$/i),
      patWhile(/^As\s+long\s+as\s+(.+?),\s*(.+)$/i),
      patWhile(/^Keep\s+(?:doing\s+|going\s+)?(.+?)\s+while\s+(.+)$/i),
      patMulBy(/^(?:Please\s+)?(?:Multiply|Scale)\s+(?:the\s+)?([A-Za-z_]\w*)\s+by\s+(.+)$/i, false),
      patMulBy(/^(?:Please\s+)?Double\s+(?:the\s+)?([A-Za-z_]\w*)$/i, false),
      patDivBy(/^(?:Please\s+)?Divide\s+(?:the\s+)?([A-Za-z_]\w*)\s+by\s+(.+)$/i, false),
      patDivBy(/^(?:Please\s+)?Halve\s+(?:the\s+)?([A-Za-z_]\w*)$/i, false),
      patComment(/^(?:Note|Remark|Comment)\s*[:,]\s*.+$/i),
      patComment(/^#\s+.+$/),
    ],
  },
  es: {
    modulo: ["módulo", "modulo", "resto de"],
    patterns: [
      patIfElse(/^Si\s+(.+?),\s*(?:entonces\s+)?(.+?),?\s+(?:si\s+no|de\s+lo\s+contrario|sino)\s+(.+)$/i),
      patWhile(/^Mientras\s+(.+?),\s*(.+)$/i),
      patWhile(/^Mientras\s+que\s+(.+?),\s*(.+)$/i),
      patMulBy(new RegExp("^(?:Por\\s+favor\\s+)?Multiplica\\s+(?:el\\s+|la\\s+)?(" + ID_LATIN + ")\\s+por\\s+(.+)$", "i")),
      patMulBy(new RegExp("^(?:Por\\s+favor\\s+)?Duplica\\s+(?:el\\s+|la\\s+)?(" + ID_LATIN + ")$", "i")),
      patDivBy(new RegExp("^(?:Por\\s+favor\\s+)?Divide\\s+(?:el\\s+|la\\s+)?(" + ID_LATIN + ")\\s+(?:por|entre)\\s+(.+)$", "i")),
      patComment(/^(?:Nota|Comentario)\s*[:,]\s*.+$/i),
      patComment(/^#\s+.+$/),
    ],
  },
  fr: {
    modulo: ["modulo", "reste de"],
    patterns: [
      patIfElse(/^Si\s+(.+?),\s*(?:alors\s+)?(.+?),?\s+(?:sinon|autrement)\s+(.+)$/i),
      patWhile(/^Tant\s+que\s+(.+?),\s*(.+)$/i),
      patWhile(/^Pendant\s+que\s+(.+?),\s*(.+)$/i),
      patMulBy(new RegExp("^(?:S'il\\s+te\\s+pla[îi]t\\s+)?Multiplie\\s+(?:le\\s+|la\\s+|l')?(" + ID_LATIN + ")\\s+par\\s+(.+)$", "i")),
      patMulBy(new RegExp("^(?:S'il\\s+te\\s+pla[îi]t\\s+)?Double\\s+(?:le\\s+|la\\s+|l')?(" + ID_LATIN + ")$", "i")),
      patDivBy(new RegExp("^(?:S'il\\s+te\\s+pla[îi]t\\s+)?Divise\\s+(?:le\\s+|la\\s+|l')?(" + ID_LATIN + ")\\s+par\\s+(.+)$", "i")),
      patComment(/^(?:Note|Remarque|Commentaire)\s*[:,]\s*.+$/i),
      patComment(/^#\s+.+$/),
    ],
  },
  de: {
    modulo: ["modulo", "rest von"],
    patterns: [
      patIfElse(/^Wenn\s+(.+?),\s*(?:dann\s+)?(.+?),?\s+(?:sonst|ansonsten|andernfalls)\s+(.+)$/i),
      patWhile(/^Solange\s+(.+?),\s*(.+)$/i),
      patWhile(/^Während\s+(.+?),\s*(.+)$/i),
      patMulBy(new RegExp("^(?:Bitte\\s+)?Multipliziere\\s+(?:der\\s+|die\\s+|das\\s+|den\\s+)?(" + ID_DE + ")\\s+mit\\s+(.+)$", "i")),
      patMulBy(new RegExp("^(?:Bitte\\s+)?Verdopple\\s+(?:der\\s+|die\\s+|das\\s+|den\\s+)?(" + ID_DE + ")$", "i")),
      patDivBy(new RegExp("^(?:Bitte\\s+)?Teile\\s+(?:der\\s+|die\\s+|das\\s+|den\\s+)?(" + ID_DE + ")\\s+durch\\s+(.+)$", "i")),
      patComment(/^(?:Notiz|Anmerkung|Kommentar)\s*[:,]\s*.+$/i),
      patComment(/^#\s+.+$/),
    ],
  },
  it: {
    modulo: ["modulo", "resto di"],
    patterns: [
      patIfElse(/^Se\s+(.+?),\s*(?:allora\s+)?(.+?),?\s+(?:altrimenti|sennò|senno)\s+(.+)$/i),
      patWhile(/^Finché\s+(.+?),\s*(.+)$/i),
      patWhile(/^Finche\s+(.+?),\s*(.+)$/i),
      patWhile(/^Mentre\s+(.+?),\s*(.+)$/i),
      patMulBy(new RegExp("^(?:Per\\s+favore\\s+)?Moltiplica\\s+(?:il\\s+|la\\s+|lo\\s+|l')?(" + ID_LATIN + ")\\s+per\\s+(.+)$", "i")),
      patMulBy(new RegExp("^(?:Per\\s+favore\\s+)?Raddoppia\\s+(?:il\\s+|la\\s+|lo\\s+|l')?(" + ID_LATIN + ")$", "i")),
      patDivBy(new RegExp("^(?:Per\\s+favore\\s+)?Dividi\\s+(?:il\\s+|la\\s+|lo\\s+|l')?(" + ID_LATIN + ")\\s+per\\s+(.+)$", "i")),
      patComment(/^(?:Nota|Commento)\s*[:,]\s*.+$/i),
      patComment(/^#\s+.+$/),
    ],
  },
  pt: {
    modulo: ["módulo", "modulo", "resto de"],
    patterns: [
      patIfElse(/^Se\s+(.+?),\s*(?:então\s+|entao\s+)?(.+?),?\s+(?:senão|senao|caso\s+contrário|caso\s+contrario)\s+(.+)$/i),
      patWhile(/^Enquanto\s+(.+?),\s*(.+)$/i),
      patMulBy(new RegExp("^(?:Por\\s+favor\\s+)?Multiplique\\s+(?:o\\s+|a\\s+)?(" + ID_LATIN + ")\\s+por\\s+(.+)$", "i")),
      patMulBy(new RegExp("^(?:Por\\s+favor\\s+)?Dobre\\s+(?:o\\s+|a\\s+)?(" + ID_LATIN + ")$", "i")),
      patDivBy(new RegExp("^(?:Por\\s+favor\\s+)?Divida\\s+(?:o\\s+|a\\s+)?(" + ID_LATIN + ")\\s+por\\s+(.+)$", "i")),
      patComment(/^(?:Nota|Comentário|Comentario)\s*[:,]\s*.+$/i),
      patComment(/^#\s+.+$/),
    ],
  },
  ja: {
    modulo: ["余り", "あまり"],
    patterns: [
      patWhile(new RegExp("^(.+?)\\s+の間[、,]?\\s*(.+)$", "i")),
      patWhile(new RegExp("^(.+?)\\s+(?:のうちは|である限り)[、,]?\\s*(.+)$", "i")),
      patMulBy(new RegExp("^(" + JID + ")\\s+を\\s+(.+?)\\s+(?:倍にする|掛ける)$", "i"), false),
      patDivBy(new RegExp("^(" + JID + ")\\s+を\\s+(.+?)\\s+で\\s+割る$", "i"), false),
      patComment(/^(?:メモ|注)\s*[:：,、]\s*.+$/i),
      patComment(/^#\s+.+$/),
    ],
  },
  zh: {
    modulo: ["模", "对…取余", "余"],
    patterns: [
      patIfElse(/^如果\s+(.+?)[,，]\s*(?:那么|则)?\s*(.+?)[,，]\s*(?:否则|不然)\s*(.+)$/i),
      patWhile(/^当\s+(.+?)\s+(?:时)[,，]?\s*(?:就|一直)?\s*(.+)$/i),
      patWhile(/^只要\s+(.+?)[,，]?\s*(?:就)?\s*(.+)$/i),
      patMulBy(/^(?:请\s*)?把\s+([A-Za-z_]\w*)\s+乘以\s+(.+)$/i, false),
      patDivBy(/^(?:请\s*)?把\s+([A-Za-z_]\w*)\s+除以\s+(.+)$/i, false),
      patComment(/^(?:注释|备注|注)\s*[:：,，]\s*.+$/i),
      patComment(/^#\s+.+$/),
    ],
  },
};

const proseBases = [english, spanish, french, german, italian, portuguese, japanese, chinese];
for (const pack of proseBases) {
  const x = EXTRAS[pack.id];
  if (!x) continue;
  (pack.operators as Record<string, string[]>)["%"] = x.modulo;
  // Prepend new patterns so they're tried before older, broader regexes.
  pack.patterns = [...x.patterns, ...pack.patterns];
}


// ---------- TypeScript ----------
// Real code syntax. Statements are one-per-line; trailing `;` optional.
// Use spaces around operators (e.g. `x + 1`, not `x+1`).
const CODE_ID = "[A-Za-z_][A-Za-z0-9_]*";
const codeOperators: LanguagePack["operators"] = {
  "+": ["+"],
  "-": ["-"],
  "*": ["*"],
  "/": ["/"],
  "%": ["%"],
  "**": ["**"],
};
const codeComparators: LanguagePack["comparators"] = [
  { phrase: "===", op: "==" },
  { phrase: "!==", op: "!=" },
  { phrase: "==", op: "==" },
  { phrase: "!=", op: "!=" },
  { phrase: ">=", op: ">=" },
  { phrase: "<=", op: "<=" },
  { phrase: ">", op: ">" },
  { phrase: "<", op: "<" },
];

// ---- Built-in libraries ----
const num = (v: Value) => Number(v);
const sharedMath = {
  abs: (a: Value[]) => Math.abs(num(a[0])),
  min: (a: Value[]) => Math.min(...a.map(num)),
  max: (a: Value[]) => Math.max(...a.map(num)),
  pow: (a: Value[]) => Math.pow(num(a[0]), num(a[1])),
  round: (a: Value[]) => Math.round(num(a[0])),
};
// TypeScript-only built-ins: Math.*, String/Number coercion, length, JSON, etc.
const tsBuiltins: Record<string, (a: Value[]) => Value> = {
  "Math.abs": sharedMath.abs,
  "Math.min": sharedMath.min,
  "Math.max": sharedMath.max,
  "Math.pow": sharedMath.pow,
  "Math.round": sharedMath.round,
  "Math.floor": (a) => Math.floor(num(a[0])),
  "Math.ceil": (a) => Math.ceil(num(a[0])),
  "Math.sqrt": (a) => Math.sqrt(num(a[0])),
  "Math.sign": (a) => Math.sign(num(a[0])),
  "Math.trunc": (a) => Math.trunc(num(a[0])),
  "Math.random": () => Math.random(),
  "Math.PI": () => Math.PI,
  Number: (a) => Number(a[0]),
  String: (a) => String(a[0]),
  Boolean: (a) => Boolean(a[0]),
  parseInt: (a) => parseInt(String(a[0]), a[1] != null ? num(a[1]) : 10),
  parseFloat: (a) => parseFloat(String(a[0])),
  isNaN: (a) => Number.isNaN(num(a[0])),
  length: (a) => String(a[0]).length, // x.length
  toUpperCase: (a) => String(a[0]).toUpperCase(), // x.toUpperCase()
  toLowerCase: (a) => String(a[0]).toLowerCase(),
  trim: (a) => String(a[0]).trim(),
};
// Python-only built-ins
const pyBuiltins: Record<string, (a: Value[]) => Value> = {
  abs: sharedMath.abs,
  min: sharedMath.min,
  max: sharedMath.max,
  pow: sharedMath.pow,
  round: sharedMath.round,
  int: (a) => Math.trunc(num(a[0])),
  float: (a) => Number(a[0]),
  str: (a) => String(a[0]),
  bool: (a) => Boolean(a[0]),
  len: (a) => String(a[0]).length,
  sum: (a) => a.reduce<number>((s, v) => s + num(v), 0),
  upper: (a) => String(a[0]).toUpperCase(),
  lower: (a) => String(a[0]).toLowerCase(),
};

// Custom for-loop pattern: `for (let i = 0; i < N; i++) body;`
function patForLoopC(re: RegExp): LangPattern {
  return {
    regex: re,
    build: ([times, inner], parseInner, parseExpr): Stmt => ({
      kind: "repeat",
      times: parseExpr(times),
      body: parseInner(inner),
    }),
  };
}

const typescript: LanguagePack = {
  id: "ts",
  name: "TypeScript",
  flag: "📘",
  sample: `let counter = 0;
for (let i = 0; i < 5; i++) counter += 1;
console.log(counter);
if (counter > 3) console.log("big number!");
counter *= 2;
let power = counter ** 2;
console.log("squared: " + power);
let abs = Math.abs(-7);
console.log("abs: " + abs);
let label = "hello";
console.log("len: " + label.length);
console.log(label.toUpperCase());
while (counter < 50) counter += 10;
console.log("final: " + counter);`,
  operators: codeOperators,
  comparators: codeComparators,
  truthy: ["true"],
  falsy: ["false"],
  builtins: tsBuiltins,
  patterns: [
    // Comments
    patComment(new RegExp("^\\s*//.*$")),
    patComment(/^\s*\/\*.*\*\/\s*$/),

    // if / else  (TS-style with parens)
    patIfElse(new RegExp("^if\\s*\\((.+?)\\)\\s+(.+?)\\s*;?\\s+else\\s+(.+?)\\s*;?$", "i")),
    patIf(new RegExp("^if\\s*\\((.+?)\\)\\s+(.+?)\\s*;?$", "i")),

    // while
    patWhile(new RegExp("^while\\s*\\((.+?)\\)\\s+(.+?)\\s*;?$", "i")),

    // for (let i = 0; i < N; i++) body
    patForLoopC(
      new RegExp(
        "^for\\s*\\(\\s*(?:let|var|const)?\\s*" + CODE_ID +
          "\\s*=\\s*0\\s*;\\s*" + CODE_ID + "\\s*<\\s*(.+?)\\s*;\\s*" +
          CODE_ID + "\\s*(?:\\+\\+|\\+=\\s*1)\\s*\\)\\s+(.+?)\\s*;?$",
        "i",
      ),
    ),

    // print
    patPrint(new RegExp("^console\\.(?:log|info|warn|error|debug)\\s*\\((.+)\\)\\s*;?$", "i")),
    patPrint(new RegExp("^process\\.stdout\\.write\\s*\\((.+)\\)\\s*;?$", "i")),

    // compound assignment (shared shape)
    patAddTo(new RegExp("^(" + CODE_ID + ")\\s*\\+=\\s*(.+?)\\s*;?$"), false),
    patSubFrom(new RegExp("^(" + CODE_ID + ")\\s*-=\\s*(.+?)\\s*;?$"), false),
    patMulBy(new RegExp("^(" + CODE_ID + ")\\s*\\*=\\s*(.+?)\\s*;?$"), false),
    patDivBy(new RegExp("^(" + CODE_ID + ")\\s*\\/=\\s*(.+?)\\s*;?$"), false),

    // increment / decrement  (x++, ++x, x--, --x)
    patAddTo(new RegExp("^(?:\\+\\+\\s*(" + CODE_ID + ")|(" + CODE_ID + ")\\s*\\+\\+)\\s*;?$"), false),
    {
      regex: new RegExp("^(?:\\+\\+\\s*(" + CODE_ID + ")|(" + CODE_ID + ")\\s*\\+\\+)\\s*;?$"),
      build: (g): Stmt => ({ kind: "addto", name: g[0] || g[1], expr: { kind: "lit", value: 1 } }),
    },
    {
      regex: new RegExp("^(?:--\\s*(" + CODE_ID + ")|(" + CODE_ID + ")\\s*--)\\s*;?$"),
      build: (g): Stmt => ({ kind: "subfrom", name: g[0] || g[1], expr: { kind: "lit", value: 1 } }),
    },

    // declarations: let / const / var
    patAssign(new RegExp("^(?:let|const|var)\\s+(" + CODE_ID + ")(?:\\s*:\\s*[A-Za-z_][\\w<>\\[\\]\\|, ]*)?\\s*=\\s*(.+?)\\s*;?$")),
    // bare assignment (also valid Python) — disallow `==`
    patAssign(new RegExp("^(" + CODE_ID + ")\\s*=(?!=)\\s*(.+?)\\s*;?$")),
  ],
};

// ---------- Python ----------
const python: LanguagePack = {
  id: "py",
  name: "Python",
  flag: "🐍",
  sample: `counter = 0
for i in range(5): counter += 1
print(counter)
if counter > 3: print("big number!")
counter *= 2
power = counter ** 2
print("squared: " + str(power))
half = 17 // 5
print("floor div: " + str(half))
print("abs: " + str(abs(-7)))
name = "hello"
print("len: " + str(len(name)))
print(upper(name))
while counter < 50: counter += 10
print("final: " + str(counter))`,
  operators: { ...codeOperators, "//": ["//"] },
  comparators: codeComparators,
  truthy: ["true", "True"],
  falsy: ["false", "False"],
  builtins: pyBuiltins,
  patterns: [
    // Comments
    patComment(/^\s*#.*$/),

    // pass / noop
    { regex: /^\s*pass\s*$/, build: (): Stmt => ({ kind: "noop" }) },

    // if / elif / else (single-line, colon-separated)
    patIfElse(/^if\s+(.+?)\s*:\s*(.+?)\s+else\s*:\s*(.+)$/i),
    patIf(/^if\s+(.+?)\s*:\s*(.+)$/i),

    // while cond: body
    patWhile(/^while\s+(.+?)\s*:\s*(.+)$/i),

    // for i in range(N): body
    patForLoopC(new RegExp("^for\\s+" + CODE_ID + "\\s+in\\s+range\\s*\\(\\s*(.+?)\\s*\\)\\s*:\\s*(.+)$", "i")),

    // print(...)
    patPrint(new RegExp("^print\\s*\\((.+)\\)\\s*$", "i")),

    // compound assignment
    patAddTo(new RegExp("^(" + CODE_ID + ")\\s*\\+=\\s*(.+)$"), false),
    patSubFrom(new RegExp("^(" + CODE_ID + ")\\s*-=\\s*(.+)$"), false),
    patMulBy(new RegExp("^(" + CODE_ID + ")\\s*\\*=\\s*(.+)$"), false),
    patDivBy(new RegExp("^(" + CODE_ID + ")\\s*\\/=\\s*(.+)$"), false),

    // bare assignment (shared with TS) — disallow `==`
    patAssign(new RegExp("^(" + CODE_ID + ")\\s*=(?!=)\\s*(.+)$")),
  ],
};

[typescript, python].forEach((p) => {
  p.baseId = p.id;
  p.register = "normal";
});

// ---------- Extra preset built-ins (available in every language) ----------
const extraBuiltins: Record<string, (a: Value[]) => Value> = {
  // Math extras
  log: (a) => Math.log(num(a[0])),
  log2: (a) => Math.log2(num(a[0])),
  log10: (a) => Math.log10(num(a[0])),
  exp: (a) => Math.exp(num(a[0])),
  sin: (a) => Math.sin(num(a[0])),
  cos: (a) => Math.cos(num(a[0])),
  tan: (a) => Math.tan(num(a[0])),
  asin: (a) => Math.asin(num(a[0])),
  acos: (a) => Math.acos(num(a[0])),
  atan: (a) => Math.atan(num(a[0])),
  atan2: (a) => Math.atan2(num(a[0]), num(a[1])),
  hypot: (a) => Math.hypot(...a.map(num)),
  sign: (a) => Math.sign(num(a[0])),
  mod: (a) => ((num(a[0]) % num(a[1])) + num(a[1])) % num(a[1]),
  clamp: (a) => Math.min(Math.max(num(a[0]), num(a[1])), num(a[2])),
  lerp: (a) => num(a[0]) + (num(a[1]) - num(a[0])) * num(a[2]),
  avg: (a) => a.reduce<number>((s, v) => s + num(v), 0) / Math.max(a.length, 1),
  mean: (a) => a.reduce<number>((s, v) => s + num(v), 0) / Math.max(a.length, 1),
  rand: () => Math.random(),
  randInt: (a) => {
    const lo = Math.ceil(num(a[0]));
    const hi = Math.floor(num(a[1]));
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
  },
  factorial: (a) => {
    const n = Math.max(0, Math.trunc(num(a[0])));
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  },
  gcd: (a) => {
    const f = (x: number, y: number): number => (y === 0 ? Math.abs(x) : f(y, x % y));
    return a.map(num).reduce((acc, v) => f(acc, v));
  },
  lcm: (a) => {
    const g = (x: number, y: number): number => (y === 0 ? Math.abs(x) : g(y, x % y));
    return a.map(num).reduce((acc, v) => Math.abs(acc * v) / g(acc, v));
  },
  fib: (a) => {
    const n = Math.max(0, Math.trunc(num(a[0])));
    let x = 0, y = 1;
    for (let i = 0; i < n; i++) { const t = x + y; x = y; y = t; }
    return x;
  },
  isPrime: (a) => {
    const n = Math.trunc(num(a[0]));
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  },
  isEven: (a) => num(a[0]) % 2 === 0,
  isOdd: (a) => num(a[0]) % 2 !== 0,
  deg: (a) => (num(a[0]) * 180) / Math.PI,
  rad: (a) => (num(a[0]) * Math.PI) / 180,
  toFixed: (a) => Number(num(a[0]).toFixed(num(a[1] ?? 2))),
  // String extras
  reverse: (a) => String(a[0]).split("").reverse().join(""),
  repeat: (a) => String(a[0]).repeat(Math.max(0, Math.trunc(num(a[1])))),
  startsWith: (a) => String(a[0]).startsWith(String(a[1])),
  endsWith: (a) => String(a[0]).endsWith(String(a[1])),
  includes: (a) => String(a[0]).includes(String(a[1])),
  contains: (a) => String(a[0]).includes(String(a[1])),
  indexOf: (a) => String(a[0]).indexOf(String(a[1])),
  replace: (a) => String(a[0]).split(String(a[1])).join(String(a[2])),
  slice: (a) => String(a[0]).slice(num(a[1]), a[2] != null ? num(a[2]) : undefined),
  charAt: (a) => String(a[0]).charAt(num(a[1])),
  padStart: (a) => String(a[0]).padStart(num(a[1]), a[2] != null ? String(a[2]) : " "),
  padEnd: (a) => String(a[0]).padEnd(num(a[1]), a[2] != null ? String(a[2]) : " "),
  capitalize: (a) => {
    const s = String(a[0]);
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  },
  title: (a) =>
    String(a[0])
      .split(/\s+/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
      .join(" "),
  wordCount: (a) => String(a[0]).trim().split(/\s+/).filter(Boolean).length,
  charCount: (a) => String(a[0]).length,
  // Misc
  now: () => Date.now(),
  today: () => new Date().toISOString().slice(0, 10),
  not: (a) => !a[0],
};

// ---------- Integrate built-ins + extra operators into every prose language ----------
const sharedBuiltins: Record<string, (a: Value[]) => Value> = {
  ...tsBuiltins,
  ...pyBuiltins,
  ...extraBuiltins,
};
typescript.builtins = { ...(typescript.builtins ?? {}), ...extraBuiltins };
python.builtins = { ...(python.builtins ?? {}), ...extraBuiltins };
for (const pack of proseBases) {
  pack.builtins = { ...(pack.builtins ?? {}), ...sharedBuiltins };
  (pack.operators as Record<string, string[]>)["**"] = ["**"];
  (pack.operators as Record<string, string[]>)["//"] = ["//"];
}






// ---------- Slang factory ----------
function makeSlang(
  base: LanguagePack,
  overrides: {
    name: string;
    flag?: string;
    sample: string;
    extraPatterns?: LangPattern[];
    extraOps?: Partial<Record<"+" | "-" | "*" | "/" | "%", string[]>>;
    extraComparators?: LanguagePack["comparators"];
  },
): LanguagePack {
  const ops = { ...base.operators } as LanguagePack["operators"];
  (Object.keys(overrides.extraOps ?? {}) as Array<"+" | "-" | "*" | "/" | "%">).forEach((k) => {
    ops[k] = [...(overrides.extraOps?.[k] ?? []), ...(ops[k] ?? [])];
  });
  return {
    id: `${base.id}-slang`,
    baseId: base.id,
    register: "slang",
    name: overrides.name,
    flag: overrides.flag ?? base.flag,
    sample: overrides.sample,
    operators: ops,
    // longer/casual phrases first, then originals
    comparators: [...(overrides.extraComparators ?? []), ...base.comparators],
    truthy: base.truthy,
    falsy: base.falsy,
    // Slang patterns are tried first so they win matches; fall through to all base patterns.
    patterns: [...(overrides.extraPatterns ?? []), ...base.patterns],
    builtins: base.builtins,
  };
}


// ---------- English (slang) ----------
const englishSlang = makeSlang(english, {
  name: "English (slang)",
  sample: `Yo, count is 0.
Bump count by 1, do it 5x.
Drop count.
If count's bigger than 3, holla "big one!".
Gimme count + 10 more.
Spit "final: " + count.`,
  extraOps: { "+": ["n"], "*": ["x"] },
  extraComparators: [
    { phrase: "'s bigger than", op: ">" },
    { phrase: "'s smaller than", op: "<" },
    { phrase: "'s the same as", op: "==" },
    { phrase: "'s", op: "==" },
  ],
  extraPatterns: [
    patAssign(/^(?:Yo,?\s+|Listen,?\s+)?(?:gimme|lemme\s+get|lemme\s+have)\s+([A-Za-z_]\w*)\s*(?:=|to)\s*(.+)$/i),
    patAssign(/^Yo,?\s+([A-Za-z_]\w*)\s+(?:is|=)\s+(.+)$/i),
    patAddTo(/^(?:Bump|Crank|Pump)\s+(?:up\s+)?([A-Za-z_]\w*)\s+by\s+(.+)$/i, false),
    patAddTo(/^(?:Slap|Throw|Toss)\s+(.+?)\s+on(?:to)?\s+([A-Za-z_]\w*)$/i, true),
    patSubFrom(/^(?:Knock|Chop)\s+(.+?)\s+off(?:\s+of)?\s+([A-Za-z_]\w*)$/i, true),
    patPrint(/^(?:Spit|Drop|Holla|Yell|Shout|Blurt|Flex)\s+(?:out\s+)?(.+)$/i),
    patPrint(/^Lemme\s+see\s+(.+)$/i),
    patRepeat(/^(?:Do\s+(?:it|this)|Run\s+it)\s+(.+?)\s*x:?\s+(.+)$/i),
    patRepeatSwapped(/^(.+?)\s*,?\s*(.+?)\s*x$/i),
  ],
});

// ---------- Spanish (slang) ----------
const spanishSlang = makeSlang(spanish, {
  name: "Español (slang)",
  sample: `Oye, ponle 0 a cuenta.
Échale 1 a cuenta, 5 veces.
Tira cuenta.
Si cuenta está pasada de 3, suelta "¡brutal!".
Súbele 10 a cuenta.
Manda "final: " más cuenta.`,
  extraComparators: [
    { phrase: "está pasada de", op: ">" },
    { phrase: "está pasado de", op: ">" },
    { phrase: "está corta de", op: "<" },
    { phrase: "está corto de", op: "<" },
  ],
  extraPatterns: [
    patAssignSwapped(/^(?:Oye,?\s+)?(?:Ponle|Pónle|Échale|Echale|Métele|Metele)\s+(.+?)\s+a\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)$/i),
    patAssign(/^Oye,?\s+([A-Za-zÀ-ÿ_]\w*)\s+(?:vale|es|=)\s+(.+)$/i),
    patAddTo(/^(?:Súbele|Subele|Pégale|Pegale|Métele|Metele)\s+(.+?)\s+a\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patAddTo(/^(?:Echa|Echale|Échale)\s+(.+?)\s+(?:más|mas)\s+a\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patSubFrom(/^(?:Bájale|Bajale|Quítale|Quitale)\s+(.+?)\s+a\s+(?:el\s+|la\s+)?([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patPrint(/^(?:Tira|Manda|Suelta|Avienta|Chécame|Chequea|Saca|Cuéntame|Cuentame)\s+(?:el\s+valor\s+de\s+)?(.+)$/i),
  ],
});

// ---------- French (slang) ----------
const frenchSlang = makeSlang(french, {
  name: "Français (slang)",
  sample: `Bon, compteur c'est 0.
Balance 1 dans compteur, fais ça 5 fois.
Crache compteur.
Si compteur c'est plus que 3, balance "ouf !".
File 10 de plus à compteur.
Envoie "final : " plus compteur.`,
  extraComparators: [
    { phrase: "c'est plus que", op: ">" },
    { phrase: "c'est moins que", op: "<" },
    { phrase: "c'est pareil que", op: "==" },
    { phrase: "c'est", op: "==" },
  ],
  extraPatterns: [
    patAssign(/^(?:Bon,?\s+|Allez,?\s+)?([A-Za-zÀ-ÿ_]\w*)\s+c'est\s+(.+)$/i),
    patAssignSwapped(/^(?:Balance|Fous|Colle|Mets)\s+(.+?)\s+dans\s+(?:le\s+|la\s+|l')?([A-Za-zÀ-ÿ_]\w*)$/i),
    patAddTo(/^(?:File|Refile|Ajoute|Colle)\s+(.+?)\s+(?:de\s+plus\s+)?(?:à|au|a\s+la|à\s+l')\s+([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patSubFrom(/^(?:Vire|Dégage|Degage|Arrache)\s+(.+?)\s+(?:de|du|à|a)\s+([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patPrint(/^(?:Balance|Crache|Envoie|Sors|Lâche|Lache|Gueule|Montre[- ]moi)\s+(?:moi\s+)?(.+)$/i),
  ],
});

// ---------- German (slang) ----------
const germanSlang = makeSlang(german, {
  name: "Deutsch (slang)",
  sample: `Alter, zaehler ist 0.
Pack 1 auf zaehler, mach das 5 mal.
Schmeiss zaehler raus.
Wenn zaehler dicker als 3 ist, knall "krass!" raus.
Hau zaehler 10 drauf.
Zeig her "ende: " plus zaehler.`,
  extraComparators: [
    { phrase: "dicker als", op: ">" },
    { phrase: "duenner als", op: "<" },
    { phrase: "dünner als", op: "<" },
  ],
  extraPatterns: [
    patAssign(/^(?:Alter,?\s+|Ey,?\s+)?([A-Za-zÄÖÜäöüß_]\w*)\s+(?:ist|=)\s+(.+)$/i),
    patAssignSwapped(/^(?:Pack|Knall|Stopf|Hau)\s+(.+?)\s+(?:in|auf|zu)\s+(?:der\s+|die\s+|das\s+|den\s+)?([A-Za-zÄÖÜäöüß_]\w*)$/i),
    patAddTo(/^(?:Hau|Klatsch|Pack)\s+(?:der\s+|die\s+|das\s+|den\s+|dem\s+)?([A-Za-zÄÖÜäöüß_]\w*)\s+(.+?)\s+drauf$/i, false),
    patSubFrom(/^(?:Reiss|Reiß|Zieh|Klau)\s+(.+?)\s+(?:von|aus)\s+(?:der\s+|die\s+|das\s+|den\s+|dem\s+)?([A-Za-zÄÖÜäöüß_]\w*)\s*(?:weg|ab|raus)?$/i, true),
    patPrint(/^(?:Schmeiss|Schmeiß|Knall|Hau|Spuck)\s+(.+?)\s+(?:raus|aus)$/i),
    patPrint(/^Zeig\s+(?:mir\s+)?her\s+(.+)$/i),
  ],
});

// ---------- Italian (slang) ----------
const italianSlang = makeSlang(italian, {
  name: "Italiano (slang)",
  sample: `Dai, conta è 0.
Butta 1 dentro conta, fallo 5 volte.
Spara conta.
Se conta è bello grosso di 3, urla "forte!".
Pompa conta di 10.
Manda fuori "fine: " più conta.`,
  extraComparators: [
    { phrase: "è bello grosso di", op: ">" },
    { phrase: "è bello piccolo di", op: "<" },
  ],
  extraPatterns: [
    patAssign(/^(?:Dai,?\s+|Oh,?\s+|Senti,?\s+)?([A-Za-zÀ-ÿ_]\w*)\s+(?:è|e')\s+(.+)$/i),
    patAssignSwapped(/^(?:Butta|Sbatti|Caccia|Ficca)\s+(.+?)\s+(?:in|dentro|nel|nella)\s+([A-Za-zÀ-ÿ_]\w*)$/i),
    patAddTo(/^(?:Pompa|Tira\s+su|Gonfia)\s+(?:il\s+|la\s+|lo\s+|l')?([A-Za-zÀ-ÿ_]\w*)\s+di\s+(.+)$/i, false),
    patSubFrom(/^(?:Strappa|Stacca|Leva)\s+(.+?)\s+(?:da|a)\s+(?:il\s+|la\s+|lo\s+|l')?([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patPrint(/^(?:Spara|Urla|Grida|Manda\s+fuori|Sputa|Sgancia)\s+(?:fuori\s+)?(.+)$/i),
  ],
});

// ---------- Portuguese (slang) ----------
const portugueseSlang = makeSlang(portuguese, {
  name: "Português (slang)",
  sample: `Tipo, contador é 0.
Bota 1 no contador, faz isso 5 vezes.
Solta contador.
Se contador tá maior que 3, manda "irado!".
Joga 10 no contador.
Solta "fim: " mais contador.`,
  extraComparators: [
    { phrase: "tá maior que", op: ">" },
    { phrase: "ta maior que", op: ">" },
    { phrase: "tá menor que", op: "<" },
    { phrase: "ta menor que", op: "<" },
    { phrase: "tá", op: "==" },
  ],
  extraPatterns: [
    patAssign(/^(?:Tipo,?\s+|Ó,?\s+|Olha,?\s+)?([A-Za-zÀ-ÿ_]\w*)\s+(?:é|tá|ta|=)\s+(.+)$/i),
    patAssignSwapped(/^(?:Bota|Joga|Enfia|Mete)\s+(.+?)\s+(?:em|no|na)\s+([A-Za-zÀ-ÿ_]\w*)$/i),
    patAddTo(/^(?:Joga|Bota|Manda|Acrescenta)\s+(.+?)\s+(?:no|na|pro|pra)\s+([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patSubFrom(/^(?:Tira|Arranca|Rouba)\s+(.+?)\s+(?:do|da|de)\s+([A-Za-zÀ-ÿ_]\w*)$/i, true),
    patPrint(/^(?:Solta|Manda|Joga|Cospe|Mostra\s+aí|Mostra\s+ai)\s+(?:aí\s+|ai\s+)?(.+)$/i),
  ],
});

// ---------- Japanese (casual) ----------
const japaneseSlang = makeSlang(japanese, {
  name: "日本語 (タメ口)",
  sample: `counter は 0 だ。
5 回 やる: counter に 1 たす。
counter 見せて。
もし counter が 3 より大きい なら、 "やばっ！" って言って。
counter に 10 たす。
"最後は " たす counter 見せて。`,
  extraPatterns: [
    patAssign(new RegExp("^(" + JID + ")\\s+(?:は|が)\\s+(.+?)\\s+(?:だ|だよ|だね|じゃん)$", "i")),
    patAddTo(new RegExp("^(" + JID + ")\\s+に\\s+(.+?)\\s+たす$", "i"), false),
    patSubFrom(new RegExp("^(" + JID + ")\\s+から\\s+(.+?)\\s+ひく$", "i"), false),
    patPrint(/^(.+?)\s+(?:見せて|出して|言って|教えて)$/i),
    patPrint(/^(.+?)\s+って\s+(?:言って|出して)$/i),
    patRepeat(/^(.+?)\s+回\s+やる[：:]\s*(.+)$/i),
    patIf(/^もし\s+(.+?)\s+なら[、,]?\s*(.+)$/i),
  ],
});

// ---------- Chinese (slang) ----------
const chineseSlang = makeSlang(chinese, {
  name: "中文 (口语)",
  sample: `搞 counter 等于 0。
来 5 次: 给 counter 加 1。
甩出 counter。
要是 counter 比 3 大, 喊 "牛逼!"。
给 counter 加 10。
甩出 "结果: " 加 counter。`,
  extraComparators: [
    { phrase: "比", op: ">" },
    { phrase: "没到", op: "<" },
  ],
  extraPatterns: [
    patAssign(/^(?:搞|整|弄)\s+([A-Za-z_]\w*)\s+(?:等于|是|为|=)\s+(.+)$/i),
    patAssignSwapped(/^(?:塞|扔|甩)\s+(.+?)\s+(?:进|到)\s+([A-Za-z_]\w*)(?:\s+里)?$/i),
    patAddTo(/^给\s+([A-Za-z_]\w*)\s+加\s+(.+)$/i, false),
    patAddTo(/^(?:堆|怼|拍)\s+(.+?)\s+(?:到|进|上)\s+([A-Za-z_]\w*)(?:\s+上)?$/i, true),
    patSubFrom(/^(?:扒|抽|拔)\s+(.+?)\s+(?:从|出)\s+([A-Za-z_]\w*)$/i, true),
    patPrint(/^(?:甩出|亮出|晒|喊|秀|抛出)\s+(.+)$/i),
    patRepeat(/^来\s+(.+?)\s+次[:：]?\s*(.+)$/i),
    patIf(/^(?:要是|假设|万一)\s+(.+?)[,，]\s*(?:就|那么)?\s*(.+)$/i),
  ],
});

export const LANGUAGES: LanguagePack[] = [
  english, englishSlang,
  spanish, spanishSlang,
  french, frenchSlang,
  german, germanSlang,
  italian, italianSlang,
  portuguese, portugueseSlang,
  japanese, japaneseSlang,
  chinese, chineseSlang,
];

/** Base language entries (unique by baseId), used for the language picker. */
export const BASE_LANGUAGES = [english, spanish, french, german, italian, portuguese, japanese, chinese];



export function getLanguage(id: string): LanguagePack {
  return LANGUAGES.find((l) => l.id === id) ?? english;
}

/** Look up the variant for a given base language + register. */
export function getVariant(baseId: string, register: "normal" | "slang"): LanguagePack {
  const found = LANGUAGES.find((l) => l.baseId === baseId && l.register === register);
  return found ?? getLanguage(baseId);
}

