import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

import {ProjectFile} from '../codebridge/types';

import PythonValidationTracker from './progress/PythonValidationTracker';

// Given a question for the AITutor2, return the full question to ask, which means
// appending all the relevant context.
const getAiTutor2FullPromptFromData = (
  question: string,
  source: MultiFileSource,
  validationFile: ProjectFile | undefined,
  longInstructions: string | undefined
) => {
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

  const fullQuestion = [
    question,
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

  return fullQuestion;
};

export default getAiTutor2FullPromptFromData;
