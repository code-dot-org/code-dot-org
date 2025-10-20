import {AiTutorContext, MaybePromise} from '../types';

const USER_SELECTION_INTRO =
  'The student is asking about this part of their current code:';

const SOURCE_CODE_INTRO = "Here is the student's current code:";

const HIDDEN_SOURCE_CODE_INTRO =
  'Here is the hidden source code used to run this lesson. The student cannot view or modify this code so do not reference it in your response:';

const VALIDATION_CONTENTS_INTRO = 'Here is the validation code:';

const VALIDATION_RESULTS_INTRO =
  'Here are the validation test names along with their results, in JSON:';

const INSTRUCTIONS_INTRO = 'Here are the instructions:';

const DOCUMENTATION_INTRO = 'Here is the documentation:';

/*
 * Abstract base class used to provide lab specific context to AI Tutor.  Each lab will inherit from and
 * extend this class, but conversion to a system prompt string should be kept here for coordination and
 * consistency.
 */
export abstract class AiTutorContextHelper<AiTutorParams extends object> {
  protected additionalContext: string = '';

  protected abstract getAiTutorContext(): MaybePromise<AiTutorContext>;

  protected abstract setAiTutorContext(params: AiTutorParams): void;

  private async getHiddenContextString(): Promise<string> {
    const {
      sourceCode,
      hiddenSourceCode,
      validationContents,
      validationResults,
      longInstructions,
      documentation,
      userSelection,
    } = await this.getAiTutorContext();

    const hiddenContextString = [
      userSelection ? `${USER_SELECTION_INTRO} ${userSelection}` : '',
      sourceCode ? `${SOURCE_CODE_INTRO} ${sourceCode}` : '',
      hiddenSourceCode ? `${HIDDEN_SOURCE_CODE_INTRO} ${hiddenSourceCode}` : '',
      validationContents
        ? `${VALIDATION_CONTENTS_INTRO} ${validationContents}`
        : '',
      validationResults
        ? `${VALIDATION_RESULTS_INTRO} ${validationResults}`
        : '',
      longInstructions ? `${INSTRUCTIONS_INTRO} ${longInstructions}` : '',
      documentation ? `${DOCUMENTATION_INTRO} ${documentation}` : '',
      this.additionalContext,
    ]
      .filter(Boolean)
      .join('\n\n');

    // TODO: This log is a bit chatty, but useful while we're working on this feature.
    // remove once tutor context is more stable, or if it gets annoying.
    console.log(`🤖: Tutor context:`, hiddenContextString);
    return hiddenContextString;
  }

  getHiddenContextCallback() {
    return this.getHiddenContextString.bind(this);
  }
}
