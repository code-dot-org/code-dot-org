/**
 * The shared Blockly workspace edits either the student's starting blocks
 * or the author's own solution, one at a time (Author Mode Pass D —
 * MazeLabEditingProps.workspaceMode). Pure precedence logic, factored out
 * of LevelRail so mode-separation is unit-testable without React.
 */
export type WorkspaceMode = 'studentStart' | 'mySolution';

export interface WorkspaceModeXml {
  studentStart?: string;
  mySolution?: string;
}

/**
 * Which XML to load into the workspace on (re-)entering `mode`, closest to
 * the canvas first:
 *
 * 1. `attempt` — an in-session solution attempt not yet accepted into the
 *    Save draft (mySolution only; student-start has no equivalent because
 *    every mutation there IS the draft already, see LevelRail's continuous
 *    capture).
 * 2. `draft` — this session's Save-bound edit: student-start's continuous
 *    capture, or an already-accepted solution.
 * 3. `served` — whatever the server last returned.
 *
 * undefined at the end of the chain means "no content for this mode yet" —
 * the caller's own default (MazeLab's when_run-hat fallback) applies, same
 * as an absent levelProperties.startBlocks.
 */
export function resolveWorkspaceOverrideXml(
  mode: WorkspaceMode,
  attempt: WorkspaceModeXml,
  draft: WorkspaceModeXml,
  served: WorkspaceModeXml,
): string | undefined {
  if (mode === 'studentStart') {
    return draft.studentStart ?? served.studentStart;
  }
  return attempt.mySolution ?? draft.mySolution ?? served.mySolution;
}
