// Code presets / starter templates. Each runs against the English (en) pack.
export type Template = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  language: string; // base language id
  source: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "hello",
    name: "Hello, world",
    emoji: "👋",
    description: "The simplest possible program.",
    language: "en",
    source: `Print "Hello, world!".`,
  },
  {
    id: "counter",
    name: "Counter to 10",
    emoji: "🔢",
    description: "Increment a variable in a loop.",
    language: "en",
    source: `Let counter be 0.
Repeat 10 times: please add 1 to counter.
Print "Final count: " plus counter.`,
  },
  {
    id: "sum1to100",
    name: "Sum 1..100",
    emoji: "➕",
    description: "Closed-form Gauss formula.",
    language: "en",
    source: `Set total to 100 times 101 divided by 2.
Print "Sum of 1..100 is " plus total.`,
  },
  {
    id: "factorial",
    name: "Factorial of 8",
    emoji: "🧮",
    description: "Uses the built-in factorial() function.",
    language: "en",
    source: `Let n be 8.
Let result be factorial(n).
Print "factorial of " plus n plus " is " plus result.`,
  },
  {
    id: "fibonacci",
    name: "Fibonacci number",
    emoji: "🌀",
    description: "The 20th Fibonacci number via fib().",
    language: "en",
    source: `Let n be 20.
Print "fib(" plus n plus ") = " plus fib(n).`,
  },
  {
    id: "evenodd",
    name: "Even or odd",
    emoji: "⚖️",
    description: "Conditional branching with isEven().",
    language: "en",
    source: `Let n be 17.
If isEven(n) is true, then say "even".
If isOdd(n) is true, then say "odd".`,
  },
  {
    id: "fahrenheit",
    name: "Fahrenheit → Celsius",
    emoji: "🌡️",
    description: "Convert a temperature with arithmetic.",
    language: "en",
    source: `Let f be 98.
Let c be (f minus 32) times 5 divided by 9.
Print f plus "°F is " plus toFixed(c, 1) plus "°C".`,
  },
  {
    id: "circle",
    name: "Circle area",
    emoji: "⭕",
    description: "Use Math.PI() and exponentiation.",
    language: "en",
    source: `Let radius be 5.
Let area be Math.PI() times radius ** 2.
Print "area = " plus toFixed(area, 3).`,
  },
  {
    id: "interest",
    name: "Compound interest",
    emoji: "💰",
    description: "Annual compounding over a number of years.",
    language: "en",
    source: `Let principal be 1000.
Let rate be 0.05.
Let years be 10.
Let total be principal times (1 plus rate) ** years.
Print "After " plus years plus " years: $" plus toFixed(total, 2).`,
  },
  {
    id: "shout",
    name: "Shout a name",
    emoji: "📣",
    description: "String methods: uppercase and repeat.",
    language: "en",
    source: `Let name be "ada".
Let loud be toUpperCase(name).
Print loud plus repeat("!", 3).`,
  },
  {
    id: "reverse",
    name: "Reverse a word",
    emoji: "🔁",
    description: "Strings can be flipped with reverse().",
    language: "en",
    source: `Let word be "prosa".
Print reverse(word).`,
  },
  {
    id: "guess",
    name: "Number guessing",
    emoji: "🎲",
    description: "Random number with a comparison.",
    language: "en",
    source: `Let secret be randInt(1, 10).
Let guess be 7.
Print "secret was " plus secret.
If guess is equal to secret, then say "You win!".
If guess is not equal to secret, then say "Try again.".`,
  },
  {
    id: "prime",
    name: "Prime check",
    emoji: "🔍",
    description: "Built-in isPrime() over a value.",
    language: "en",
    source: `Let n be 29.
If isPrime(n) is true, then print n plus " is prime".
If isPrime(n) is false, then print n plus " is composite".`,
  },
  {
    id: "countdown",
    name: "Countdown",
    emoji: "🚀",
    description: "Sequential print sentences.",
    language: "en",
    source: `Print 5.
Print 4.
Print 3.
Print 2.
Print 1.
Print "Lift off!".`,
  },
  {
    id: "stats",
    name: "Average of values",
    emoji: "📊",
    description: "Aggregates with sum() and avg().",
    language: "en",
    source: `Let total be sum(8, 12, 15, 21, 4).
Let mean be avg(8, 12, 15, 21, 4).
Print "sum = " plus total.
Print "avg = " plus toFixed(mean, 2).`,
  },
];
