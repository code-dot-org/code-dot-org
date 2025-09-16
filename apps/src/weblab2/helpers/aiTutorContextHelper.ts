import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext} from '@cdo/apps/aiTutor/types';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

interface AiTutorWebLab2Params {
  source: MultiFileSource | undefined;
  longInstructions: string | undefined;
}

export class AiTutorWebLab2ContextHelper extends AiTutorContextHelper<AiTutorWebLab2Params> {
  private aiTutorContent: AiTutorContext = {};

  protected getAiTutorContext(): AiTutorContext {
    return this.aiTutorContent;
  }

  setAiTutorContext({source, longInstructions}: AiTutorWebLab2Params) {
    const sourceCode = source
      ? Object.values(source.files)
          .filter(
            file =>
              file.type !== ProjectFileType.VALIDATION &&
              file.type !== ProjectFileType.SYSTEM_SUPPORT
          )
          .map(file => file.contents)
          .join('\n')
      : undefined;

    this.aiTutorContent = {
      sourceCode,
      longInstructions,
    };
  }
}
