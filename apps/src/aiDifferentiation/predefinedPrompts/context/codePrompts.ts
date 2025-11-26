/**
 * Code-Level Context Prompts
 *
 * These prompts appear when the teacher is in a level/coding context and has
 * student code available to work with.
 *
 * Use this file for prompts that:
 * - Help debug student code
 * - Suggest improvements to student code
 * - Analyze or explain code snippets
 *
 * These prompts are injected as additionalPrompts when context.type === AiDiffContext.LEVEL.
 */

import {ChatPrompt} from '@cdo/apps/aiDifferentiation/types';

export const DEBUG_THIS_CODE: ChatPrompt = {
  label: 'Debug this code',
  prompt: 'Please tell me what the bugs are in this student code.',
};

export const IMPROVE_THIS_CODE: ChatPrompt = {
  label: 'Improve this code',
  prompt: 'How can this student code be improved?',
};
