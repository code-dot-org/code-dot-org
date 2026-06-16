import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {getFolderPath} from '@codebridge/utils';

import {AiTutorContextHelper} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext} from '@cdo/apps/aiTutor/types';
import {
  MultiFileSource,
  ProjectFile,
  ProjectFileType,
} from '@cdo/apps/lab2/types';
import {getFileExtension} from '@cdo/apps/lab2/utils/multiFileSourceUtils';

interface AiTutorWebLab2Params {
  source: MultiFileSource | undefined;
  longInstructions: string | undefined;
  hasEdited: boolean | undefined;
  hasRun: boolean | undefined;
}

const LANGUAGES_TO_EXCLUDE_FROM_CONTEXT = ['txt', 'csv', 'md'];

// Returns the file path used in HTML src/href attributes.
const getFilePath = (
  file: ProjectFile,
  folders: MultiFileSource['folders']
): string => {
  if (file.folderId === DEFAULT_FOLDER_ID) {
    return file.name;
  }
  const folderPath = getFolderPath(file.folderId, folders);
  return `${folderPath}/${file.name}`;
};

export class AiTutorWebLab2ContextHelper extends AiTutorContextHelper<AiTutorWebLab2Params> {
  private params?: AiTutorWebLab2Params;

  override setAiTutorContext(params: AiTutorWebLab2Params): void {
    this.params = params;
  }

  protected override getAiTutorContext(): AiTutorContext {
    if (!this.params) return {};

    const {source, longInstructions, hasEdited, hasRun} = this.params;
    const sourceCode = source
      ? Object.values(source.files)
          .filter(
            file =>
              file.type !== ProjectFileType.VALIDATION &&
              file.type !== ProjectFileType.SYSTEM_SUPPORT &&
              !LANGUAGES_TO_EXCLUDE_FROM_CONTEXT.includes(
                getFileExtension(file.name)
              )
          )
          .map(file => {
            const filePath = getFilePath(file, source.folders);
            // Image/binary files are stored as asset URLs with no text contents.
            if (file.url) {
              return `image: ${filePath}`;
            }
            return `filename: ${filePath}\n${this.codeBlock(file.contents)}`;
          })
          .join('\n\n')
      : undefined;

    return {
      sourceCode,
      longInstructions,
      hasEdited,
      hasRun,
    };
  }
}
