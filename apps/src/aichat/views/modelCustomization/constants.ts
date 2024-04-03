import {
  AiCustomizations,
  LevelAiCustomizations,
  ModelCardInfo,
  Visibility,
} from '../../types';

export const MIN_TEMPERATURE = 0;
export const MAX_TEMPERATURE = 2;
export const SET_TEMPERATURE_STEP = 0.1;
export const MAX_RETRIEVAL_CONTEXTS = 20;
export const MAX_ASK_ABOUT_TOPICS = 10;

export const MODEL_CARD_FIELDS_AND_LABELS: [keyof ModelCardInfo, string][] = [
  ['description', 'Description'],
  ['intendedUse', 'Intended Use'],
  ['limitationsAndWarnings', 'Limitations and Warnings'],
  ['testingAndEvaluation', 'Testing and Evaluation'],
  ['exampleTopics', 'Example Topics'],
];

export const EMPTY_MODEL_CARD_INFO: ModelCardInfo = {
  description: '',
  intendedUse: '',
  limitationsAndWarnings: '',
  testingAndEvaluation: '',
  exampleTopics: [],
};

export const EMPTY_AI_LEVEL_CUSTOMIZATIONS: LevelAiCustomizations = {
  botName: {value: '', visibility: Visibility.EDITABLE},
  temperature: {value: 0.5, visibility: Visibility.EDITABLE},
  systemPrompt: {value: '', visibility: Visibility.EDITABLE},
  retrievalContexts: {value: [], visibility: Visibility.EDITABLE},
  modelCardInfo: {
    value: EMPTY_MODEL_CARD_INFO,
    visibility: Visibility.EDITABLE,
  },
  hidePresentationPanel: false,
};

export const EMPTY_AI_CUSTOMIZATIONS: AiCustomizations = {
  botName: '',
  temperature: 0.5,
  systemPrompt: '',
  retrievalContexts: [],
  modelCardInfo: EMPTY_MODEL_CARD_INFO,
};

export const DEFAULT_VISIBILITIES: {
  [key in keyof AiCustomizations]: Visibility;
} = {
  botName: Visibility.EDITABLE,
  temperature: Visibility.EDITABLE,
  systemPrompt: Visibility.EDITABLE,
  retrievalContexts: Visibility.EDITABLE,
  modelCardInfo: Visibility.EDITABLE,
};
