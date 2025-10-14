import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext} from '@cdo/apps/aiTutor/types';

interface AiTutorLegacyLabParams {
  source: string | undefined;
}

export class AiTutorLegacyLabContextHelper extends AiTutorContextHelper<AiTutorLegacyLabParams> {
  private aiTutorContext: AiTutorContext = {};

  protected getAiTutorContext(): AiTutorContext {
    return this.aiTutorContext;
  }

  setAiTutorContext({source}: AiTutorLegacyLabParams) {
    this.aiTutorContext = {
      sourceCode: source,
    };
  }
}
