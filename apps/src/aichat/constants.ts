import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import modelsJson from '@cdo/static/aichat/modelDescriptions.json';

import {ModelDescription, SaveType} from './types';

export const modelDescriptions: ModelDescription[] = modelsJson;

export const saveTypeToAnalyticsEvent: {[key in SaveType]: string} = {
  updateChatbot: EVENTS.UPDATE_CHATBOT,
  publishModelCard: EVENTS.PUBLISH_MODEL_CARD_INFO,
  saveModelCard: EVENTS.SAVE_MODEL_CARD_INFO,
};

export const MAX_NAME_LENGTH = 15;
