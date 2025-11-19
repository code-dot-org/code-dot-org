/**
 * Menu Configurations
 *
 * This file contains menu configuration objects that define what prompts appear
 * in different contexts and for different teaching personas.
 *
 * Two main exports:
 * 1. SUGGESTED_PROMPTS_FOR_SELECTION - Context-based menus (plan, create, support, apcsp, aif)
 * 2. TEACHING_STYLE_PROMPTS_FOR_SELECTION - Persona-based menus (innovator, codeWhisperer, etc.)
 *
 * To add a new context or persona:
 * 1. Create the prompts in the appropriate file
 * 2. Add a new key here with initialMessage and suggestedPrompts
 * 3. Update the UI to surface this new context/persona
 */

import {PromptMenuConfiguration} from '@cdo/apps/aiDifferentiation/types';

import {contextPrompts} from './context';
import {personaPrompts} from './personas';

// Context-based prompt menus
export const SUGGESTED_PROMPTS_FOR_SELECTION: {
  [selection: string]: PromptMenuConfiguration;
} = {
  default: {
    initialMessage: `Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me.`,
    suggestedPrompts: [
      contextPrompts.curriculum.EXAMPLE_PROMPT,
      contextPrompts.curriculum.EXPLAIN_CONCEPT_PROMPT,
      contextPrompts.curriculum.DEBUG_MISTAKES_PROMPT,
      contextPrompts.activities.MINI_LESSON_PROMPT,
      contextPrompts.activities.EXIT_TICKET_PROMPT,
    ],
  },
  plan: {
    initialMessage: `Let's iterate together! What would you like to change? Below are some of the tasks I can help you with.`,
    suggestedPrompts: [
      contextPrompts.curriculum.EXPLAIN_CONCEPT_PROMPT,
      contextPrompts.curriculum.EXAMPLE_PROMPT,
      contextPrompts.curriculum.ADJUST_TIMING_PROMPT,
      contextPrompts.curriculum.DEBUG_MISTAKES_PROMPT,
      contextPrompts.curriculum.REAL_WORLD_PROMPT,
    ],
  },
  create: {
    initialMessage: `Let's work together to create resources for your classroom! What would you like help creating? Below are some of the tasks I can help you with.`,
    suggestedPrompts: [
      contextPrompts.activities.FINISH_EARLY_PROMPT,
      contextPrompts.activities.EXTRA_PRACTICE_PROMPT,
      contextPrompts.activities.EXIT_TICKET_PROMPT,
      contextPrompts.activities.MINI_LESSON_PROMPT,
      contextPrompts.activities.LESSON_HOOK_PROMPT,
    ],
  },
  support: {
    initialMessage: `Let's get started teaching on Code.org together! What would you like to do on the Code.org platform? Below are some of the tasks I can help you with.`,
    suggestedPrompts: [
      contextPrompts.platform.SUGGEST_CURRICULUM_PROMPT,
      contextPrompts.platform.GET_STARTED_PROMPT,
      contextPrompts.platform.PROFESSIONAL_LEARNING_PROMPT,
      contextPrompts.platform.CREATE_SECTION_PROMPT,
      contextPrompts.platform.ADDITIONAL_HELP_PROMPT,
    ],
  },
  apcsp: {
    initialMessage: `Let's get started with AP prep! What would you like help with preparing for the AP exam? Below are some of the tasks I can help you with.`,
    suggestedPrompts: [
      contextPrompts.apCSP.APCSP_EXAM_PREPARATION_RESOURCES,
      contextPrompts.apCSP.APCSP_EXAM_SAMPLE_QUESTIONS,
      contextPrompts.apCSP.APCSP_EXAM_TIME_STRATEGIES,
      contextPrompts.apCSP.APCSP_CREATE_PT_AI,
      contextPrompts.apCSP.APCSP_CREATE_PT_PREPARATION,
    ],
  },
  aif: {
    initialMessage: `Let's explore AI Fundamentals! What would you like help with?`,
    suggestedPrompts: [
      contextPrompts.aif.AIF_PHILOSOPHY_MENU,
      contextPrompts.aif.AIF_LOGISTICS_MENU,
      contextPrompts.aif.AIF_TEACHER_PREP_MENU,
      contextPrompts.aif.AIF_MATERIALS_MENU,
    ],
  },
};

// Teaching persona prompt menus
export const TEACHING_STYLE_PROMPTS_FOR_SELECTION: {
  [selection: string]: PromptMenuConfiguration;
} = {
  innovator: {
    initialMessage:
      'The Innovator 🚀 wants to explore, extend, and find the next exciting thing.',
    suggestedPrompts: [
      personaPrompts.innovator.NEW_WAYS_PROMPT,
      personaPrompts.innovator.CREATIVE_EXTENSION_PROMPT,
    ],
  },
  codeWhisperer: {
    initialMessage:
      'The Code Whisperer 🔍 wants to understand student misconceptions and provide perfect hints.',
    suggestedPrompts: [
      personaPrompts.codeWhisperer.GUIDING_QUESTIONS_PROMPT,
      personaPrompts.codeWhisperer.SUGGEST_HINT_PROMPT,
    ],
  },
  bridgeBuilder: {
    initialMessage:
      "The Bridge Builder 🌉 wants to connect CS to students' passions and the real world.",
    suggestedPrompts: [
      personaPrompts.bridgeBuilder.CONNECT_TO_SPORTS_PROMPT,
      personaPrompts.bridgeBuilder.CONNECT_TO_MUSIC_PROMPT,
      personaPrompts.bridgeBuilder.EXPLAIN_KEY_CONCEPTS_PROMPT,
    ],
  },
  storyteller: {
    initialMessage:
      'The Storyteller 📚 wants to create analogies, metaphors, and memorable stories.',
    suggestedPrompts: [
      personaPrompts.storyteller.EXPLAIN_MEMORABLE_PROMPT,
      personaPrompts.storyteller.LESSON_HOOK_PROMPT,
    ],
  },
  communityArchitect: {
    initialMessage:
      'The Community Architect 👥 wants to foster collaboration, inclusion, and teamwork.',
    suggestedPrompts: [
      personaPrompts.communityArchitect.TEAM_ACTIVITY_PROMPT,
      personaPrompts.communityArchitect.ENGAGE_QUIET_STUDENTS_PROMPT,
    ],
  },
  leadLearner: {
    initialMessage:
      'The Lead Learner ⭐ wants to model curiosity and learn alongside students.',
    suggestedPrompts: [
      personaPrompts.leadLearner.MODEL_THINK_OUT_LOUD_PROMPT,
      personaPrompts.leadLearner.EXPLAIN_KEY_CONCEPTS_PROMPT,
    ],
  },
};
