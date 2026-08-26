// Parses the Ruby-ish DSL level files under dashboard/config/scripts/
// (verified against real .multi/.match/.external/.bubble_choice/.level_group
// files from the k5-ai-data-2024 script and a sample of the wider corpus):
//
//   name 'key'                 natural key
//   title '...' / display_name '...'   display name (display_name wins)
//   question '...'             .multi: the question; .match: starts a pair
//   right '...' / wrong '...'  .multi: one answer choice, in file order
//   answer '...'               .match: closes the pair opened by `question`
//   allow_multiple_attempts true|false
//   markdown <<MARKDOWN ... MARKDOWN     heredoc body
//   sublevels / level '...'    .bubble_choice: the choice list
//   page / level '...' / text '...'     .level_group: pages of sub-levels
//
// `right`/`wrong` were verified against multiple real .multi files —
// `right` marks a correct answer, `wrong` an incorrect one; a survey-style
// question with no wrong answer at all uses only `right` lines.

export type DslExt =
  | 'multi'
  | 'match'
  | 'external'
  | 'bubble_choice'
  | 'level_group'
  | 'text_match';

export type ParsedDslLevel =
  | {
      kind: 'multi';
      displayName?: string;
      question: string;
      answers: {text: string; correct: boolean}[];
      allowMultipleAttempts?: boolean;
      markdown?: string;
    }
  | {
      kind: 'match';
      displayName?: string;
      pairs: {question: string; answer: string}[];
      markdown?: string;
    }
  | {kind: 'external'; displayName?: string; markdown: string}
  | {kind: 'bubbleChoice'; displayName?: string; levelKeys: string[]}
  | {kind: 'levelGroup'; displayName?: string; pages: string[][]}
  // A DSL extension with no defined GenericLevelData shape (e.g.
  // .text_match) — honest opaque fallback, same as an unrecognized XML
  // level type.
  | {kind: 'opaque'; levelType: string; displayName?: string};

interface DslStatement {
  verb: string;
  value?: string | boolean;
}

export function unescapeRubyString(s: string): string {
  // Ruby single-quoted strings recognize exactly two escapes: \\ and \'.
  return s.replace(/\\(.)/g, (_, ch: string) => ch);
}

function tokenizeDsl(text: string): DslStatement[] {
  const lines = text.split(/\r?\n/);
  const statements: DslStatement[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === '') continue;

    const heredoc = trimmed.match(/^(\w+)\s+<<(\w+)$/);
    if (heredoc) {
      const [, verb, label] = heredoc;
      const body: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== label) {
        body.push(lines[i]);
        i++;
      }
      statements.push({verb, value: body.join('\n').trim()});
      continue;
    }

    const quoted = trimmed.match(/^(\w+)\s+'((?:\\.|[^'\\])*)'\s*$/);
    if (quoted) {
      statements.push({verb: quoted[1], value: unescapeRubyString(quoted[2])});
      continue;
    }

    const bareBool = trimmed.match(/^(\w+)\s+(true|false)\s*$/);
    if (bareBool) {
      statements.push({verb: bareBool[1], value: bareBool[2] === 'true'});
      continue;
    }

    const marker = trimmed.match(/^(\w+)$/);
    if (marker) {
      statements.push({verb: marker[1]});
      continue;
    }

    // Unrecognized line shape (e.g. a field outside our covered grammar) —
    // ignore it; buildCourse only reads the verbs it needs.
  }

  return statements;
}

function findValue(
  statements: DslStatement[],
  verb: string,
): string | boolean | undefined {
  return statements.find(s => s.verb === verb)?.value;
}

function findDisplayName(statements: DslStatement[]): string | undefined {
  const displayName = findValue(statements, 'display_name');
  if (typeof displayName === 'string') return displayName;
  const title = findValue(statements, 'title');
  return typeof title === 'string' ? title : undefined;
}

function parseMulti(statements: DslStatement[]): ParsedDslLevel {
  const question = findValue(statements, 'question');
  const answers: {text: string; correct: boolean}[] = [];
  for (const s of statements) {
    if (s.verb === 'right' && typeof s.value === 'string') {
      answers.push({text: s.value, correct: true});
    } else if (s.verb === 'wrong' && typeof s.value === 'string') {
      answers.push({text: s.value, correct: false});
    }
  }
  const allowMultipleAttempts = findValue(
    statements,
    'allow_multiple_attempts',
  );
  const markdown = findValue(statements, 'markdown');
  return {
    kind: 'multi',
    displayName: findDisplayName(statements),
    question: typeof question === 'string' ? question : '',
    answers,
    allowMultipleAttempts:
      typeof allowMultipleAttempts === 'boolean'
        ? allowMultipleAttempts
        : undefined,
    markdown:
      typeof markdown === 'string' && markdown !== '' ? markdown : undefined,
  };
}

function parseMatch(statements: DslStatement[]): ParsedDslLevel {
  const pairs: {question: string; answer: string}[] = [];
  let pendingQuestion: string | undefined;
  for (const s of statements) {
    if (s.verb === 'question' && typeof s.value === 'string') {
      pendingQuestion = s.value;
    } else if (
      s.verb === 'answer' &&
      typeof s.value === 'string' &&
      pendingQuestion !== undefined
    ) {
      pairs.push({question: pendingQuestion, answer: s.value});
      pendingQuestion = undefined;
    }
  }
  const markdown = findValue(statements, 'markdown');
  return {
    kind: 'match',
    displayName: findDisplayName(statements),
    pairs,
    markdown:
      typeof markdown === 'string' && markdown !== '' ? markdown : undefined,
  };
}

function parseExternal(statements: DslStatement[]): ParsedDslLevel {
  const markdown = findValue(statements, 'markdown');
  return {
    kind: 'external',
    displayName: findDisplayName(statements),
    markdown: typeof markdown === 'string' ? markdown : '',
  };
}

function parseBubbleChoice(statements: DslStatement[]): ParsedDslLevel {
  const levelKeys = statements
    .filter(s => s.verb === 'level' && typeof s.value === 'string')
    .map(s => s.value as string);
  return {
    kind: 'bubbleChoice',
    displayName: findDisplayName(statements),
    levelKeys,
  };
}

function parseLevelGroup(statements: DslStatement[]): ParsedDslLevel {
  const pages: string[][] = [];
  let current: string[] | null = null;
  for (const s of statements) {
    if (s.verb === 'page') {
      current = [];
      pages.push(current);
      continue;
    }
    if (
      (s.verb === 'level' || s.verb === 'text') &&
      typeof s.value === 'string'
    ) {
      if (!current) {
        current = [];
        pages.push(current);
      }
      current.push(s.value);
    }
  }
  return {kind: 'levelGroup', displayName: findDisplayName(statements), pages};
}

export function parseDslLevel(text: string, ext: DslExt): ParsedDslLevel {
  const statements = tokenizeDsl(text);

  switch (ext) {
    case 'multi':
      return parseMulti(statements);
    case 'match':
      return parseMatch(statements);
    case 'external':
      return parseExternal(statements);
    case 'bubble_choice':
      return parseBubbleChoice(statements);
    case 'level_group':
      return parseLevelGroup(statements);
    case 'text_match':
      return {
        kind: 'opaque',
        levelType: 'TextMatch',
        displayName: findDisplayName(statements),
      };
  }
}
