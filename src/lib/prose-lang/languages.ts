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

export const LANGUAGES: LanguagePack[] = [english, spanish, french, german, italian];
export function getLanguage(id: string): LanguagePack {
  return LANGUAGES.find((l) => l.id === id) ?? english;
}
