import {AiTutorContext} from '../types';

/*
 * Abstract base class used to provide lab specific context to AI Tutor.  Each lab will inherit from and
 * extend this class, but conversion to a system prompt string should be kept here for coordination and
 * consistency.
 */
export abstract class AiTutorContextHelper<T extends object> {
  protected abstract getAiTutorContext():
    | Promise<AiTutorContext>
    | AiTutorContext;

  protected abstract setAiTutorContext(params: T): void;

  private async getHiddenContextString() {
    const {
      sourceCode,
      validationContents,
      validationResults,
      longInstructions,
      documentation,
      userSelection,
    } = await this.getAiTutorContext();

    const hiddenContextString = [
      ...(userSelection
        ? [
            'The student is asking about this part of their current code:',
            userSelection,
          ]
        : []),
      "Here is the student's current code:",
      sourceCode,
      ...(validationContents
        ? ['Here is the validation code:', `\`\`\`${validationContents}\`\`\``]
        : []),
      ...(validationResults
        ? [
            'Here are the validation test names along with their results, in JSON:',
            validationResults,
          ]
        : []),
      ...(longInstructions
        ? ['Here are the instructions:', longInstructions]
        : []),
      ...(documentation
        ? [
            'Here is the documentation. (The student can view the documentation by clicking the book icon at the top of the workspace.):',
            documentation,
          ]
        : []),
    ].join('\n\n');

    // TODO: This log is a bit chatty, but useful while we're working on this feature.
    // remove once tutor context is more stable, or if it gets annoying.
    console.log(`🤖: Tutor context:`, hiddenContextString);
    return hiddenContextString;
  }

  getHiddenContextCallback() {
    return this.getHiddenContextString.bind(this);
  }
}
