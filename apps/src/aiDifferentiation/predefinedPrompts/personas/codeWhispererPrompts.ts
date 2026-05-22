/**
 * The Code Whisperer 🔍 - Teaching Persona Prompts
 *
 * The Code Whisperer wants to understand student misconceptions and provide
 * perfect hints. These prompts help teachers who excel at diagnosing where
 * students are stuck and guiding them without giving away answers.
 *
 * Use this file for prompts that:
 * - Generate guiding questions for struggling students
 * - Suggest targeted hints that don't reveal solutions
 * - Help identify and address misconceptions
 */

import {ChatPrompt} from '@cdo/apps/aiDifferentiation/types';

export const GUIDING_QUESTIONS_PROMPT: ChatPrompt = {
  label: 'Guiding questions',
  prompt: `My student is struggling with this lesson. Give me guiding questions to help them get unstuck. You can ask me a follow-up question: What is the student struggling with?`,
};

export const SUGGEST_HINT_PROMPT: ChatPrompt = {
  label: 'Suggest a hint',
  prompt: `Suggest targeted hints that explain the key concepts of this lesson without giving the answer.`,
};
