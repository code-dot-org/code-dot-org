import {UserAddedContext} from '@cdo/apps/aichat/types';
import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext} from '@cdo/apps/aiTutor/types';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

interface AiTutorWebLab2Params {
  source: MultiFileSource | undefined;
  longInstructions: string | undefined;
}

export class AiTutorWebLab2ContextHelper extends AiTutorContextHelper<AiTutorWebLab2Params> {
  private aiTutorContext: AiTutorContext = {};

  protected getAiTutorContext(): AiTutorContext {
    return this.aiTutorContext;
  }

  setAiTutorContext({source, longInstructions}: AiTutorWebLab2Params) {
    const sourceCode = source
      ? Object.values(source.files)
          .filter(
            file =>
              file.type !== ProjectFileType.VALIDATION &&
              file.type !== ProjectFileType.SYSTEM_SUPPORT
          )
          .map(file => `filename: ${file.name}\n\`\`\`${file.contents}\`\`\``)
          .join('\n\n')
      : undefined;

    this.aiTutorContext = {
      sourceCode,
      longInstructions,
    };
  }

  getHiddenContextCallbackWebLab2(userAddedContext: UserAddedContext) {
    return this.getHiddenContextStringWeblab2.bind(this, userAddedContext);
  }

  protected async getHiddenContextStringWeblab2(
    userAddedContext: UserAddedContext
  ) {
    const baseString = await super.getHiddenContextString();
    const userAddedContextData = Object.entries(userAddedContext).map(
      ([displayName, text]) => `Filename: ${displayName}\n\`\`\`${text}}\`\`\``
    );
    if (userAddedContextData.length > 0) {
      const userAddedContextString = [
        'The student would like to focus on this subset of their current code:',
        ...userAddedContextData,
      ].join('\n\n');
      const combinedString = [baseString, userAddedContextString].join('\n\n');
      console.log(`🤖: Tutor context with user added context:`, combinedString);
      return combinedString;
    }
    return baseString;
  }
}
