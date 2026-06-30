import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';

import {LessonContext} from '../../curriculum-generator/ai/context';
import {
  getTextModel,
  logPrompt,
  logResponse,
  PROMPT_TAGS,
} from '../../curriculum-generator/ai/shared';
import {LabType, SUPPORTED_LAB_TYPES} from '../types';

import {AICHAT_PRESET_IDS, AichatPresetId} from './aichat';

// Build the labType enum from SUPPORTED_LAB_TYPES so adding a new lab is
// a single-line change. zod's z.enum requires a non-empty tuple, so we
// cast through the canonical list.
const supportedLabTypeEnum = z.enum(
  SUPPORTED_LAB_TYPES as unknown as [LabType, ...LabType[]]
);

const aichatPresetEnum = z.enum(
  AICHAT_PRESET_IDS as unknown as [AichatPresetId, ...AichatPresetId[]]
);

const lessonOutlineSchema = Output.object({
  schema: z.object({
    levels: z
      .array(
        z.object({
          id: z
            .string()
            .describe(
              'Short kebab-case identifier unique within the lesson, e.g. "intro-1" or "build-form". No prefix; that is added separately.'
            ),
          labType: supportedLabTypeEnum.describe(
            '"panels" for narrative / explanation panels with overlay text on illustrations. "weblab2" for hands-on HTML/CSS/JS coding levels. "ailab" for guided machine-learning levels where the student picks a dataset, picks features, trains a model, and inspects the result. "aichat" for chat-with-an-LLM levels (set `aichatPreset` to pick which preset to use).'
          ),
          description: z
            .string()
            .describe(
              'A 1-3 sentence description of what this level should teach or do. Used as the AI prompt that builds the level content.'
            ),
          aichatPreset: aichatPresetEnum
            .optional()
            .describe(
              'For aichat levels only — pick one of: "explore" (free chat with a persona bot), "tutor" (bot guides a specific skill), "evaluation" (bot evaluates the student\'s work, possibly with an uploaded artifact), "domainExpert" (bot constrained to a single subject), or "botBuilder" (student designs their own bot). Omit for non-aichat labTypes.'
            ),
          templateGroup: z
            .string()
            .optional()
            .describe(
              'For weblab2 levels only — short kebab-case id (e.g. "main", "puzzle") that groups multiple weblab2 cards onto a shared starter project. When 2+ weblab2 levels carry the same templateGroup, they share one generated template level; each per-level card only writes its own long_instructions and exemplar on top of the template. Use ONE group per lesson when the weblab2 levels build the same app across multiple steps; use distinct groups when the levels are independent projects. Omit for stand-alone weblab2 levels.'
            ),
        })
      )
      .min(2)
      .max(8),
  }),
});

export interface OutlineLevel {
  id: string;
  labType: LabType;
  description: string;
  aichatPreset?: AichatPresetId;
  templateGroup?: string;
}

// Given the lesson's context (free-form outline plus whatever outer
// scopes filled in), ask the model to break it down into a sequence of
// 2-8 levels alternating between Panels (narrative) and Weblab2
// (hands-on coding). Returns the level specs the caller can drop
// straight into the per-level form.
//
// ctx.targetProject, when supplied, is the formatted final-app snapshot
// (same string the per-level prompts read from ctx.targetProject). It
// lets the outline AI plan a progression aimed at that destination —
// picking weblab2 milestones that move the code toward the target and
// panels that frame the concepts the target uses.
export async function generateLessonOutline(
  ctx: LessonContext
): Promise<OutlineLevel[]> {
  const prompt = [
    'You are helping a curriculum author plan a single lesson for a CS',
    'class. Assume a middle-school audience unless the outline below names',
    'a different grade band or target audience, in which case follow the',
    'outline. Break the outline below into a sequence of',
    '2 to 8 levels that, in order, take the student through the learning',
    'experience. Each level is one of:',
    '  - Panels: a short comic-strip-like sequence used for narrative,',
    '    introduction, framing, or summarising. No coding.',
    '  - Weblab2: a hands-on HTML/CSS/JS exercise where the student edits',
    '    starter code.',
    '  - Ailab: a guided ML pipeline where the student picks a dataset,',
    '    picks features, trains a model, and inspects accuracy. Use this',
    '    only when the lesson is about data, machine learning, bias in',
    '    data, or model evaluation — not for general coding.',
    '  - Aichat: a chat-with-an-LLM level. Pick a preset via aichatPreset:',
    '    "explore" for free-form chat with a persona bot, "tutor" for a',
    '    skill-guiding bot, "evaluation" for a bot that evaluates the',
    '    student\'s work, "domainExpert" for a subject-constrained bot,',
    '    "botBuilder" when the student designs their own bot.',
    '  - Multi: a multiple-choice question. Use as a quick check-for-',
    '    understanding after a concept has been introduced. Content will',
    '    be a STUB the curriculum author rewrites.',
    '  - Match: a matching exercise. Use to connect related concepts,',
    '    terms-to-definitions, etc. Content will be a STUB.',
    '',
    'Choose Panels for explanation/narrative, Weblab2 for web-coding',
    'practice, Ailab for ML pipeline practice, Aichat for talking-to-AI',
    'practice, and Multi/Match for short formative assessments. A typical',
    'lesson alternates: Panels intro -> practice -> assessment -> Panels',
    'reflection, but you can deviate when the outline asks. Never open with',
    'an assessment — pair it with a concept the student has already seen.',
    '',
    'For each level, return:',
    '  - id: a short kebab-case identifier (e.g. "intro-1", "build-form")',
    '  - labType: "panels" or "weblab2"',
    '  - description: a 1-3 sentence description of what the level should',
    '    teach or do. This becomes the AI prompt that builds the actual',
    '    level content, so be concrete.',
    ...(ctx.unitOutline
      ? [
          '',
          `Unit context — this lesson sits inside the unit "${
            ctx.unitName ?? ''
          }". Keep the level sequence consistent with the unit's arc (including its intended audience/grade), but`,
          'only plan levels for the specific lesson outline below:',
          ctx.unitOutline,
        ]
      : []),
    ...(ctx.targetProject
      ? [
          '',
          'Target project — the final app the lesson is building toward.',
          'Plan the weblab2 levels as milestones on the path from blank to',
          'this code (introducing one or two concepts per level, in an',
          'order that yields a runnable intermediate at each step). Pick',
          'panels that motivate or recap the concepts the target uses. The',
          'student never sees this code; do not paste it into any',
          'description — just let it shape the progression.',
          ctx.targetProject,
        ]
      : []),
    '',
    `Outline: ${ctx.lessonOutline ?? ''}`,
  ].join('\n');

  const logContext = {level: ctx.lessonName, subtask: 'lesson-outline'};
  logPrompt(PROMPT_TAGS.LESSON_OUTLINE, prompt, logContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: lessonOutlineSchema,
  });
  const levels = (response.output as {levels: OutlineLevel[]}).levels;
  logResponse(PROMPT_TAGS.LESSON_OUTLINE, levels, logContext);
  if (!levels?.length) {
    throw new Error('Model returned no levels');
  }
  return levels;
}
