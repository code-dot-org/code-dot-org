import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';
import {LessonContext} from '@cdo/apps/levelbuilder/curriculum-generator/ai/context';
import {
  getTextModel,
  logPrompt,
  logResponse,
  PROMPT_TAGS,
} from '@cdo/apps/levelbuilder/curriculum-generator/ai/shared';

import {
  BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES,
  formatLabTypeList,
  LAB_TYPE_INFO,
  LabType,
  SUPPORTED_LAB_TYPES,
} from '../types';

import {AICHAT_PRESET_IDS, AichatPresetId} from './aichat';

const supportedLabTypeEnum = z.enum(
  SUPPORTED_LAB_TYPES as unknown as [LabType, ...LabType[]]
);

const sublevelLabTypeEnum = z.enum(
  BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES as unknown as [LabType, ...LabType[]]
);

const aichatPresetEnum = z.enum(
  AICHAT_PRESET_IDS as unknown as [AichatPresetId, ...AichatPresetId[]]
);

const sublevelSchema = z.object({
  id: z
    .string()
    .describe(
      'Short kebab-case identifier unique within the bubble choice parent, e.g. "art" or "music". No prefix; that is added separately.'
    ),
  labType: sublevelLabTypeEnum.describe(
    `One of ${formatLabTypeList(
      BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES
    )}. Nested bubbleChoice is not allowed, and multi/match make poor bubble-choice options.`
  ),
  description: z
    .string()
    .describe(
      "A 1-3 sentence description of what this bubble's activity should teach or do. Becomes the AI prompt that builds the sublevel content."
    ),
  aichatPreset: aichatPresetEnum
    .optional()
    .describe(
      'For aichat sublevels only — same preset choices as top-level aichat levels. Omit otherwise.'
    ),
});

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
            `One of ${formatLabTypeList(
              SUPPORTED_LAB_TYPES
            )}. See the prompt for what each is used for.`
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
          sublevels: z
            .array(sublevelSchema)
            .min(2)
            .max(6)
            .optional()
            .describe(
              'REQUIRED for bubbleChoice levels; MUST be omitted for every other labType. 2-6 sublevel entries in the order the student will see them on the picker page.'
            ),
        })
      )
      .min(2)
      .max(8),
  }),
});

export interface OutlineSublevel {
  id: string;
  labType: LabType;
  description: string;
  aichatPreset?: AichatPresetId;
}

export interface OutlineLevel {
  id: string;
  labType: LabType;
  description: string;
  aichatPreset?: AichatPresetId;
  templateGroup?: string;
  sublevels?: OutlineSublevel[];
}

// ctx.targetProject shapes the plan toward a specific final-app
// destination when set.
// Prompt-side lab-type bullets, derived from LAB_TYPE_INFO so they can't
// drift from the union. BubbleChoice adds a suffix line naming the
// allowed sublevel types.
function labTypeBullets(): string[] {
  return SUPPORTED_LAB_TYPES.flatMap(labType => {
    const info = LAB_TYPE_INFO[labType];
    const first = `  - ${info.promptLabel}: ${info.promptDescription[0]}`;
    const rest = info.promptDescription.slice(1).map(line => `    ${line}`);
    const suffix =
      labType === 'bubbleChoice'
        ? [
            `    Sublevel labType is limited to ${formatLabTypeList(
              BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES
            )}.`,
          ]
        : [];
    return [first, ...rest, ...suffix];
  });
}

// "Choose X for Y, ..." summary, in SUPPORTED_LAB_TYPES order.
function chooseForSummary(): string {
  return SUPPORTED_LAB_TYPES.map(
    labType =>
      `${LAB_TYPE_INFO[labType].promptLabel} for ${LAB_TYPE_INFO[labType].chooseFor}`
  ).join(', ');
}

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
    ...labTypeBullets(),
    '',
    `Choose ${chooseForSummary()}. A typical lesson alternates: Panels intro`,
    '-> practice -> assessment -> Panels reflection, but you can deviate',
    'when the outline asks. Never open with an assessment — pair it with a',
    'concept the student has already seen.',
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
