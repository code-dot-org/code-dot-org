import {
  preFetchDocsForClass,
  tryFetchDocsForClass,
} from '@cdo/apps/aiTutor/docContextApi';
import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext} from '@cdo/apps/aiTutor/types';
import {ProjectFile} from '@cdo/apps/codebridge/types';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

import PythonValidationTracker from '../progress/PythonValidationTracker';

interface AiTutorPythonLabParams {
  source?: MultiFileSource;
  validationFile?: ProjectFile;
  longInstructions?: string;
  miniAppName?: string;
}
export class AiTutorPythonLabContextHelper extends AiTutorContextHelper<AiTutorPythonLabParams> {
  params: AiTutorPythonLabParams = {};

  override async setAiTutorContext(
    params: AiTutorPythonLabParams
  ): Promise<void> {
    if (params.miniAppName === 'neighborhood') {
      // Prefetch painter docs so they are ready immediately when user interacts with tutor.
      await preFetchDocsForClass('painter');
    }

    super.setAiTutorContext(params);
  }

  protected override async getAiTutorContext(): Promise<AiTutorContext> {
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

    return {
      sourceCode,
      validationContents,
      validationResults,
      longInstructions,
      documentation,
    };
  }
}
