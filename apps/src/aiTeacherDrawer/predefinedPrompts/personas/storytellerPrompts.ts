/**
 * The Storyteller 📚 - Teaching Persona Prompts
 *
 * The Storyteller wants to create analogies, metaphors, and memorable stories.
 * These prompts help teachers who excel at making concepts stick through
 * narrative and creative explanations.
 *
 * Use this file for prompts that:
 * - Create memorable analogies and metaphors
 * - Generate engaging lesson hooks and stories
 * - Make complex concepts easier to remember through narrative
 */

import {ChatPrompt} from '@cdo/apps/aiDifferentiation/types';

export const EXPLAIN_MEMORABLE_PROMPT: ChatPrompt = {
  label: 'Explain in a memorable way',
  prompt: `I want to explain the key concepts of this lesson by creating analogies, metaphors, and memorable stories.`,
};

export const LESSON_HOOK_PROMPT: ChatPrompt = {
  label: 'Lesson hook',
  prompt: `Create a short, engaging lesson hook that uses an analogy, metaphor, or memorable story to introduce this lesson's key concepts.`,
};
