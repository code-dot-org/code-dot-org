// Escape a string for inclusion inside a single-quoted DSL literal. The
// DSL parser is Ruby's `instance_eval` on a hand-written DSL class, so
// backslashes and single quotes are the only characters that need to
// be neutralized.
export function dslQuote(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

// Pick a heredoc terminator that doesn't appear anywhere in the body.
// Default 'MARKDOWN' covers every shipped DSL file in source control;
// the fallback keeps us safe against pathological AI output.
//
// The DSL heredoc is a real interpolating Ruby heredoc (the DSL file is
// instance_eval'd), so backslash escapes are processed and #{…} would
// execute; escape both so AI-written bodies round-trip verbatim.
export function dslHeredoc(body: string, defaultTag = 'MARKDOWN'): string {
  const escaped = body.replace(/\\/g, '\\\\').replace(/#\{/g, '\\#{');
  let tag = defaultTag;
  let suffix = 0;
  while (escaped.includes(tag)) {
    suffix += 1;
    tag = `${defaultTag}_${suffix}`;
  }
  return `<<${tag}\n${escaped}\n${tag}`;
}
