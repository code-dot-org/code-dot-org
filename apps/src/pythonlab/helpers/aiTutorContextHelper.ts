import {tryFetchDocsForClass} from '@cdo/apps/aiTutor/docContextApi';
import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext} from '@cdo/apps/aiTutor/types';
import {ProjectFile} from '@cdo/apps/codebridge/types';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

import PythonValidationTracker from '../progress/PythonValidationTracker';

interface AiTutorPythonLabParams {
  source: MultiFileSource | undefined;
  validationFile: ProjectFile | undefined;
  longInstructions: string | undefined;
  miniAppName: string | undefined;
}
export class AiTutorPythonLabContextHelper extends AiTutorContextHelper<AiTutorPythonLabParams> {
  private aiTutorContext: AiTutorContext = {};
  private params?: AiTutorPythonLabParams;

  protected override getAiTutorContext(): AiTutorContext {
    return this.aiTutorContext;
  }

  override setAiTutorContext(params: AiTutorPythonLabParams): void {
    this.params = params;
  }

  protected override async formatAiTutorContext() {
    if (!this.params) return;

    const {source, validationFile, longInstructions, miniAppName} = this.params;
    const sourceCode = source
      ? Object.values(source.files)
          .filter(
            file =>
              (file.type !== ProjectFileType.VALIDATION &&
                file.type !== ProjectFileType.SYSTEM_SUPPORT &&
                file.type !== ProjectFileType.SUPPORT) ||
              (file.type === ProjectFileType.SUPPORT && file.contents)
          )
          .map(file => {
            let prefix = '';
            if (file.type === ProjectFileType.SUPPORT) {
              prefix = `${file.name} is not visible to the student: \n`;
            }

            return `${prefix}filename: ${file.name}\n\`\`\`${file.contents}\`\`\``;
          })
          .join('\n\n')
      : undefined;

    const validationContents = validationFile?.contents;

    const validationResults = JSON.stringify(
      PythonValidationTracker.getInstance().getValidationResults()
    );

    const documentation =
      miniAppName === 'neighborhood'
        ? await tryFetchDocsForClass('painter')
        : undefined;

    this.aiTutorContext = {
      sourceCode,
      validationContents,
      validationResults,
      longInstructions,
      documentation,
    };
  }
}
