import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

// Stable identifiers for each prompt site, used as a console.log prefix so
// debugging conversations can refer to e.g. "the panels-plan prompt" without
// ambiguity. Add a new tag here if you add another generateText call site.
export const PROMPT_TAGS = {
  UNIT_OUTLINE: 'lesson-gen/unit-outline',
  LESSON_OUTLINE: 'lesson-gen/lesson-outline',
  PANELS_PLAN: 'lesson-gen/panels-plan',
  PANELS_IMAGE: 'lesson-gen/panels-image',
  WEBLAB2_PLAN: 'lesson-gen/weblab2-plan',
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
