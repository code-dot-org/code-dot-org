import {AiTutorMode, AiTutorAnswerType} from './types';

export const WEBLAB2_EDITABLE_FILE_TYPES = [
  'html',
  'css',
  'js',
  'md',
  'txt',
  'csv',
  'json',
];

export const WEBLAB2_IMAGE_FILE_TYPES = ['jpg', 'jpeg', 'png', 'gif'];

export const WEBLAB2_SUPPORTED_FILE_TYPES = WEBLAB2_EDITABLE_FILE_TYPES.concat(
  WEBLAB2_IMAGE_FILE_TYPES
);

export const AI_SAVED_COMMENT = 'AI***SAVE';

export const TUTOR_MODE_TO_ANSWER_TYPE: Record<
  AiTutorMode,
  AiTutorAnswerType[]
> = {
  suggest: [
    'buildHTML',
    'buildCSS',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
    'pseudocode',
  ],
  outline: [
    'buildHTML',
    'buildCSS',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
    'pseudocode',
  ],
  guide: [
    'buildHTML',
    'buildCSS',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
    'pseudocode',
  ],
  produce: [
    'buildHTML',
    'buildCSS',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
  ],
  designer: [
    'buildHTML',
    'buildCSS',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
  ],
  tutor: [
    'buildHTML',
    'buildCSS',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
    'pseudocode',
  ],
  engineer: [
    'buildHTML',
    'buildCSS',
    'buildJavaScript',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
    'pseudocode',
  ],
  qa: [
    'buildHTML',
    'buildCSS',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
    'pseudocode',
    'testCase',
  ],
};
