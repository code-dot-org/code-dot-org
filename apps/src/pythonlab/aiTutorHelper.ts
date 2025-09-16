import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

import {tryFetchDocsForClass} from '../aiTutor/docContextApi';
import {AiTutorContext} from '../aiTutor/types.js';
import {ProjectFile} from '../codebridge/types';

import PythonValidationTracker from './progress/PythonValidationTracker';

// Return additional context for AiTutor2.
export const getAiTutorContextPromise = async (
  source: MultiFileSource | undefined,
  validationFile: ProjectFile | undefined,
  longInstructions: string | undefined,
  miniAppName: string | undefined
): Promise<AiTutorContext> => {
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
};

export const buildHiddenContextString = (context: AiTutorContext) => {
  const {
    sourceCode,
    validationContents,
    validationResults,
    longInstructions,
    documentation,
  } = context;

  const hiddenContextString = [
    "Here is the student's current code:",
    sourceCode,
    ...(validationContents
      ? ['Here is the validation code:', `\`\`\`${validationContents}\`\`\``]
      : []),
    ...(validationResults
      ? [
          'Here are the validation test names along with their results, in JSON:',
          validationResults,
        ]
      : []),
    ...(longInstructions
      ? ['Here are the instructions:', longInstructions]
      : []),
    ...(documentation
      ? [
          'Here is the documentation. (The student can view the documentation by clicking the book icon at the top of the workspace.):',
          documentation,
        ]
      : []),
  ].join('\n\n');

  return hiddenContextString;
};

export default getAiTutorContextPromise;
