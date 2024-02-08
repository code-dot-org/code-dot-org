export const AudioErrorType = {
  NONE: 'none',
  INITIALIZE: 'initialize',
  SAVE: 'save',
};
export const ImageMode = {
  FILE: 'file',
  ICON: 'icon',
  URL: 'url',
  DEFAULT: 'default',
};

export const errorMessages = {
  403: 'Quota exceeded. Please delete some files and try again.',
  413: 'The file is too large.',
  415: 'This type of file is not supported.',
  500: 'The server responded with an error.',
  unknown: 'An unknown error occurred.',
};

export const errorUploadDisabled =
  'This project has been reported for abusive content, ' +
  'so uploading new assets is disabled.';
