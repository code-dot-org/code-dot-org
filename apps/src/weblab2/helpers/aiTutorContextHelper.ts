import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext, UserAddedContextType} from '@cdo/apps/aiTutor/types';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

interface AiTutorWebLab2Params {
  source: MultiFileSource | undefined;
  longInstructions: string | undefined;
  userAddedContext: UserAddedContextType[] | undefined;
}

export class AiTutorWebLab2ContextHelper extends AiTutorContextHelper<AiTutorWebLab2Params> {
  private aiTutorContext: AiTutorContext = {};

  protected getAiTutorContext(): AiTutorContext {
    return this.aiTutorContext;
  }

  setAiTutorContext({
    source,
    longInstructions,
    userAddedContext,
  }: AiTutorWebLab2Params) {
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

    const userAddedContextString = userAddedContext
      ? userAddedContext
          .map(
            item => `Filename: ${item.filename}\n\`\`\`${item.sourceCode}\`\`\``
          )
          .join('\n\n')
      : undefined;

    this.aiTutorContext = {
      sourceCode,
      longInstructions,
      userAddedContext: userAddedContextString,
    };
  }
}
