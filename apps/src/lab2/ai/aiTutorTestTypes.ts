/**
 * Shared types for the AI tutor test dataset.
 *
 * Consumed by:
 *   - pythonLabLevelData.ts  (level metadata)
 *   - pythonLabStudioData.ts (simulated student states)
 *   - ai-tutor-prompt-tool.html (standalone dev tool — keep JS copy in sync)
 */

// ─── Student state ────────────────────────────────────────────────────────────

export type StudioStateEnum =
  | 'START'
  | 'STRUGGLING'
  | 'SYNTAX_ERRORS'
  | 'RUNTIME_ERRORS'
  | 'GOOD_PROGRESS'
  | 'ALMOST_THERE';

/** Human-readable description of each state, used in prompt assembly. */
export const STUDIO_STATE_LABELS: Record<StudioStateEnum, string> = {
  START: 'Just started — has not edited or run anything yet',
  STRUGGLING: 'Completely lost — trying random things, no clear strategy',
  SYNTAX_ERRORS: 'Has syntax errors that prevent the code from running',
  RUNTIME_ERRORS: 'Code runs but crashes with a runtime error',
  GOOD_PROGRESS: 'Making solid progress but the solution is incomplete',
  ALMOST_THERE: 'Very close — one small issue away from correct',
};

// ─── Level metadata ───────────────────────────────────────────────────────────

/**
 * One entry in the pythonLabLevelData map.
 * Key is the full level name as it appears in script_json files
 * (e.g. "programming-fundamentals-lesson5-level1_2025-launch_2025").
 */
export interface PythonLabLevelEntry {
  /** Script/unit this entry belongs to (e.g. "aif2-2025", "csaif2-preview"). */
  unitId: string;
  longInstructions?: string;
  startingCode?: string;
  documentationUrl: string;
  /**
   * Which pythonlab mini-app this level uses.
   * Omit for neighborhood (the default and majority of levels).
   */
  miniApp?: 'neighborhood' | 'console' | 'datascience';
}

// ─── Studio state data ────────────────────────────────────────────────────────

/**
 * Simulated snapshot of a student's editor state for a given level + conceptual state.
 * Key: `${levelId}_${StudioStateEnum}`
 */
export interface PythonLabStudioStateData {
  /** The Python code currently in the student's editor. */
  studentCode: string;
  /** Text shown in the debug console, if any. */
  consoleOutput?: string;
  /** Whether the student has run the code at least once. */
  hasRun: boolean;
  /** Whether the student has edited the starting code. */
  hasEdited: boolean;
  /** JSON-serialised validation test results, if any. */
  validationResults?: string;
}
