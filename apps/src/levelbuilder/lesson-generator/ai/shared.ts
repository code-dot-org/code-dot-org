import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

// Stable identifiers for each prompt site, used as a console.log prefix so
// debugging conversations can refer to e.g. "the panels-plan prompt" without
// ambiguity. Add a new tag here if you add another generateText call site.
export const PROMPT_TAGS = {
  LESSON_OUTLINE: 'lesson-gen/lesson-outline',
  PANELS_PLAN: 'lesson-gen/panels-plan',
  PANELS_IMAGE: 'lesson-gen/panels-image',
  WEBLAB2_PLAN: 'lesson-gen/weblab2-plan',
} as const;

export type PromptTag = (typeof PROMPT_TAGS)[keyof typeof PROMPT_TAGS];

// Logs the prompt and (when it returns) the model output to the browser
// console under a stable tag. We use console.groupCollapsed so the entries
// stay readable but don't dominate the console for users who aren't
// debugging.
export function logPrompt(tag: PromptTag, prompt: string): void {
  console.groupCollapsed(`[${tag}] prompt sent`);
  console.log(prompt);
  console.groupEnd();
}

export function logResponse(tag: PromptTag, response: unknown): void {
  console.groupCollapsed(`[${tag}] response received`);
  console.log(response);
  console.groupEnd();
}

export const getTextModel = () => getModel(AiChatModelIds.GEMINI_2_5_FLASH);
export const getImageModel = () =>
  getModel(AiChatModelIds.GEMINI_2_5_FLASH_IMAGE);
