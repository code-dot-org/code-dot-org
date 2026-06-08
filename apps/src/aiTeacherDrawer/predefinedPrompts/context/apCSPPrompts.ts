/**
 * AP Computer Science Principles (AP CSP) Course-Specific Prompts
 *
 * These prompts are specific to the AP CSP curriculum and appear only when
 * teachers have AP CSP assigned to their sections.
 *
 * Use this file for prompts that:
 * - Help with AP exam preparation
 * - Support the Create Performance Task
 * - Address AP CSP-specific curriculum questions
 *
 * Structure:
 * - Individual prompts for specific questions
 * - Menu launcher prompts (DUMMY_*) that show a response + follow-up prompts
 *
 * These prompts are injected as additionalPrompts when curriculumCourses includes 'csp'.
 */

import {ChatPrompt} from '@cdo/apps/aiDifferentiation/types';

// ==================== AP EXAM PROMPTS ====================

export const APCSP_EXAM_SAMPLE_QUESTIONS: ChatPrompt = {
  label: 'Find sample questions',
  prompt: `Where can I find sample questions for the AP CSP exam?`,
};

export const APCSP_EXAM_BIG_IDEAS: ChatPrompt = {
  label: 'Breakdown of weighting big ideas',
  prompt: `What is the breakdown of the weighting of each big idea?`,
};

export const APCSP_EXAM_PREPARATION_RESOURCES: ChatPrompt = {
  label: 'Find resources to prepare students for the exam',
  prompt: `Where can I find resources to help prepare students for the exam?`,
};

export const APCSP_EXAM_CONNECT_WITH_TEACHERS: ChatPrompt = {
  label: 'Connect with other AP CSP teachers',
  prompt: `Where can I connect with other AP CSP teachers?`,
};

export const APCSP_EXAM_TIME_STRATEGIES: ChatPrompt = {
  label: 'Strategies to help students manage their time on the exam',
  prompt: `What are some strategies to help students manage their time on the CSP exam?`,
};

// ==================== CREATE PERFORMANCE TASK PROMPTS ====================

export const APCSP_CREATE_PT_SAMPLE: ChatPrompt = {
  label: 'Create Performance Task samples',
  prompt: `Where can I find Create performance tasks samples?`,
};

export const APCSP_CREATE_PT_REVIEW: ChatPrompt = {
  label: 'Can teachers review student submissions?',
  prompt: `Can teachers review student submissions before they are sent to CB for scoring?`,
};

export const APCSP_CREATE_PT_COLLAB: ChatPrompt = {
  label: 'Student collaboration on the Create Task',
  prompt: `Who can students collaborate with on the Create PT?`,
};

export const APCSP_CREATE_PT_AI: ChatPrompt = {
  label: 'AI Tools on the Create Task',
  prompt: `Can students use AI tools on the Create PT?`,
};

export const APCSP_CREATE_PT_GRADE: ChatPrompt = {
  label: 'Can I grade the Create Task',
  prompt: `Can I give students a grade on their Create PT?`,
};

export const APCSP_CREATE_PT_PREPARATION: ChatPrompt = {
  label: 'Resources to prepare for written responses',
  prompt: `Where can I find resources to help students prepare the written response portion of the Create PT?`,
};

// ==================== MENU LAUNCHER PROMPTS ====================

export const APCSP_DUMMY_CREATE: ChatPrompt = {
  label: 'Create task support',
  prompt: '',
  response: `Let’s chat about the Create Task! Here are some ideas you can ask me, or type your question below`,
  followUpPrompts: [
    APCSP_CREATE_PT_AI,
    APCSP_CREATE_PT_COLLAB,
    APCSP_CREATE_PT_GRADE,
    APCSP_CREATE_PT_PREPARATION,
    APCSP_CREATE_PT_REVIEW,
    APCSP_CREATE_PT_SAMPLE,
  ],
};

export const APCSP_DUMMY_EXAM: ChatPrompt = {
  label: 'AP exam support',
  prompt: '',
  response: `I would love to support your classroom as you get ready for the AP exam.  Here are some ideas you can ask me, or type your question below`,
  followUpPrompts: [
    APCSP_EXAM_BIG_IDEAS,
    APCSP_EXAM_CONNECT_WITH_TEACHERS,
    APCSP_EXAM_PREPARATION_RESOURCES,
    APCSP_EXAM_SAMPLE_QUESTIONS,
    APCSP_EXAM_TIME_STRATEGIES,
  ],
};
