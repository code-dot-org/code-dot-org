import {AiTutorContext} from '@cdo/apps/aiTutor/types';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

// Return additional context for AiTutor2.
export const getAiTutorContextPromise = (
  source: MultiFileSource | undefined,
  longInstructions: string | undefined
): Promise<AiTutorContext> => {
  if (!source) {
    return Promise.resolve({});
  }

  const sourceCode = Object.entries(source.files)
    .filter(
      ([_, file]) =>
        file.type !== ProjectFileType.VALIDATION &&
        file.type !== ProjectFileType.SYSTEM_SUPPORT
    )
    .map(([_, file]) => file.contents)
    .join('\n');

  return Promise.resolve({
    sourceCode,
    longInstructions,
  });
};
