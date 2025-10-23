import {tryFetchDocsForClass} from '@cdo/apps/aiTutor/docContextApi';
import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext} from '@cdo/apps/aiTutor/types';
import {ProjectFile} from '@cdo/apps/codebridge/types';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import {studio} from '@cdo/apps/lib/util/urlHelpers';

import PythonValidationTracker from '../progress/PythonValidationTracker';

interface AiTutorPythonLabParams {
  source: MultiFileSource | undefined;
  validationFile: ProjectFile | undefined;
  longInstructions: string | undefined;
  miniAppName: string | undefined;
}
export class AiTutorPythonLabContextHelper extends AiTutorContextHelper<AiTutorPythonLabParams> {
  private documentationPromise?: Promise<string | undefined>;
  private params?: AiTutorPythonLabParams;
  protected override documentationLocation: string = studio(
    '/docs/ide/pythonlab'
  );

  override setAiTutorContext(params: AiTutorPythonLabParams): void {
    this.params = params;
    if (
      this.params.miniAppName &&
      this.params.miniAppName === 'neighborhood' &&
      !this.documentationPromise
    ) {
      this.documentationPromise = tryFetchDocsForClass('painter');
    }
  }

  protected override async getAiTutorContext(): Promise<AiTutorContext> {
    if (!this.params) return {};

    const {source, validationFile, longInstructions} = this.params;
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

            return `${prefix}filename: ${file.name}\n${this.codeBlock(
              file.contents
            )}`;
          })
          .join('\n\n')
      : undefined;

    const validationContents = this.codeBlock(validationFile?.contents);

    const validationResults = JSON.stringify(
      PythonValidationTracker.getInstance().getValidationResults()
    );

    const documentation = await this.documentationPromise;

    return {
      sourceCode,
      validationContents,
      validationResults,
      longInstructions,
      documentation,
    };
  }
}
