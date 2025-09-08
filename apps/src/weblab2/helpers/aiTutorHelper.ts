import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

// Return additional context for AiTutor2.
const getAiTutor2Context = (
  source: MultiFileSource | undefined,
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

  const context = [
    'Here is my code:',
    sourceCode,
    'And here are the instructions:',
    longInstructions,
  ].join('\n\n');

  return context;
};

export default getAiTutor2Context;
