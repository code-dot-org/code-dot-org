import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext} from '@cdo/apps/aiTutor/types';

interface AiTutorLegacyLabParams {
  sourceCode?: string;
  longInstructions?: string;
}

export class AiTutorLegacyLabContextHelper extends AiTutorContextHelper<AiTutorLegacyLabParams> {
  private aiTutorContext: AiTutorContext = {};

  protected getAiTutorContext(): AiTutorContext {
    return this.aiTutorContext;
  }

  setAiTutorContext({sourceCode, longInstructions}: AiTutorLegacyLabParams) {
    this.aiTutorContext = {
      sourceCode,
      longInstructions,
    };
  }
}
