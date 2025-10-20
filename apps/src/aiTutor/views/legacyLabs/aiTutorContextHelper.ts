import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext} from '@cdo/apps/aiTutor/types';

export interface AiTutorLegacyLabParams {
  sourceCode?: string;
  hiddenSourceCode?: string;
  longInstructions?: string;
}

export class AiTutorLegacyLabContextHelper extends AiTutorContextHelper<AiTutorLegacyLabParams> {
  private aiTutorContext: AiTutorContext = {};

  protected getAiTutorContext(): AiTutorContext {
    return this.aiTutorContext;
  }

  setAiTutorContext({
    sourceCode,
    hiddenSourceCode,
    longInstructions,
  }: AiTutorLegacyLabParams) {
    this.aiTutorContext = {
      sourceCode,
      hiddenSourceCode,
      longInstructions,
    };
  }
}
