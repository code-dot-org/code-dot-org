import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';
import modelsJson from '@cdo/static/aichat/modelDescriptions.json';

import type {ValueOf} from '../types/utils';

import type {ModelDescription, SaveType} from './types';

export const modelDescriptions: ModelDescription[] =
  modelsJson.filter(isValidDescription);

function isValidDescription(
  description: (typeof modelsJson)[number]
): description is ModelDescription {
  return Object.values(AiChatModelIds).includes(
    description.id as ValueOf<typeof AiChatModelIds>
  );
}

export const saveTypeToAnalyticsEvent: {[key in SaveType]: string} = {
  updateChatbot: EVENTS.UPDATE_CHATBOT,
  publishModelCard: EVENTS.PUBLISH_MODEL_CARD_INFO,
  saveModelCard: EVENTS.SAVE_MODEL_CARD_INFO,
};

export const MAX_NAME_LENGTH = 15;

export enum ModalTypes {
  WARNING = 'warning',
  TEACHER_ONBOARDING = 'teacherOnboarding',
}

export const RESET_CONVERSATION_CUSTOMIZATION_UPDATES = [
  'selectedModelId',
  'temperature',
  'systemPrompt',
  'retrievalContexts',
];

// Maximum number of files that can be attached to a chat message in multimodal mode.
export const MAX_NUM_FILES = 5;
export const MAX_FILE_SIZE_MB = 5;
// Allowed file types for upload in multimodal mode.
export const ACCEPTED_FILE_TYPES = ['.jpg', '.jpeg', '.png', '.pdf'];

export const FAQ_LINK =
  'https://support.code.org/hc/en-us/articles/30162711193741-AI-Chat-Lab-FAQ';
