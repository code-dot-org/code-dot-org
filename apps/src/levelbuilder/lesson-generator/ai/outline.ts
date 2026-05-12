import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';

import {LabType, SUPPORTED_LAB_TYPES} from '../types';

import {getTextModel, logPrompt, logResponse, PROMPT_TAGS} from './shared';

// Build the labType enum from SUPPORTED_LAB_TYPES so adding a new lab is
// a single-line change. zod's z.enum requires a non-empty tuple, so we
// cast through the canonical list.
const supportedLabTypeEnum = z.enum(
  SUPPORTED_LAB_TYPES as unknown as [LabType, ...LabType[]]
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
            '"panels" for narrative / explanation panels with overlay text on illustrations. "weblab2" for hands-on HTML/CSS/JS coding levels.'
          ),
          description: z
            .string()
            .describe(
              'A 1-3 sentence description of what this level should teach or do. Used as the AI prompt that builds the level content.'
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
}

// Given a free-form outline of a lesson's learning experience, ask the
// model to break it down into a sequence of 2-8 levels alternating between
// Panels (narrative) and Weblab2 (hands-on coding). Returns the level
// specs the caller can drop straight into the per-level form.
//
// `targetProject`, when supplied, is the formatted final-app snapshot
// (same string the per-level prompts get). It lets the outline AI plan
// a progression aimed at that destination — picking weblab2 milestones
// that move the code toward the target and panels that frame the
// concepts the target uses.
export async function generateLessonOutline(
  outline: string,
  targetProject?: string
): Promise<OutlineLevel[]> {
  const prompt = [
    'You are helping a curriculum author plan a single lesson for a',
    'middle-school CS class. Break the outline below into a sequence of',
    '2 to 8 levels that, in order, take the student through the learning',
    'experience. Each level is one of:',
    '  - Panels: a short comic-strip-like sequence used for narrative,',
    '    introduction, framing, or summarising. No coding.',
    '  - Weblab2: a hands-on HTML/CSS/JS exercise where the student edits',
    '    starter code.',
    '',
    'Choose Panels for explanation/narrative and Weblab2 for practice.',
    'A typical lesson alternates: Panels intro -> Weblab2 practice ->',
    'Panels reflection, etc., but you can deviate when the outline asks.',
    '',
    'For each level, return:',
    '  - id: a short kebab-case identifier (e.g. "intro-1", "build-form")',
    '  - labType: "panels" or "weblab2"',
    '  - description: a 1-3 sentence description of what the level should',
    '    teach or do. This becomes the AI prompt that builds the actual',
    '    level content, so be concrete.',
    ...(targetProject
      ? [
          '',
          'Target project — the final app the lesson is building toward.',
          'Plan the weblab2 levels as milestones on the path from blank to',
          'this code (introducing one or two concepts per level, in an',
          'order that yields a runnable intermediate at each step). Pick',
          'panels that motivate or recap the concepts the target uses. The',
          'student never sees this code; do not paste it into any',
          'description — just let it shape the progression.',
          targetProject,
        ]
      : []),
    '',
    `Outline: ${outline}`,
  ].join('\n');

  logPrompt(PROMPT_TAGS.LESSON_OUTLINE, prompt);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: lessonOutlineSchema,
  });
  const levels = (response.output as {levels: OutlineLevel[]}).levels;
  logResponse(PROMPT_TAGS.LESSON_OUTLINE, levels);
  if (!levels?.length) {
    throw new Error('Model returned no levels');
  }
  return levels;
}
