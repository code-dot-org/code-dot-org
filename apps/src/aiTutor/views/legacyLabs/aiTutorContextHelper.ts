import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext} from '@cdo/apps/aiTutor/types';
import {studio} from '@cdo/apps/lib/util/urlHelpers';

import {AI_TUTOR_LABS} from './constants';

export interface AiTutorLegacyLabParams {
  sourceCode?: string;
  hiddenSourceCode?: string;
  readOnlySourceCode?: string;
  longInstructions?: string;
  labType?: string;
}

export class AiTutorLegacyLabContextHelper extends AiTutorContextHelper<AiTutorLegacyLabParams> {
  private aiTutorContext: AiTutorContext = {};

  protected getAiTutorContext(): AiTutorContext {
    return this.aiTutorContext;
  }

  setAiTutorContext({
    sourceCode,
    hiddenSourceCode,
    readOnlySourceCode,
    longInstructions,
    labType,
  }: AiTutorLegacyLabParams) {
    this.setLabDocumentationLocation(labType);
    this.aiTutorContext = {
      sourceCode,
      hiddenSourceCode,
      readOnlySourceCode,
      longInstructions,
    };
  }

  setLabDocumentationLocation(labType?: string) {
    if (labType && AI_TUTOR_LABS.includes(labType)) {
      this.documentationLocation = studio(`/docs/ide/${labType}`);
    }
  }
}
