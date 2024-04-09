import {
  AiCustomizations,
  LevelAichatSettings,
  ModelCardInfo,
  Visibility,
} from '../../types';

export const MIN_TEMPERATURE = 0;
export const MAX_TEMPERATURE = 2;
export const SET_TEMPERATURE_STEP = 0.1;
export const MAX_RETRIEVAL_CONTEXTS = 20;
export const MAX_ASK_ABOUT_TOPICS = 10;

export const MODEL_CARD_FIELDS_LABELS_ICONS: [
  keyof ModelCardInfo,
  string,
  string
][] = [
  ['botName', 'Chatbot Name', ''],
  ['description', 'Description', 'memo'],
  ['intendedUse', 'Intended Use', 'bullseye-pointer'],
  ['limitationsAndWarnings', 'Limitations and Warnings', 'diamond-exclamation'],
  ['testingAndEvaluation', 'Testing and Evaluation', 'vial-circle-check'],
  ['exampleTopics', 'Example Prompts and Topics', 'message-lines'],
];

export const TECHNICAL_INFO_FIELDS = [
  'Model Name',
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
};

export const EMPTY_AI_CUSTOMIZATIONS: AiCustomizations = {
  temperature: 0.5,
  systemPrompt: '',
  retrievalContexts: [],
  modelCardInfo: EMPTY_MODEL_CARD_INFO,
};

export const DEFAULT_VISIBILITIES: {
  [key in keyof AiCustomizations]: Visibility;
} = {
  temperature: Visibility.EDITABLE,
  systemPrompt: Visibility.EDITABLE,
  retrievalContexts: Visibility.EDITABLE,
  modelCardInfo: Visibility.EDITABLE,
};

export const DEFAULT_LEVEL_AICHAT_SETTINGS: LevelAichatSettings = {
  initialCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  visibilities: DEFAULT_VISIBILITIES,
  hidePresentationPanel: false,
};

export const AI_CUSTOMIZATIONS_LABELS: {
  [key in keyof AiCustomizations]: string;
} = {
  temperature: 'Temperature',
  systemPrompt: 'System prompt',
  retrievalContexts: 'Retrieval',
  modelCardInfo: 'Model description',
};
