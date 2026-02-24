/**
 * Menu Configurations
 *
 * This file contains the SUGGESTED_PROMPTS_FOR_SELECTION configuration,
 * which maps selection keys to their initial messages and suggested prompts.
 *
 * Each entry defines what prompts appear in different contexts:
 * - plan: Curriculum planning and iteration prompts
 * - create: Activity creation prompts
 * - support: Platform onboarding and support prompts
 * - apcsp: AP CSP-specific prompts (when curriculum includes CSP)
 * - aif: AI Fundamentals-specific prompts (when curriculum includes AIF)
 *
 * To add a new context:
 * 1. Create the prompts in the appropriate file
 * 2. Add a new key here with initialMessage and suggestedPrompts
 * 3. Update the UI to surface this new context
 */

import {PromptMenuConfiguration} from '@cdo/apps/aiDifferentiation/types';

import * as activities from './activityPrompts';
import * as aif from './aifPrompts';
import * as apCSP from './apCSPPrompts';
import * as curriculum from './curriculumPrompts';
import * as platform from './platformPrompts';

export const SUGGESTED_PROMPTS_FOR_SELECTION: {
  [selection: string]: PromptMenuConfiguration;
} = {
  plan: {
    initialMessage: `Let's iterate together! What would you like to change? Below are some of the tasks I can help you with.`,
    suggestedPrompts: [
      curriculum.EXPLAIN_CONCEPT_PROMPT,
      curriculum.EXAMPLE_PROMPT,
      curriculum.ADJUST_TIMING_PROMPT,
      curriculum.DEBUG_MISTAKES_PROMPT,
      curriculum.REAL_WORLD_PROMPT,
    ],
  },
  create: {
    initialMessage: `Let's work together to create resources for your classroom! What would you like help creating? Below are some of the tasks I can help you with.`,
    suggestedPrompts: [
      activities.FINISH_EARLY_PROMPT,
      activities.EXTRA_PRACTICE_PROMPT,
      activities.EXIT_TICKET_PROMPT,
      activities.MINI_LESSON_PROMPT,
      activities.LESSON_HOOK_PROMPT,
    ],
  },
  support: {
    initialMessage: `Let's get started teaching on Code.org together! What would you like to do on the Code.org platform? Below are some of the tasks I can help you with.`,
    suggestedPrompts: [
      platform.SUGGEST_CURRICULUM_PROMPT,
      platform.GET_STARTED_PROMPT,
      platform.PROFESSIONAL_LEARNING_PROMPT,
      platform.CREATE_SECTION_PROMPT,
      platform.ADDITIONAL_HELP_PROMPT,
    ],
  },
  apcsp: {
    initialMessage: `Let's get started with AP prep! What would you like help with preparing for the AP exam? Below are some of the tasks I can help you with.`,
    suggestedPrompts: [
      apCSP.APCSP_EXAM_PREPARATION_RESOURCES,
      apCSP.APCSP_EXAM_SAMPLE_QUESTIONS,
      apCSP.APCSP_EXAM_TIME_STRATEGIES,
      apCSP.APCSP_CREATE_PT_AI,
      apCSP.APCSP_CREATE_PT_PREPARATION,
    ],
  },
  aif: {
    initialMessage: `Let's explore AI Fundamentals! What would you like help with?`,
    suggestedPrompts: [
      aif.AIF_PHILOSOPHY_MENU,
      aif.AIF_LOGISTICS_MENU,
      aif.AIF_TEACHER_PREP_MENU,
      aif.AIF_MATERIALS_MENU,
    ],
  },
};
