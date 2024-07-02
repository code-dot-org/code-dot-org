import {modelDescriptions} from '@cdo/apps/aichat/constants';

import {
  AiCustomizations,
  LevelAichatSettings,
  ModelCardInfo,
  Visibility,
} from '../../types';

export const MIN_TEMPERATURE = 0.1;
export const MAX_TEMPERATURE = 1;
export const SET_TEMPERATURE_STEP = 0.1;
export const MAX_RETRIEVAL_CONTEXTS = 20;
export const MAX_ASK_ABOUT_TOPICS = 10;

export const MODEL_CARD_FIELDS_LABELS_ICONS: [
  key: keyof ModelCardInfo,
  label: string,
  icon: string,
  editTooltip: string,
  displayTooltip: string
][] = [
  ['botName', 'Chatbot Name', '', 'Give your chatbot a unique name.', ''],
  [
    'description',
    'Description',
    'memo',
    'Write a brief description of your chatbot, such as how it works and the problem it was created to solve.',
    'A brief description of this chatbot.',
  ],
  [
    'intendedUse',
    'Intended Use',
    'bullseye-pointer',
    'Describe how the chatbot is intended to be used, such as what specific topics or questions it can answer.',
    'How the chatbot was designed to be used. Similar to an instruction manual.',
  ],
  [
    'limitationsAndWarnings',
    'Limitations and Warnings',
    'diamond-exclamation',
    'Describe any limitations the chatbot has when responding. Describe any warnings or cautions for the user to consider.',
    'Any limitations the chatbot has, or any warnings to consider when using the chatbot. Similar to safety information on a chatbot.',
  ],
  [
    'testingAndEvaluation',
    'Testing and Evaluation',
    'vial-circle-check',
    'Describe how you tested the chatbot to ensure it was ready for users and would perform as expected.',
    'How the chatbot was tested before being published for general use.',
  ],
  [
    'exampleTopics',
    'Example Prompts and Topics',
    'message-lines',
    'Add example prompts the user could consider when using the chatbot',
    'Try some of these example prompts to get started.',
  ],
];

export const TECHNICAL_INFO_FIELDS = [
  'Model Name',
  'Overview',
  'Training Data',
  'System Prompt',
  'Temperature',
  'Retrieval Used',
] as const;

export const EMPTY_MODEL_CARD_INFO: ModelCardInfo = {
  botName: '',
  description: '',
  intendedUse: '',
  limitationsAndWarnings: '',
  testingAndEvaluation: '',
  exampleTopics: [],
  isPublished: false,
};

export const EMPTY_AI_CUSTOMIZATIONS: AiCustomizations = {
  selectedModelId: modelDescriptions[0].id,
  temperature: 0.5,
  systemPrompt: '',
  retrievalContexts: [],
  modelCardInfo: EMPTY_MODEL_CARD_INFO,
};

export const DEFAULT_VISIBILITIES: {
  [key in keyof AiCustomizations]: Visibility;
} = {
  selectedModelId: Visibility.READONLY,
  temperature: Visibility.EDITABLE,
  systemPrompt: Visibility.EDITABLE,
  retrievalContexts: Visibility.EDITABLE,
  modelCardInfo: Visibility.EDITABLE,
};

export const DEFAULT_LEVEL_AICHAT_SETTINGS: LevelAichatSettings = {
  initialCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  visibilities: DEFAULT_VISIBILITIES,
  hidePresentationPanel: false,
  availableModelIds: [modelDescriptions[0].id],
};

export const AI_CUSTOMIZATIONS_LABELS: {
  [key in keyof AiCustomizations]: string;
} = {
  selectedModelId: 'Selected model',
  temperature: 'Temperature',
  systemPrompt: 'System prompt',
  retrievalContexts: 'Retrieval',
  modelCardInfo: 'Model card information',
};
