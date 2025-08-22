import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

import {painterDocsMarkdown} from '../aiTutor/docs/painter.md.js';
import {ProjectFile} from '../codebridge/types';

import PythonValidationTracker from './progress/PythonValidationTracker';

// Return additional context for AiTutor2.
const getAiTutor2Context = (
  source: MultiFileSource | undefined,
  validationFile: ProjectFile | undefined,
  longInstructions: string | undefined,
  miniAppName: string | undefined
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

  const neighborhoodContext =
    miniAppName !== `neighborhood`
      ? []
      : [
          'Here is some documentation for the Neighborhood (Painter) API used in this lab (as markdown).  IMPORTANT - this documentaion is not readily available to the student.  Please assume the student is not looking at this documentation and provide helpful answers based on it.  If you want to reference it make sure the student knows how to view the documentation for the current level (it is available by clicking the documentation button above the code editor with the book icon):',
          painterDocsMarkdown,
        ];

  console.log('🤖: neighborhoodContext', neighborhoodContext);

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
    ...neighborhoodContext,
  ].join('\n\n');

  return context;
};

export default getAiTutor2Context;
