import {AiTutorContext, MaybePromise} from '../types';

const SOURCE_CODE_INTRO = "Here is the student's current code:";

const HIDDEN_SOURCE_CODE_INTRO =
  'Here is the hidden source code used to run this lesson. The student cannot view or modify this code so do not reference it in your response:';

const READ_ONLY_SOURCE_CODE_INTRO =
  'Here is the source code used to run this lesson. The student can view the code but cannot modify it:';

const VALIDATION_CONTENTS_INTRO = 'Here is the validation code:';

const VALIDATION_RESULTS_INTRO =
  'Here are the validation test names along with their results, in JSON:';

const INSTRUCTIONS_INTRO = 'Here are the instructions:';

const DOCUMENTATION_INTRO = 'Here is the documentation:';

const DOCUMENTATION_LOCATION_INTRO =
  'Here is where the student can find the documentation:';

const EXAMPLES_LOCATION_INTRO =
  'Here is where the student can find example projects:';

const CONSOLE_OUTPUT_INTRO =
  "Here is the output currently shown in the student's debug console:";

/*
 * Abstract base class used to provide lab specific context to AI Tutor.  Each lab will inherit from and
 * extend this class, but conversion to a system prompt string should be kept here for coordination and
 * consistency.
 */
export abstract class AiTutorContextHelper<AiTutorParams extends object> {
  protected documentationLocation: string = '';
  protected examplesLocation: string = '';

  protected abstract getAiTutorContext(): MaybePromise<AiTutorContext>;

  protected abstract setAiTutorContext(params: AiTutorParams): void;

  private async getHiddenContextString(): Promise<string> {
    const {
      sourceCode,
      hiddenSourceCode,
      readOnlySourceCode,
      validationContents,
      validationResults,
      longInstructions,
      documentation,
      consoleOutput,
    } = await this.getAiTutorContext();

    const hiddenContextString = [
      sourceCode ? `${SOURCE_CODE_INTRO} ${sourceCode}` : '',
      hiddenSourceCode ? `${HIDDEN_SOURCE_CODE_INTRO} ${hiddenSourceCode}` : '',
      readOnlySourceCode
        ? `${READ_ONLY_SOURCE_CODE_INTRO} ${readOnlySourceCode}`
        : '',
      validationContents
        ? `${VALIDATION_CONTENTS_INTRO} ${validationContents}`
        : '',
      validationResults
        ? `${VALIDATION_RESULTS_INTRO} ${validationResults}`
        : '',
      longInstructions ? `${INSTRUCTIONS_INTRO} ${longInstructions}` : '',
      documentation ? `${DOCUMENTATION_INTRO} ${documentation}` : '',
      this.documentationLocation
        ? `${DOCUMENTATION_LOCATION_INTRO} ${this.documentationLocation}`
        : '',
      this.examplesLocation
        ? `${EXAMPLES_LOCATION_INTRO} ${this.examplesLocation}`
        : '',
      consoleOutput ? `${CONSOLE_OUTPUT_INTRO} ${consoleOutput}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    // TODO: This log is a bit chatty, but useful while we're working on this feature.
    // remove once tutor context is more stable, or if it gets annoying.
    console.log(`🤖: Tutor context:`, hiddenContextString);
    return hiddenContextString;
  }

  // Hidden context is additional context provided to AI tutor that is not
  // visible to the student and is not stored as part of the chat history.
  getHiddenContextCallback() {
    return this.getHiddenContextString.bind(this);
  }

  protected codeBlock(str?: string): string {
    if (!str) return '';
    return `\`\`\`\n${str}\n\`\`\``;
  }
}
