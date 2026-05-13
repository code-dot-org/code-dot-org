import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext} from '@cdo/apps/aiTutor/types';
import {ProjectSources} from '@cdo/apps/lab2/types';

interface AiTutorSketchLabParams {
  sources: ProjectSources;
  longInstructions: string | undefined;
  hasRun: boolean | undefined;
}

export class AiTutorSketchLabContextHelper extends AiTutorContextHelper<AiTutorSketchLabParams> {
  private params?: AiTutorSketchLabParams;

  override setAiTutorContext(params: AiTutorSketchLabParams): void {
    this.params = params;
  }

  protected override getAiTutorContext(): AiTutorContext {
    if (!this.params) {
      return {};
    }

    const {sources, longInstructions, hasRun} = this.params;

    return {
      sourceCode: this.codeBlock(JSON.stringify(sources.source, null, 2)),
      longInstructions,
      hasRun,
      hasEdited: false,
    };
  }
}
