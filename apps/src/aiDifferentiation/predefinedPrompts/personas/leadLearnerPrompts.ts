/**
 * The Lead Learner ⭐ - Teaching Persona Prompts
 *
 * The Lead Learner wants to model curiosity and learn alongside students.
 * These prompts help teachers who embrace not knowing everything and want
 * to demonstrate the learning process itself.
 *
 * Use this file for prompts that:
 * - Model thinking processes and metacognition
 * - Help teachers learn new concepts to teach
 * - Demonstrate curiosity and growth mindset
 */

import {ChatPrompt} from '@cdo/apps/aiDifferentiation/types';

export const MODEL_THINK_OUT_LOUD_PROMPT: ChatPrompt = {
  label: 'Model think out loud',
  prompt: `I want to model curiosity and learn alongside my students. Help me model how to 'think out loud' during this lesson.`,
};

export const EXPLAIN_KEY_CONCEPTS_PROMPT: ChatPrompt = {
  label: 'Explain key concepts',
  prompt: `Can you explain the key concepts of this lesson so a teacher new to the subject can understand them?`,
};
