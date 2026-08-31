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
export const AI_CHAT_LAB_FAQ_LINK =
  'https://support.code.org/hc/en-us/articles/30162711193741-AI-Chat-Lab-FAQ';
export const AI_TUTOR_FAQ_LINK =
  'https://support.code.org/hc/en-us/articles/40542019587213-AI-Tutor-FAQ';

export const AI_CHAT_NOT_AUTHORIZED_TEACHER =
  'You must be a verified teacher or sign in via Google, Microsoft, Facebook, or an LMS to use and assign this tool.';
export const AI_CHAT_NOT_AUTHORIZED_STUDENT =
  'Your teacher has not enabled this tool. Check with your teacher if you think this is an error.';
export const AI_CHAT_NOT_AVAILABLE_INTERNATIONAL =
  'This AI Chat level is not available in your region.';
export const AI_TUTOR_NOT_AVAILABLE_INTERNATIONAL =
  'AI Tutor is not available in your region.';
// Shown in Teacher Dashboard AI Settings when the teacher's region blocks
// Gemini models. Settings still apply to levels using other models.
// A course with unaffected units left: name the affected ones so the teacher
// knows the rest of the course is still usable.
export const usOnlyModelsCourseUnits = (
  unitTitles: string[],
  // Only reassure them about the rest of the course when there is a rest.
  hasUnaffectedUnits: boolean
) =>
  `The following units in this course use AI models not available in your region: ${unitTitles.join(
    ', '
  )}.${hasUnaffectedUnits ? ' Other units are unaffected.' : ''}`;

// A single unit is assigned, so there are no sibling units to reassure about.
export const US_ONLY_MODELS_UNIT =
  'This unit includes levels that use AI models not available in your region. Those levels will be disabled for you and your students.';

// AI Tutor has no per-level model, so it is gone everywhere it appears rather
// than in particular units, and no levels are disabled by its absence.
export const US_ONLY_MODELS_AI_TUTOR =
  'AI Tutor is not available in your region. Levels that offer it remain usable without it.';

export const MODEL_PARAMETER_LABELS: {
  [key in keyof ModelParameters]: string;
} = {
  selectedModelId: 'Selected model',
  temperature: 'Temperature',
  systemPrompt: 'System prompt',
  retrievalContexts: 'Retrieval',
};
