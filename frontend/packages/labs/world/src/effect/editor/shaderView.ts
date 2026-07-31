/**
 * Splitting a compiled shader into "setup" and "the effect".
 *
 * The code panel is a teaching surface: a learner opens it to see what their
 * graph became, and the first thing they meet should be their own uniforms and
 * `main()`, not five lines of preprocessor. The boilerplate is still emitted —
 * the precision guard has to reach the device that runs the shader — it is
 * just folded away until asked for.
 */
export interface ShaderSections {
  /** Version, pragma, and the precision guard. May be empty. */
  preamble: string;
  /** Uniforms, varyings, helpers, and `main()`. */
  body: string;
}

/**
 * Everything a fragment shader has to say before it declares anything.
 *
 * The rule is structural rather than a line count: consume leading lines that
 * are blank, a preprocessor directive, or a `precision` statement, and stop at
 * the first line that declares something. That holds for both forms of the
 * precision block — guarded and bare — and does not need updating when the
 * preamble grows a line.
 */
function isPreambleLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.length === 0 ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('precision ')
  );
}

export function splitShaderPreamble(source: string): ShaderSections {
  const lines = source.split('\n');
  let index = 0;
  while (index < lines.length && isPreambleLine(lines[index])) {
    index += 1;
  }

  // A shader that is *only* preamble has no body to show; treat the whole
  // thing as the body so the panel never renders blank.
  if (index >= lines.length) {
    return {preamble: '', body: source};
  }

  return {
    preamble: lines.slice(0, index).join('\n'),
    body: lines.slice(index).join('\n'),
  };
}

/** How many lines the folded preamble holds, ignoring the blank separator. */
export function preambleLineCount(preamble: string): number {
  return preamble.split('\n').filter(line => line.trim().length > 0).length;
}
