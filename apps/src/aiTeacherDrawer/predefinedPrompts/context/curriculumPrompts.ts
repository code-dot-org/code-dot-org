/**
 * Curriculum Planning & Iteration Prompts
 *
 * These prompts help teachers plan, understand, and iterate on curriculum content.
 * Use this file for prompts that:
 * - Explain concepts or provide examples
 * - Help adjust timing or pacing
 * - Identify common mistakes or misconceptions
 * - Create real-world connections
 *
 * These prompts are typically used in the "plan" context.
 */

import {ChatPrompt} from '@cdo/apps/aiDifferentiation/types';

export const EXPLAIN_CONCEPT_PROMPT: ChatPrompt = {
  label: 'Explain a concept',
  prompt:
    'I need an explanation of a concept. You can ask me a follow-up question to find out what concept needs to be explained.',
};

export const EXAMPLE_PROMPT: ChatPrompt = {
  label: 'Give me an example',
  prompt:
    'Can I have an example to use with my class? You can ask me a follow-up question to get more details for the kind of example needed.',
};

export const ADJUST_TIMING_PROMPT: ChatPrompt = {
  label: 'Adjust curriculum for timing',
  prompt: `I need to adjust a lesson for a different amount of instructional time.  You can clarify what lesson and how much time I have.

    Help me adapt my lesson on [topic given by teacher] to fit a [time period given by teacher] class. I need to preserve the key learning objectives while adjusting the activities and pacing. Please suggest which components to prioritize, what could be condensed or expanded, and provide a minute-by-minute breakdown that includes introduction, instruction, guided practice, independent work, and closure. Include time-saving tips and contingency options if activities run long or short.'`,
};

export const DEBUG_MISTAKES_PROMPT: ChatPrompt = {
  label: 'Debug common mistakes',
  prompt:
    'Outline the most common mistakes students make when learning key topics in this curriculum at this grade level, provide code examples of these mistakes, and suggest teaching strategies to prevent and address them. Include how to turn these mistakes into learning opportunities and specific questions to ask students to guide their debugging process.',
};

export const REAL_WORLD_PROMPT: ChatPrompt = {
  label: 'Real world connection',
  prompt: `I need real world connections to the curriculum I am teaching.  Feel free to clarify what concept we are creating real world connections to.

    Create engaging examples that connect [topic given by user] to real-world applications students care about. Consider target age of curriculum as well as current technology trends, popular apps, games, and everyday problems that can be solved using this concept. Include discussion prompts that help students see how this concept is used in technology they interact with daily students to guide their debugging process.`,
};
