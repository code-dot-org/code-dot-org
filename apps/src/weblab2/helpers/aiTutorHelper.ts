import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {AiTutorContext} from '@cdo/apps/aiTutor/types';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import weblab2I18n from '@cdo/apps/weblab2/locale';

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

export const DEFAULT_AI_TUTOR_MODE = 'suggest';

const MODE_MAP = {
  suggest: {displayName: weblab2I18n.suggest(), iconName: 'comment-dots'},
  outline: {displayName: weblab2I18n.outline(), iconName: 'diagram-project'},
  guide: {displayName: weblab2I18n.guide(), iconName: 'compass'},
  produce: {displayName: weblab2I18n.produce(), iconName: 'hammer'},
};

export const getPromptNameFromMode = (mode: string | undefined) => {
  const prefix = 'weblab2-';
  let suffix = 'suggest';
  if (mode && Object.keys(MODE_MAP).includes(mode)) {
    suffix = mode;
  }
  return `${prefix}${suffix}`;
};

export const getPromptOptionsFromModes = (modes: string[]) => {
  const possibleModes = Object.keys(MODE_MAP);
  const options = modes.map(mode => {
    if (possibleModes.includes(mode)) {
      return {
        displayName: MODE_MAP[mode as keyof typeof MODE_MAP].displayName,
        icon: {iconName: MODE_MAP[mode as keyof typeof MODE_MAP].iconName},
        promptName: `weblab2-${mode}`,
      };
    }
  });
  return options.filter(Boolean) as {
    displayName: string;
    icon: FontAwesomeV6IconProps;
    promptName: string;
  }[];
};
