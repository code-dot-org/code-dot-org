import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

import {ProjectFile} from '../codebridge/types';

import PythonValidationTracker from './progress/PythonValidationTracker';

// Return additional context for AiTutor2.
const getAiTutor2Context = (
  source: MultiFileSource | undefined,
  validationFile: ProjectFile | undefined,
  longInstructions: string | undefined
) => {
  if (!source) {
    return '';
  }

  const sourceCode = Object.entries(source.files)
    .filter(
      ([_, file]) =>
        file.type !== ProjectFileType.VALIDATION &&
        file.type !== ProjectFileType.SYSTEM_SUPPORT
    )
    .map(([_, file]) => file.contents)
    .join('\n');

  const validationContents = validationFile?.contents;

  const validationResults = JSON.stringify(
    PythonValidationTracker.getInstance().getValidationResults()
  );

  const context = [
    'Here is my code:',
    sourceCode,
    ...(validationContents
      ? ['Here is the validation code:', validationContents]
      : []),
    ...(validationResults
      ? [
          'Here are the validation test names along with their results, in JSON:',
          validationResults,
        ]
      : []),
    'And here are the instructions:',
    longInstructions,
  ].join('\n\n');

  return context;
};

export default getAiTutor2Context;
