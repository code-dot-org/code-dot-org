export const DEFAULT_AI_TUTOR_MODE = 'suggest';

const MODES = ['suggest', 'outline', 'guide', 'produce'];

// Given a mode, return the corresponding prompt name. If the mode is not
// a possible mode, return the default prompt name.
export const getPromptNameFromMode = (mode: string | undefined) => {
  const prefix = 'weblab2-';
  let suffix = 'suggest';
  if (mode && MODES.includes(mode)) {
    suffix = mode;
  }
  suffix += '-structured';
  return `${prefix}${suffix}`;
};
