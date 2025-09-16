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
    if (!source) {
      return Promise.resolve({});
    }

    const sourceCode = Object.entries(source.files)
      .filter(
        ([_, file]) =>
          file.type !== ProjectFileType.VALIDATION &&
          file.type !== ProjectFileType.SYSTEM_SUPPORT
      )
      .map(([_, file]) => file.contents)
      .join('\n');

    this.aiTutorContent = {
      sourceCode,
      longInstructions,
    };
  }
}
