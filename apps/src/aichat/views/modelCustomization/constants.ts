import {Visibility} from '../../types';

export const DEFAULT_RETRIEVAL_CONTEXTS = {
  value: [],
  visibility: Visibility.EDITABLE,
};

export const DEFAULT_MODEL_CARD_INFO = {
  value: {
    description: '',
    intendedUse: '',
    limitationsAndWarnings: '',
    testingAndEvaluation: '',
    askAboutTopics: '',
  },
  visibility: Visibility.EDITABLE,
};

export const DEFAULT_PROMPT_CUSTOMIZATIONS = {
  botName: {value: '', visibility: Visibility.EDITABLE},
  temperature: {value: 0.5, visibility: Visibility.EDITABLE},
  systemPrompt: {value: '', visibility: Visibility.EDITABLE},
};
