// What the tutor is told about the project, before the student says anything.
//
// Ported from `apps/src/aiTutor/types.ts`. Every field is optional and every
// field is the host's to fill: the package cannot know what a project is, which
// of its files the student may see, or whether they have run it yet.
//
// One field of the legacy type is not here. `documentationLocation` was
// declared on `AiTutorContext` and never read — the builder took it from a
// protected field on the helper class instead — so carrying it would be
// carrying a field that has never done anything. It is a real input, and it is
// below, where the builder actually reads it.

export interface AiTutorContext {
  /** The code the student can see and change. */
  sourceCode?: string;

  /**
   * Code that runs the lesson but that the student cannot see.
   *
   * Told to the model with an instruction not to mention it, which is a
   * request rather than a guarantee — worth knowing before putting an answer
   * key in here.
   */
  hiddenSourceCode?: string;

  /** Code the student can read but not change. */
  readOnlySourceCode?: string;

  validationContents?: string;
  /** Test names and their results, as JSON. */
  validationResults?: string;

  longInstructions?: string;
  documentation?: string;

  /** Where the student can go and read the documentation for themselves. */
  documentationLocation?: string;
  /** Where the student can go and look at example projects. */
  examplesLocation?: string;

  /** The debug console, tail-trimmed by the host to {@link MAX_CONSOLE_LINES}. */
  consoleOutput?: string;

  /**
   * Whether the student has run it, and whether they have changed it.
   *
   * `false` is a statement and `undefined` is silence, which is why these are
   * tri-state rather than booleans: "the student has not run the code" is worth
   * telling a tutor, and "I do not know whether they have" is not.
   */
  hasRun?: boolean;
  hasEdited?: boolean;
}
