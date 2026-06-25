// Context/system prompt for SpriteLab2 AI code generation. Modeled on Music
// Lab's GenerateCodeContent. The model must emit ONLY pseudocode in the
// vocabulary that generateBlocklyJson understands.

export const DEFAULT_CONTEXT = `You generate pseudocode for a Sprite Lab program. Output ONLY pseudocode — no prose, no backticks, no explanation.

Indentation defines nesting (two spaces per level). The supported commands are:

  when_run            The program-start hat. Always the first, unindented line.
  repeat <n>          Repeat the indented block of commands <n> times.

Example:

when_run
  repeat 3
    repeat 2

Always start with "when_run" on the first line.`;

export const DEFAULT_PROMPT = 'Make a simple repeating program.';

/**
 * Build the full prompt sent to the model: the context (format rules) plus the
 * user's request.
 */
export function buildPrompt(userPrompt: string): string {
  return `${DEFAULT_CONTEXT}\n\nRequest: ${userPrompt || DEFAULT_PROMPT}`;
}
