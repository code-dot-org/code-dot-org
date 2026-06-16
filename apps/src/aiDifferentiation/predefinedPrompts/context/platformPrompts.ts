/**
 * CodeAI Platform Support & Onboarding Prompts
 *
 * These prompts help teachers get started with and navigate the CodeAI platform.
 * Use this file for prompts that:
 * - Guide new teachers through platform setup
 * - Help with curriculum selection
 * - Explain platform features (sections, professional learning, etc.)
 * - Direct teachers to CodeAI support resources
 *
 * These prompts are course-agnostic and focus on the platform itself.
 * These prompts are typically used in the "support" context.
 */

import {ChatPrompt} from '@cdo/apps/aiDifferentiation/types';

export const SUGGEST_CURRICULUM_PROMPT: ChatPrompt = {
  label: 'Suggest a curriculum',
  prompt: `What CodeAI curriculum should I use with my class? You can write a message asking me for the essential context about my class needed to give a suitable curriculum suggestion. Your message should:
  - Request student age/grade level
  - Ask about topics I want to cover in the curriculum
  - Ask how often I see my students and how long the course should be

  Use this information to find a few suitable CodeAI curricula that I could teach my students

  Format the questions as a clear, easy-to-read list`,
};

export const GET_STARTED_PROMPT: ChatPrompt = {
  label: 'Get started with CodeAI',
  prompt: `How do I get started as a teacher on CodeAI?`,
};

export const PROFESSIONAL_LEARNING_PROMPT: ChatPrompt = {
  label: 'Learn about Professional Learning',
  prompt: `What CodeAI Professional Learning opportunities are available and where can I find them? You can ask me follow-up questions about what topics I want to learn about in order to suggest a professional learning course to me.`,
};

export const CREATE_SECTION_PROMPT: ChatPrompt = {
  label: 'How to create a section?',
  prompt: `How do I create a classroom section? You can write a message asking me for the essential context about my class needed to give me specific instructions for creating my classroom section. Your message should:

  - Ask me if I use an LMS like Schoology, Clever, Canvas, or Google Classrooms, or if I want my students to have a log-in on CodeAI
  - Ask me what grade level my students are

  Use this information to give me specific instructions on how to create a classroom section for the log-in type I need to use for my students.`,
};

export const ADDITIONAL_HELP_PROMPT: ChatPrompt = {
  label: 'Get help using CodeAI',
  prompt: `Who can I go to if I have more questions about CodeAI? Encourage me to ask you for help with most issues in the chat or look at the CodeAI support center. The last part of your answer must include directing me to the "Submit a request" page at https://support.code.org/hc/en-us/requests/new to get support from a staff member at CodeAI.`,
};
