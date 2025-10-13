import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';

import weblab2I18n from '@cdo/apps/weblab2/locale';

export const DEFAULT_AI_TUTOR_MODE = 'suggest';

const MODE_MAP = {
  suggest: {displayName: weblab2I18n.suggest(), iconName: 'comment-dots'},
  outline: {displayName: weblab2I18n.outline(), iconName: 'diagram-project'},
  guide: {displayName: weblab2I18n.guide(), iconName: 'compass'},
  produce: {displayName: weblab2I18n.produce(), iconName: 'hammer'},
};

// Given a mode, return the corresponding prompt name. If the mode is not
// a possible mode, return the default prompt name.
export const getPromptNameFromMode = (mode: string | undefined) => {
  const prefix = 'weblab2-';
  let suffix = 'suggest';
  if (mode && Object.keys(MODE_MAP).includes(mode)) {
    suffix = mode;
  }
  return `${prefix}${suffix}`;
};

// Given a list of modes, return the corresponding system prompt options.
// Any mode in the list that is not a valid mode will be ignored.
// If there are no valid modes in the list, return a single option with the
// default mode.
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
  const result = options.filter(Boolean) as {
    displayName: string;
    icon: FontAwesomeV6IconProps;
    promptName: string;
  }[];
  if (result.length === 0) {
    result.push({
      displayName: MODE_MAP.suggest.displayName,
      icon: {iconName: MODE_MAP.suggest.iconName},
      promptName: 'weblab2-suggest',
    });
  }
  return result;
};
