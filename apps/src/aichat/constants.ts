import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';
import modelsJson from '@cdo/static/aichat/modelDescriptions.json';

import type {ValueOf} from '../types/utils';

import type {ModelDescription, ModelParameters} from './types';

export const modelDescriptions: ModelDescription[] =
  modelsJson.filter(isValidDescription);

function isValidDescription(
  description: (typeof modelsJson)[number]
): description is ModelDescription {
  return Object.values(AiChatModelIds).includes(
    description.id as ValueOf<typeof AiChatModelIds>
  );
}

export const MAX_NAME_LENGTH = 15;

export const RESET_CONVERSATION_CUSTOMIZATION_UPDATES = [
  'selectedModelId',
  'temperature',
  'systemPrompt',
  'retrievalContexts',
];

// Maximum number of files that can be attached to a chat message in multimodal mode.
export const MAX_NUM_FILES = 5;
export const MAX_FILE_SIZE_MB = 5;

export const AI_SETTINGS_SUPPORT_LINK =
  'https://support.code.org/hc/en-us/articles/42550900593677-AI-Settings';

export const VERIFIED_TEACHER_SUPPORT_LINK =
  'https://support.code.org/hc/en-us/articles/115001550131-How-to-Become-a-Verified-Teacher';

export const AI_CHAT_NOT_AUTHORIZED_TEACHER =
  'You must be a verified teacher or sign in via Google, Microsoft, Facebook, or an LMS to use and assign this tool.';
export const AI_CHAT_NOT_AUTHORIZED_STUDENT =
  'Your teacher has not enabled this tool. Check with your teacher if you think this is an error.';

export const MODEL_PARAMETER_LABELS: {
  [key in keyof ModelParameters]: string;
} = {
  selectedModelId: 'Selected model',
  temperature: 'Temperature',
  systemPrompt: 'System prompt',
  retrievalContexts: 'Retrieval',
};
