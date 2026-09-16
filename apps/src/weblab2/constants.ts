import {SUPPORTED_IMAGE_EXTENSIONS} from '../lab2/constants';

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

export const WEBLAB2_SUPPORTED_FILE_TYPES = WEBLAB2_EDITABLE_FILE_TYPES.concat(
  SUPPORTED_IMAGE_EXTENSIONS
);

export const AI_SAVED_COMMENT = 'AI***SAVE';

// The default set of answer types is all except buildJavaScript.
export const DEFAULT_ANSWER_TYPES: AiTutorAnswerType[] = [
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
];

// Map of our legacy modes to their corresponding answer types. This is used to populate the answer types for levels
// that were created with a legacy mode before we had answer types.
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

// Answer types offered in authoring mode (levelbuilder editing widget2
// sources). No hint/example/pseudocode: the tutor builds instead of teaching.
export const BUILDER_ANSWER_TYPES: AiTutorAnswerType[] = [
  'buildHTML',
  'buildCSS',
  'buildJavaScript',
  'buildJSON',
  'debug',
  'explainCode',
  'ask',
];

export const WEBLAB2_BUILDER_WELCOME_CHAT_MESSAGE =
  "You're editing a widget, so I'm in build mode.  Tell me what you want and I'll write the HTML, CSS or JavaScript for it.";

export const WEBLAB2_WELCOME_CHAT_MESSAGE =
  "Hi, I'm your AI Tutor! I can help you brainstorm, debug, and work through this level.";
