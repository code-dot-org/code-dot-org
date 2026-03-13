/**
 * The Innovator 🚀 - Teaching Persona Prompts
 *
 * The Innovator wants to explore, extend, and find the next exciting thing.
 * These prompts help teachers who like to push boundaries and try creative
 * approaches to engage students.
 *
 * Use this file for prompts that:
 * - Suggest novel or experimental teaching approaches
 * - Provide creative extensions and challenges
 * - Encourage exploration and innovation in the classroom
 */

import {ChatPrompt} from '@cdo/apps/aiDifferentiation/types';

export const NEW_WAYS_PROMPT: ChatPrompt = {
  label: 'New ways to teach this lesson',
  prompt: `I want to explore, extend, and find the next exciting thing. I'm looking for a new way to teach this lesson's key concepts. Suggest a hands-on activity that my students could experiment with.`,
};

export const CREATIVE_EXTENSION_PROMPT: ChatPrompt = {
  label: 'Creative extension activities for a challenge',
  prompt: `I want to explore, extend, and find the next exciting thing. My students finished the lesson. What are some ideas or extensions to creatively challenge them?`,
};
