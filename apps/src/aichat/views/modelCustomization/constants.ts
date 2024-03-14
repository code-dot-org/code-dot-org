import {
  AiCustomizations,
  LevelAiCustomizations,
  ModelCardInfo,
  Visibility,
} from '../../types';

export const MIN_TEMPERATURE = 0;
export const MAX_TEMPERATURE = 2;
export const MAX_RETRIEVAL_CONTEXTS = 20;
export const MAX_ASK_ABOUT_TOPICS = 10;

export const MODEL_CARD_FIELDS_AND_LABELS: [keyof ModelCardInfo, string][] = [
  ['description', 'Description'],
  ['intendedUse', 'Intended Use'],
  ['limitationsAndWarnings', 'Limitations and Warnings'],
  ['testingAndEvaluation', 'Testing and Evaluation'],
];

export const EMPTY_MODEL_CARD_INFO: ModelCardInfo = {
  description: '',
  intendedUse: '',
  limitationsAndWarnings: '',
  testingAndEvaluation: '',
  exampleTopics: [],
};

export const EMPTY_AI_CUSTOMIZATIONS: AiCustomizations = {
  botName: '',
  temperature: 0.5,
  systemPrompt: '',
  retrievalContexts: [],
  modelCardInfo: EMPTY_MODEL_CARD_INFO,
};

const emptyAiCustomizationsWithVisibility = {};
for (const [key, value] of Object.entries(EMPTY_AI_CUSTOMIZATIONS)) {
  emptyAiCustomizationsWithVisibility[key] = {
    value: value,
    visibility: Visibility.EDITABLE,
  };
}

export const EMPTY_AI_CUSTOMIZATIONS_WITH_VISIBILITY: LevelAiCustomizations = {
  ...emptyAiCustomizationsWithVisibility,
  hidePresentationPanel: false,
};
