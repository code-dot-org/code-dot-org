import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext} from '@cdo/apps/aiTutor/types';

interface AiTutorLegacyLabParams {
  source?: string;
}

export class AiTutorLegacyLabContextHelper extends AiTutorContextHelper<AiTutorLegacyLabParams> {
  params: AiTutorLegacyLabParams = {};

  protected getAiTutorContext(): AiTutorContext {
    return {
      sourceCode: this.params.source,
    };
  }
}
