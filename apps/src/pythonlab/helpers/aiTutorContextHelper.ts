import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {getFolderPath} from '@codebridge/utils';

import {tryFetchDocsForClass} from '@cdo/apps/aiTutor/docContextApi';
import {
  AiTutorContextHelper,
  MAX_CONSOLE_LINES,
} from '@cdo/apps/aiTutor/helpers/aiTutorContextHelper';
import {AiTutorContext} from '@cdo/apps/aiTutor/types';
import {stripAnsiSequences} from '@cdo/apps/codebridge/Console/MessageHelpers';
import {ProjectFile} from '@cdo/apps/codebridge/types';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import {studio} from '@cdo/apps/lib/util/urlHelpers';

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

const MAX_DATA_FILE_LINES = 50;
const DATA_FILE_EXTENSIONS = ['csv', 'json', 'txt'];
const LANGUAGES_TO_EXCLUDE_FROM_CONTEXT = ['md'];

const truncateDataFileContents = (name: string, contents: string): string => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (!ext || !DATA_FILE_EXTENSIONS.includes(ext)) return contents;
  const lines = contents.split('\n');
  if (lines.length <= MAX_DATA_FILE_LINES) return contents;
  return (
    lines.slice(0, MAX_DATA_FILE_LINES).join('\n') +
    `\n[truncated — ${lines.length - MAX_DATA_FILE_LINES} more rows not shown]`
  );
};

import PythonValidationTracker from '../progress/PythonValidationTracker';

interface AiTutorPythonLabParams {
  source: MultiFileSource | undefined;
  validationFile: ProjectFile | undefined;
  longInstructions: string | undefined;
  miniAppName: string | undefined;
  hasRun: boolean | undefined;
  hasEdited: boolean | undefined;
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

    const {source, validationFile, longInstructions, hasRun, hasEdited} =
      this.params;
    const sourceCode = source
      ? Object.values(source.files)
          .filter(file => {
            const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
            if (LANGUAGES_TO_EXCLUDE_FROM_CONTEXT.includes(ext)) return false;
            return (
              (file.type !== ProjectFileType.VALIDATION &&
                file.type !== ProjectFileType.SYSTEM_SUPPORT &&
                file.type !== ProjectFileType.SUPPORT) ||
              (file.type === ProjectFileType.SUPPORT && file.contents)
            );
          })
          .map(file => {
            const filePath = getFilePath(file, source.folders);
            let prefix = '';
            if (file.type === ProjectFileType.SUPPORT) {
              prefix = `${filePath} is not visible to the student: \n`;
            }

            const contents = truncateDataFileContents(
              file.name,
              file.contents ?? ''
            );
            return `${prefix}filename: ${filePath}\n${this.codeBlock(
              contents
            )}`;
          })
          .join('\n\n')
      : undefined;

    const validationContents = this.codeBlock(validationFile?.contents);

    const validationResults = JSON.stringify(
      PythonValidationTracker.getInstance().getValidationResults()
    );

    const documentation = await this.documentationPromise;

    const consoleLines = CodebridgeRegistry.getInstance()
      .getConsoleManager()
      ?.getTerminalLines()
      ?.slice(-MAX_CONSOLE_LINES)
      ?.map(line => stripAnsiSequences(line));
    const consoleOutput =
      consoleLines && consoleLines.length > 0
        ? this.codeBlock(consoleLines.join('\n'))
        : undefined;

    return {
      sourceCode,
      validationContents,
      validationResults,
      longInstructions,
      documentation,
      consoleOutput,
      hasRun,
      hasEdited,
    };
  }
}
