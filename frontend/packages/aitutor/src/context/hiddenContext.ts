// Turning what the host knows into what the model is told.
//
// A verbatim port of `getHiddenContextString` in
// `apps/src/aiTutor/helpers/aiTutorContextHelper.ts` — the intro sentences, the
// order of the sections, the single space after each intro, the blank line
// between sections, and the rule that an absent field contributes nothing
// rather than an empty section. A test asserts the whole string, because this
// is a PROMPT: it has been tuned against a model's behaviour, and a stray
// newline is a change to the input that tuning was done against.
//
// A FUNCTION, where the legacy is an abstract class each lab subclasses. The
// subclassing bought two things — a per-lab `getAiTutorContext` and two fields
// set once per lab — and both are better said by the host passing an object.
// There is nothing for a base class to hold when the string builder is the only
// shared behaviour, which the legacy header all but says: "conversion to a
// system prompt string should be kept here for coordination and consistency".

import type {AiTutorContext} from './types';

/**
 * How much of the console the model is told about.
 *
 * Exported because the TRIMMING is the host's — only it has the console — and
 * the number is quoted in the sentence below, so a host that trims to a
 * different length would be sending a sentence that lies about its own content.
 */
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

/** Fence a block of code, as the legacy helper offers its subclasses. */
export const codeBlock = (text?: string): string =>
  text ? `\`\`\`\n${text}\n\`\`\`` : '';

/**
 * The context string for one turn.
 *
 * Not shown to the student and not kept in the conversation history — it is
 * rebuilt per turn from the project as it is now (`useTutor`).
 */
export const hiddenContextFrom = (context: AiTutorContext): string => {
  const {
    sourceCode,
    hiddenSourceCode,
    readOnlySourceCode,
    validationContents,
    validationResults,
    longInstructions,
    documentation,
    documentationLocation,
    examplesLocation,
    consoleOutput,
    hasRun,
    hasEdited,
  } = context;

  // "There are tests and no results" is a different fact from "there are no
  // tests", and only the first is worth a sentence.
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
    documentationLocation
      ? `${DOCUMENTATION_LOCATION_INTRO} ${documentationLocation}`
      : '',
    examplesLocation ? `${EXAMPLES_LOCATION_INTRO} ${examplesLocation}` : '',
    consoleOutput ? `${CONSOLE_OUTPUT_INTRO} ${consoleOutput}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
};
