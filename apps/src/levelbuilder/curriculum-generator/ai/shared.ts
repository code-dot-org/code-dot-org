import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

// Stable identifiers for each prompt site, used as a console.log prefix so
// debugging conversations can refer to e.g. "the panels-plan prompt" without
// ambiguity. Add a new tag here if you add another generateText call site.
export const PROMPT_TAGS = {
  UNIT_OUTLINE: 'lesson-gen/unit-outline',
  LESSON_OUTLINE: 'lesson-gen/lesson-outline',
  LESSON_IMPORT: 'lesson-gen/lesson-import',
  PANELS_PLAN: 'lesson-gen/panels-plan',
  PANELS_IMAGE: 'lesson-gen/panels-image',
  WEBLAB2_PLAN: 'lesson-gen/weblab2-plan',
  WEBLAB2_EXEMPLAR: 'lesson-gen/weblab2-exemplar',
  WEBLAB2_TEMPLATE: 'lesson-gen/weblab2-template',
  WEBLAB2_TEMPLATE_LEVEL: 'lesson-gen/weblab2-template-level',
  PYTHONLAB_PLAN: 'lesson-gen/pythonlab-plan',
  PYTHONLAB_EXEMPLAR: 'lesson-gen/pythonlab-exemplar',
  AILAB_PLAN: 'lesson-gen/ailab-plan',
  AICHAT_PLAN: 'lesson-gen/aichat-plan',
  SKETCHLAB_PLAN: 'lesson-gen/sketchlab-plan',
  MULTI_PLAN: 'lesson-gen/multi-plan',
  MATCH_PLAN: 'lesson-gen/match-plan',
  FREE_RESPONSE_PLAN: 'lesson-gen/free-response-plan',
  BUBBLE_CHOICE_PLAN: 'lesson-gen/bubble-choice-plan',
  BUBBLE_CHOICE_THUMBNAIL: 'lesson-gen/bubble-choice-thumbnail',
  SLIDES_OUTLINE: 'lesson-gen/slides-outline',
  SLIDE_PLAN: 'lesson-gen/slide-plan',
} as const;

export type PromptTag = (typeof PROMPT_TAGS)[keyof typeof PROMPT_TAGS];

// Optional context for prompt logging. Each field renders as a
// space-separated key=value pair in the log group label so a console
// search for e.g. `level=foo` lights up every prompt for that level.
// `unit` and `level` are the unit / level identifier the prompt is
// generating *for*; `subtask` distinguishes multiple prompts emitted
// at the same scope (e.g. "plan", "panel-3").
export interface LogContext {
  unit?: string;
  level?: string;
  subtask?: string;
}

function formatContext(context?: LogContext): string {
  if (!context) return '';
  const parts: string[] = [];
  if (context.unit) parts.push(`unit=${context.unit}`);
  if (context.level) parts.push(`level=${context.level}`);
  if (context.subtask) parts.push(`subtask=${context.subtask}`);
  return parts.length ? ` ${parts.join(' ')}` : '';
}

// Logs the prompt and (when it returns) the model output to the browser
// console under a stable tag. We use console.groupCollapsed so the entries
// stay readable but don't dominate the console for users who aren't
// debugging.
export function logPrompt(
  tag: PromptTag,
  prompt: string,
  context?: LogContext
): void {
  console.groupCollapsed(`[${tag}]${formatContext(context)} :: prompt sent`);
  console.log(prompt);
  console.groupEnd();
}

export function logResponse(
  tag: PromptTag,
  response: unknown,
  context?: LogContext
): void {
  console.groupCollapsed(
    `[${tag}]${formatContext(context)} :: response received`
  );
  console.log(response);
  console.groupEnd();
}

export const getTextModel = () => getModel(AiChatModelIds.GEMINI_2_5_FLASH);
export const getImageModel = () =>
  getModel(AiChatModelIds.GEMINI_2_5_FLASH_IMAGE);
