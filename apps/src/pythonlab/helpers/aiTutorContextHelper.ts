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
  private documentationPromise?: Promise<string | undefined>;
  private aiTutorContent: AiTutorContext = {};

  protected async getAiTutorContext(): Promise<AiTutorContext> {
    return {
      ...this.aiTutorContent,
      documentation: await this.documentationPromise,
    };
  }

  setAiTutorContext({
    source,
    validationFile,
    longInstructions,
    miniAppName,
  }: AiTutorPythonLabParams) {
    const sourceCode = source
      ? Object.entries(source.files)
          .filter(
            ([_, file]) =>
              (file.type !== ProjectFileType.VALIDATION &&
                file.type !== ProjectFileType.SYSTEM_SUPPORT &&
                file.type !== ProjectFileType.SUPPORT) ||
              (file.type === ProjectFileType.SUPPORT && file.contents)
          )
          .map(([_, file]) => {
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

    this.documentationPromise =
      miniAppName === 'neighborhood'
        ? tryFetchDocsForClass('painter')
        : undefined;

    this.aiTutorContent = {
      sourceCode,
      validationContents,
      validationResults,
      longInstructions,
    };
  }
}
