/**
 * Builds the "hidden context" string the tutor receives alongside every user
 * message. Ported from `apps/src/aiTutor/helpers/aiTutorContextHelper.ts` —
 * the legacy version is a class subclassed per-lab; here we provide the
 * stringify step as a plain function so callers can compose their own
 * context source (a function, a hook, anything) without inheritance.
 *
 * The output format matches the legacy verbatim — same intros, same order,
 * same `\n\n` separator — so a system prompt tuned against the legacy
 * tutor still works.
 */

import type {AiTutorContext, MaybePromise} from './types';

export const MAX_CONSOLE_LINES = 50;

const SOURCE_CODE_INTRO = "Here is the student's current code:";
const HAS_NOT_RUN = 'The student has not run the source code.';
const HAS_NOT_EDITED = 'The student has not edited the source code.';
const HIDDEN_SOURCE_CODE_INTRO =
  'Here is the hidden source code used to run this lesson. The student cannot view or modify this code so do not reference it in your response:';
const READ_ONLY_SOURCE_CODE_INTRO =
  'Here is the source code used to run this lesson. The student can view the code but cannot modify it:';
const VALIDATION_CONTENTS_INTRO = 'Here is the validation code:';
const VALIDATION_RESULTS_INTRO =
  'Here are the validation test names along with their results, in JSON:';
const VALIDATION_NOT_RUN = 'The student has not run test validation yet.';
const INSTRUCTIONS_INTRO = 'Here are the instructions:';
const DOCUMENTATION_INTRO = 'Here is the documentation:';
const DOCUMENTATION_LOCATION_INTRO =
  'Here is where the student can find the documentation:';
const EXAMPLES_LOCATION_INTRO =
  'Here is where the student can find example projects:';
const CONSOLE_OUTPUT_INTRO = `Here is the output currently shown in the student's debug console, limited to the last ${MAX_CONSOLE_LINES} lines:`;

export interface BuildContextStringOptions {
  /** Where in the docs the student can look. Added as its own line if set. */
  documentationLocation?: string;
  /** Where the student can find example projects. Same treatment. */
  examplesLocation?: string;
}

/**
 * Render an `AiTutorContext` into the labeled string the tutor sees. Matches
 * the legacy output exactly so an existing system prompt keeps working.
 */
export function buildHiddenContextString(
  context: AiTutorContext,
  options: BuildContextStringOptions = {},
): string {
  const {
    sourceCode,
    hiddenSourceCode,
    readOnlySourceCode,
    validationContents,
    validationResults,
    longInstructions,
    documentation,
    consoleOutput,
    hasRun,
    hasEdited,
  } = context;

  const validationNotRun = validationContents && !validationResults;

  return [
    sourceCode ? `${SOURCE_CODE_INTRO} ${sourceCode}` : '',
    hasRun === false ? HAS_NOT_RUN : '',
    hasEdited === false ? HAS_NOT_EDITED : '',
    hiddenSourceCode ? `${HIDDEN_SOURCE_CODE_INTRO} ${hiddenSourceCode}` : '',
    readOnlySourceCode
      ? `${READ_ONLY_SOURCE_CODE_INTRO} ${readOnlySourceCode}`
      : '',
    validationNotRun ? VALIDATION_NOT_RUN : '',
    validationContents
      ? `${VALIDATION_CONTENTS_INTRO} ${validationContents}`
      : '',
    validationResults ? `${VALIDATION_RESULTS_INTRO} ${validationResults}` : '',
    longInstructions ? `${INSTRUCTIONS_INTRO} ${longInstructions}` : '',
    documentation ? `${DOCUMENTATION_INTRO} ${documentation}` : '',
    options.documentationLocation
      ? `${DOCUMENTATION_LOCATION_INTRO} ${options.documentationLocation}`
      : '',
    options.examplesLocation
      ? `${EXAMPLES_LOCATION_INTRO} ${options.examplesLocation}`
      : '',
    consoleOutput ? `${CONSOLE_OUTPUT_INTRO} ${consoleOutput}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Convenience: wrap a context-producing function into the
 * `() => Promise<string>` callback `<AiTutorChat>` expects.
 */
export function makeHiddenContextCallback(
  contextProvider: () => MaybePromise<AiTutorContext>,
  options: BuildContextStringOptions = {},
): () => Promise<string> {
  return async () => {
    const context = await contextProvider();
    return buildHiddenContextString(context, options);
  };
}
