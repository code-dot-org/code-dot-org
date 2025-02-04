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
    label: aichatI18n.modelCard_botNameHeader(),
    editTooltip: aichatI18n.modelCard_botNameEditTooltip(),
    displayTooltip: '',
  },
  {
    property: 'description',
    label: aichatI18n.modelCard_descriptionHeader(),
    icon: 'memo',
    editTooltip: aichatI18n.modelCard_descriptionEditTooltip(),
    displayTooltip: aichatI18n.modelCard_descriptionDisplayTooltip(),
  },
  {
    property: 'intendedUse',
    label: aichatI18n.modelCard_intendedUseHeader(),
    icon: 'bullseye-pointer',
    editTooltip: aichatI18n.modelCard_intendedUseEditTooltip(),
    displayTooltip: aichatI18n.modelCard_intendedUseDisplayTooltip(),
  },
  {
    property: 'limitationsAndWarnings',
    label: aichatI18n.modelCard_limitationsHeaader(),
    icon: 'diamond-exclamation',
    editTooltip: aichatI18n.modelCard_limitationsEditTooltip(),
    displayTooltip: aichatI18n.modelCard_limitationsDisplayTooltip(),
  },
  {
    property: 'testingAndEvaluation',
    label: aichatI18n.modelCard_testingHeader(),
    icon: 'vial-circle-check',
    editTooltip: aichatI18n.modelCard_testingEditTooltip(),
    displayTooltip: aichatI18n.modelCard_testingDisplayTooltip(),
  },
  {
    property: 'exampleTopics',
    label: aichatI18n.modelCard_exampleTopicsHeader(),
    icon: 'message-lines',
    editTooltip: aichatI18n.modelCard_exampleTopicsEditTooltip(),
    displayTooltip: aichatI18n.modelCard_exampleTopicsDisplayTooltip(),
  },
];

export const TECHNICAL_INFO_FIELDS = [
  aichatI18n.technicalInfoHeader_modelName(),
  aichatI18n.technicalInfoHeader_overview(),
  aichatI18n.technicalInfoHeader_trainingData(),
  aichatI18n.technicalInfoHeader_systemPrompt(),
  aichatI18n.technicalInfoHeader_temperature(),
  aichatI18n.technicalInfoHeader_retrievalUsed(),
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
  selectedModelId: aichatI18n.aiCustomizations_selectedModel(),
  temperature: aichatI18n.aiCustomizations_temperature(),
  systemPrompt: aichatI18n.aiCustomizations_systemPrompt(),
  retrievalContexts: aichatI18n.aiCustomizations_retrieval(),
  modelCardInfo: aichatI18n.aiCustomizations_modelCardInfo(),
};

// Model customization fields that are checked for toxicity before updating.
export const FIELDS_CHECKED_FOR_TOXICITY = [
  'systemPrompt',
  'retrievalContexts',
] as const satisfies (keyof AiCustomizations)[];
