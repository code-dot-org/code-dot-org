/**
 * The Bridge Builder 🌉 - Teaching Persona Prompts
 *
 * The Bridge Builder wants to connect CS to students' passions and the real world.
 * These prompts help teachers who excel at making computer science concepts
 * relevant and relatable to students' lives.
 *
 * Use this file for prompts that:
 * - Create connections to real-world applications
 * - Link CS concepts to student interests (sports, music, etc.)
 * - Make abstract concepts concrete and relatable
 */

import {ChatPrompt} from '@cdo/apps/aiDifferentiation/types';

export const CONNECT_TO_SPORTS_PROMPT: ChatPrompt = {
  label: 'Connect to sports',
  prompt: `Can you give me an analogy for how the main concepts introduced in this lesson are used in professional sports?`,
};

export const CONNECT_TO_MUSIC_PROMPT: ChatPrompt = {
  label: 'Connect to music',
  prompt: `Can you give me an analogy for how the main concepts introduced in this lesson are used in popular music?`,
};

export const EXPLAIN_KEY_CONCEPTS_PROMPT: ChatPrompt = {
  label: 'Explain key concepts',
  prompt: `Help me explain this lesson's key concepts.`,
};
