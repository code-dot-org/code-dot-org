import experiments from '@cdo/apps/util/experiments';

export const DEFAULT_AI_TUTOR_MODE = 'engineer';

const MODES = [
  'suggest',
  'outline',
  'guide',
  'produce',
  'designer',
  'tutor',
  'engineer',
  'qa',
];

export const getPromptNameFromMode = (mode: string | undefined) => {
  if (experiments.isEnabled(experiments.USE_LANGFUSE_PROMPT)) {
    return getLangfusePromptNameFromMode(mode);
  } else {
    return getOriginalPromptNameFromMode(mode);
  }
};

// Given a mode, return the corresponding prompt name. If the mode is not
// a possible mode, return the default prompt name.
export const getOriginalPromptNameFromMode = (mode: string | undefined) => {
  const prefix = 'weblab2-';
  let suffix = DEFAULT_AI_TUTOR_MODE;
  if (mode && MODES.includes(mode)) {
    suffix = mode;
  }
  suffix += '-structured';
  return `${prefix}${suffix}`;
};

const LANGFUSE_MODES = ['engineer', 'designer', 'tutor', 'qa', 'debug'];

export const getLangfusePromptNameFromMode = (mode: string | undefined) => {
  const prefix = 'modes/';
  let suffix = DEFAULT_AI_TUTOR_MODE;
  if (mode && LANGFUSE_MODES.includes(mode)) {
    suffix = mode;
  }
  return `${prefix}${suffix}`;
};
