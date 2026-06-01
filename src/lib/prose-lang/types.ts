export type Value = number | string | boolean;

export type Expr =
  | { kind: "lit"; value: Value }
  | { kind: "var"; name: string }
  | { kind: "bin"; op: "+" | "-" | "*" | "/"; left: Expr; right: Expr };

export type Cond = {
  op: ">" | "<" | "==" | ">=" | "<=" | "!=";
  left: Expr;
  right: Expr;
};

export type Stmt =
  | { kind: "assign"; name: string; expr: Expr }
  | { kind: "addto"; name: string; expr: Expr }
  | { kind: "subfrom"; name: string; expr: Expr }
  | { kind: "print"; expr: Expr }
  | { kind: "if"; cond: Cond; then: Stmt }
  | { kind: "repeat"; times: Expr; body: Stmt };

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

export type LanguagePack = {
  id: string;
  name: string;
  flag: string;
  sample: string;
  /** Operators in expressions: { "+": ["plus"], "-": ["minus"], ... } */
  operators: Record<"+" | "-" | "*" | "/", string[]>;
  /** Comparators for conditions, longer phrases first. */
  comparators: Array<{ phrase: string; op: Cond["op"] }>;
  /** Word forms of "true" / "false". */
  truthy: string[];
  falsy: string[];
  /** Sentence-level patterns. */
  patterns: LangPattern[];
};
