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

// Given a mode, return the corresponding prompt name. If the mode is not
// a possible mode, return the default prompt name.
export const getPromptNameFromMode = (mode: string | undefined) => {
  const prefix = 'weblab2-';
  let suffix = 'engineer';
  if (mode && MODES.includes(mode)) {
    suffix = mode;
  }
  suffix += '-structured';
  return `${prefix}${suffix}`;
};
