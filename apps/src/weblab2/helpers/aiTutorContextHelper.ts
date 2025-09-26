import {UserAddedSelectionContext} from '@cdo/apps/aichat/types';
import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext} from '@cdo/apps/aiTutor/types';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

interface AiTutorWebLab2Params {
  source: MultiFileSource | undefined;
  longInstructions: string | undefined;
  selection: UserAddedSelectionContext;
}

export class AiTutorWebLab2ContextHelper extends AiTutorContextHelper<AiTutorWebLab2Params> {
  private aiTutorContext: AiTutorContext = {};

  protected getAiTutorContext(): AiTutorContext {
    return this.aiTutorContext;
  }

  setAiTutorContext({
    source,
    longInstructions,
    selection,
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

    const userSelection =
      selection && Object.values(selection).length > 0
        ? Object.values(selection)
            .map(
              context =>
                `filename: ${context.filename}\n\`\`\`${context.sourceCode}}\`\`\``
            )
            .join('\n\n')
        : undefined;

    this.aiTutorContext = {
      sourceCode,
      longInstructions,
      userSelection,
    };
  }
}
