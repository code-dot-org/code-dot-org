import {describeSourceFiles} from '@codebridge/utils/describeSourceFiles';

import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext} from '@cdo/apps/aiTutor/types';
import {MultiFileSource} from '@cdo/apps/lab2/types';

interface AiTutorWebLab2Params {
  source: MultiFileSource | undefined;
  longInstructions: string | undefined;
  hasEdited: boolean | undefined;
  hasRun: boolean | undefined;
}

const LANGUAGES_TO_EXCLUDE_FROM_CONTEXT = ['txt', 'csv', 'md'];
export class AiTutorWebLab2ContextHelper extends AiTutorContextHelper<AiTutorWebLab2Params> {
  private params?: AiTutorWebLab2Params;

  override setAiTutorContext(params: AiTutorWebLab2Params): void {
    this.params = params;
  }

  protected override getAiTutorContext(): AiTutorContext {
    if (!this.params) return {};

    const {source, longInstructions, hasEdited, hasRun} = this.params;
    const sourceCode = source
      ? describeSourceFiles(source, {
          excludeExtensions: LANGUAGES_TO_EXCLUDE_FROM_CONTEXT,
        })
      : undefined;

    return {
      sourceCode,
      longInstructions,
      hasEdited,
      hasRun,
    };
  }
}
