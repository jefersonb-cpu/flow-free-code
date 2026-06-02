export type Value = number | string | boolean;

export type BinOp = "+" | "-" | "*" | "/" | "%" | "**" | "//";

export type Expr =
  | { kind: "lit"; value: Value }
  | { kind: "var"; name: string }
  | { kind: "bin"; op: BinOp; left: Expr; right: Expr }
  | { kind: "call"; name: string; args: Expr[] };

export type Cond = {
  op: ">" | "<" | "==" | ">=" | "<=" | "!=";
  left: Expr;
  right: Expr;
};

export type Stmt =
  | { kind: "assign"; name: string; expr: Expr }
  | { kind: "addto"; name: string; expr: Expr }
  | { kind: "subfrom"; name: string; expr: Expr }
  | { kind: "mulby"; name: string; expr: Expr }
  | { kind: "divby"; name: string; expr: Expr }
  | { kind: "print"; expr: Expr }
  | { kind: "if"; cond: Cond; then: Stmt }
  | { kind: "ifelse"; cond: Cond; then: Stmt; else: Stmt }
  | { kind: "repeat"; times: Expr; body: Stmt }
  | { kind: "while"; cond: Cond; body: Stmt }
  | { kind: "noop" };

export type LangPattern = {
  /** Regex matching a full sentence (without trailing punctuation). */
  regex: RegExp;
  build: (
    groups: string[],
    parseInner: (text: string) => Stmt,
    parseExpr: (text: string) => Expr,
    parseCond: (text: string) => Cond,
  ) => Stmt;
};

export type LanguageRegister = "normal" | "slang";

export type LanguagePack = {
  id: string;
  name: string;
  flag: string;
  sample: string;
  /** Which base language this pack belongs to (e.g. "en"). Same for normal + slang variants. */
  baseId?: string;
  /** Register: formal/normal grammar or casual/slang grammar. */
  register?: LanguageRegister;
  /** Operators in expressions: { "+": ["plus"], "-": ["minus"], ... } */
  operators: Partial<Record<BinOp, string[]>> & Record<"+" | "-" | "*" | "/", string[]>;
  /** Comparators for conditions, longer phrases first. */
  comparators: Array<{ phrase: string; op: Cond["op"] }>;
  /** Word forms of "true" / "false". */
  truthy: string[];
  falsy: string[];
  /** Sentence-level patterns. */
  patterns: LangPattern[];
};
