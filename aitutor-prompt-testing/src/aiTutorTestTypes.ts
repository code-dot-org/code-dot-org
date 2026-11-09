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
  /** Realistic student message when NOT explicitly requesting a video. */
  studentMessage?: string;
  /** Realistic student message when explicitly requesting a video. */
  studentMessageVideoRequested?: string;
}

// ─── Eval / expected output ───────────────────────────────────────────────────

export const VIDEO_OPTIONS = [
  'Variables_V1.json',
  'Functions_V1.json',
  'While_Loops_V1.json',
  'Conditionals_V1.json',
  'Painter_Object_V1.json',
  'Functions_With_Parameters_V1.json',
  'If_Else_V1.json',
] as const;

export type VideoOption = (typeof VIDEO_OPTIONS)[number];

/**
 * Video file metadata — canonical data lives in data/videoFiles.json.
 * This type is kept here for reference; the runtime data is fetched from the server.
 */
export type VideoFileData = {
  filename: VideoOption;
  hash: string;
  description: string;
};

/** @deprecated Use data/videoFiles.json via server API instead. */
export const VIDEO_FILE_DATA: ReadonlyArray<VideoFileData> = [
  {
    filename: 'Variables_V1.json',
    hash: 'abc1def2ghi3jkl4mno567',
    description:
      'This video covers the basics of variables, describing them as labeled containers or boxes that store information in memory. It introduces three fundamental data types: Integers (Ints), Strings, and Booleans. The speech explains how to assign values using the equal sign and how to use the print function to output these values by referencing the variable name without quotes.',
  },
  {
    filename: 'Conditionals_V1.json',
    hash: 'bcd2efg3hij4klm5nop678',
    description:
      'This video introduces the concept of conditional statements in programming. It explains that a conditional is a decision point that tells the computer to execute certain code only if a specific condition is true. Using Python as an example, it covers the syntax of the if statement, the importance of the colon, and how indentation defines which lines of code belong to the conditional block.',
  },
  {
    filename: 'If_Else_V1.json',
    hash: 'cde3fgh4ijk5lmn6opq789',
    description:
      'This video builds upon basic conditionals by introducing two-way selection using the if-else statement. It explains that while a simple if statement is a one-way selection (it does nothing if the condition is false), the else keyword provides an alternative path. It uses a real-world analogy of finishing homework to illustrate how the program skips the if block and runs the else block when a condition is not met.',
  },
  {
    filename: 'Functions_V1.json',
    hash: 'def4ghi5jkl6mno7pqr890',
    description:
      'This video provides an overview of functions, describing them as named blocks of code designed to perform specific tasks. It walks through the steps of defining a function using the def keyword, naming it, and using proper syntax (parentheses, colons, and indentation). Finally, it explains how to call a function to execute the instructions stored inside its definition.',
  },
  {
    filename: 'Functions_With_Parameters_V1.json',
    hash: 'efg5hij6klm7nop8qrs901',
    description:
      'This video explains functions with parameters by using the analogy of a "fill-in-the-blank" sentence. It defines a parameter as a placeholder (the blank space) and an argument as the actual value provided to fill that space. The lesson highlights that parameters are used to make code more reusable and easier to understand by allowing the same function to work with different values.',
  },
  {
    filename: 'While_Loops_V1.json',
    hash: 'fgh6ijk7lmn8opq9rst012',
    description:
      'This video explains the While Loop, a structure used to repeat instructions to keep code clean and organized. It uses a flowchart analogy to show how a computer checks a condition: if the condition is true, the code inside the loop runs; if false, the computer exits the loop. The video also covers the Python syntax for while loops, emphasizing the keyword while, the condition, and the required indentation for the repeated steps.',
  },
  {
    filename: 'Painter_Object_V1.json',
    hash: 'ghi7jkl8mno9pqr0stu123',
    description:
      'This video introduces the "Painter" object used in certain code.org python levels. It explains the relationship between a class (the blueprint) and an object (the specific instance, like \'alice\' or \'bob\'). It defines attributes as things the object knows and methods as actions it can perform. Finally, it demonstrates the "dot operator" syntax used to call methods on a specific object.',
  },
];

/**
 * Expected AI tutor output for a given level + state + videoRequested combination.
 * Key: `${levelId}_${StudioStateEnum}_VIDEO` or `${levelId}_${StudioStateEnum}_NOVIDEO`
 */
export interface PythonLabEvalEntry {
  /** Videos the AI tutor should return (empty = no video expected). */
  expectedVideos: VideoOption[];
}
