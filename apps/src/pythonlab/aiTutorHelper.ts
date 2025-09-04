import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

import {fetchDocsForClass} from '../aiTutor/docContextApi';
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
            file.type !== ProjectFileType.VALIDATION &&
            file.type !== ProjectFileType.SYSTEM_SUPPORT
        )
        .map(([_, file]) => file.contents)
        .join('\n')
    : undefined;

  const validationContents = validationFile?.contents;

  const validationResults = JSON.stringify(
    PythonValidationTracker.getInstance().getValidationResults()
  );

  const documentation =
    miniAppName === 'neighborhood'
      ? await fetchDocsForClass('painter')
      : undefined;

  return {
    sourceCode,
    validationContents,
    validationResults,
    longInstructions,
    documentation,
  };
};

// TODO: change the location of this to somewher emore generic, and update the wording -> system prompt
export const buildHiddenContextString = (context: AiTutorContext) => {
  const {
    sourceCode,
    validationContents,
    validationResults,
    longInstructions,
    documentation,
  } = context;

  const hiddenContextString = [
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
    'And here is the documentation:',
    documentation,
  ].join('\n\n');

  console.log(`🤖: hiddenContextString:`, hiddenContextString);

  return hiddenContextString;
};

export default getAiTutorContextPromise;
