// The DSL is instance_eval'd Ruby: only backslashes and single quotes need escaping.
export function dslQuote(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

export function dslHeredoc(body: string, defaultTag = 'MARKDOWN'): string {
  // Interpolating Ruby heredoc: an unescaped \ is processed and #{…} executes.
  const escaped = body.replace(/\\/g, '\\\\').replace(/#\{/g, '\\#{');
  let tag = defaultTag;
  let suffix = 0;
  while (escaped.includes(tag)) {
    suffix += 1;
    tag = `${defaultTag}_${suffix}`;
  }
  return `<<${tag}\n${escaped}\n${tag}`;
}
