/**
 * The Community Architect 👥 - Teaching Persona Prompts
 *
 * The Community Architect wants to foster collaboration, inclusion, and teamwork.
 * These prompts help teachers who prioritize building a supportive classroom
 * community and ensuring all students feel included.
 *
 * Use this file for prompts that:
 * - Design collaborative group activities
 * - Support engagement of all students, including quiet ones
 * - Foster inclusive classroom environments
 */

import {ChatPrompt} from '@cdo/apps/aiDifferentiation/types';

export const TEAM_ACTIVITY_PROMPT: ChatPrompt = {
  label: 'Create a team activity',
  prompt: `I want to foster collaboration, inclusion, and teamwork. Suggest a group activity for a small team that mirrors a real-world developer team.`,
};

export const ENGAGE_QUIET_STUDENTS_PROMPT: ChatPrompt = {
  label: 'Engage quiet students',
  prompt: `I want to foster collaboration, inclusion, and teamwork. I have quiet students who are hesitant to contribute during class. Suggest strategies to support them.`,
};
