/**
 * Reads the current Blockly workspace's generated code. Lazy-imports
 * `blockly` and the workspace utils so the studio bundle doesn't pull
 * Blockly into the main chunk just for AI-Tutor hosting — only the first
 * tutor query does.
 *
 * Uses the `javascript` generator (not `simple`). The `simple` generator
 * works fine for maze/datasci/ai-trainer in isolation, but for Music Lab
 * the simple-language `forBlock` entries call back into the javascript
 * generator without init'ing it, producing a "CodeGenerator init was not
 * called" warning and incomplete output. Javascript is the universal path:
 * every lab block has a javascript generator registered, and `blockToCode`
 * runs clean.
 */

/** Returns the current main-workspace code, or undefined if no workspace. */
export async function readCurrentBlocklyCode(): Promise<string | undefined> {
  try {
    const [BlocklyMod, {getAllGeneratedCode}] = await Promise.all([
      import('blockly/core'),
      import('@code-dot-org/blockly-workspace/utils'),
    ]);
    const Blockly =
      (BlocklyMod as unknown as {default?: typeof BlocklyMod}).default ??
      BlocklyMod;
    const workspace = Blockly.getMainWorkspace();
    if (!workspace) return undefined;
    const code = getAllGeneratedCode({
      language: 'javascript',
      workspaces: [workspace],
    })?.trim();
    return code || undefined;
  } catch (err) {
    console.warn('[AiTutorHost] failed to read Blockly code:', err);
    return undefined;
  }
}
