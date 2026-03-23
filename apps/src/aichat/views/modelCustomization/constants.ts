import {modelDescriptions} from '@cdo/apps/aichat/constants';

import aichatI18n from '../../locale';
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

export const MODEL_CARD_FIELDS_LABELS_ICONS: {
  property: keyof ModelCardInfo;
  label: string;
  icon?: string;
  editTooltip: string;
  displayTooltip: string;
}[] = [
  {
    property: 'botName',
    label: 'botName',
    editTooltip: 'botNameTooltip',
    displayTooltip: '',
  },
  {
    property: 'description',
    label: 'description',
    icon: 'memo',
    editTooltip:'descriptionTooltip'
    displayTooltip: '',
  },
  {
    property: 'intendedUse',
    label: 'intendedUse',
    icon: 'bullseye-pointer',
    editTooltip: 'intendedUseTooltip',
    displayTooltip: 'intendedUseDisplayTooltip',
  },
  {
    property: 'limitationsAndWarnings',
    label: 'limitationsAndWarnings',
    icon: 'diamond-exclamation',
    editTooltip: 'limitationsAndWarningsTooltip',
    displayTooltip: 'limitationsAndWarningsDisplayTooltip',
  },
  {
    property: 'testingAndEvaluation',
    label: 'testingAndEvaluation',
    icon: 'vial-circle-check',
    editTooltip: 'testingAndEvaluationTooltip',
    displayTooltip: 'testingAndEvaluationDisplayTooltip',
  },
  {
    property: 'exampleTopics',
    label: 'exampleTopics',
    icon: 'message-lines',
    editTooltip: 'exampleTopicsTooltip',
    displayTooltip: 'exampleTopicsDisplayTooltip',
  },
];

export const TECHNICAL_INFO_FIELDS = [
  'modelName',
  'overview',
  'trainingData',
  'systemPrompt',
  'temperature',
  'retrievalUsed',
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
  levelSystemPrompt: '',
  hidePresentationPanel: false,
  availableModelIds: [modelDescriptions[0].id],
};

export const AI_CUSTOMIZATIONS_LABELS: {
  [key in keyof AiCustomizations]: string;
} = {
  selectedModelId: 'selectedModelId',
  temperature: 'temperature',
  systemPrompt: 'systemPrompt',
  retrievalContexts: 'retrievalContexts',
  modelCardInfo: 'modelCardInfo',
};

// Model customization fields that are checked for toxicity before updating.
export const FIELDS_CHECKED_FOR_TOXICITY = [
  'systemPrompt',
  'retrievalContexts',
] as const satisfies (keyof AiCustomizations)[];
