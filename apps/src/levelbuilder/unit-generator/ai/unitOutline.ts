import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';

import {UnitContext} from '../../lesson-generator/ai/context';
// We piggy-back on the lesson generator's shared logging + model helpers
// so the unit page tags its prompts with the same `lesson-gen/*` family
// the lesson generator uses. The console grouping conventions stay
// uniform across both pages.
import {
  getTextModel,
  logPrompt,
  logResponse,
  PROMPT_TAGS,
} from '../../lesson-generator/ai/shared';

// Bounds on the unit outline plan. Quoted both in the prompt and in
// the zod schema so the limits stay in sync.
const MIN_LESSONS = 2;
const MAX_LESSONS = 20;

const unitOutlineSchema = Output.object({
  schema: z.object({
    lessons: z
      .array(
        z.object({
          key: z
            .string()
            .describe(
              'Short kebab-case identifier unique within the unit, e.g. "intro-html" or "build-form". Becomes the lesson key.'
            ),
          name: z
            .string()
            .describe(
              'Human-readable lesson title shown to teachers and students, e.g. "Introduction to HTML".'
            ),
          description: z
            .string()
            .describe(
              'A 2-5 sentence description of what this lesson should teach. Becomes the AI prompt that builds the lesson content on the per-lesson /generate page.'
            ),
        })
      )
      .min(MIN_LESSONS)
      .max(MAX_LESSONS),
  }),
});

export interface OutlineLesson {
  key: string;
  name: string;
  description: string;
}

// Given a unit-scope context (free-form outline + unit title), ask the
// model to break it into a sequence of lessons. Each lesson gets a key,
// a display name, and a description that becomes the lesson's
// generate_outline prompt — i.e. the input the per-lesson /generate page
// will later use to flesh out the lesson's actual content.
export async function generateUnitOutline(
  ctx: UnitContext
): Promise<OutlineLesson[]> {
  const prompt = [
    'You are helping a curriculum author plan the lessons in a single CS',
    'unit (a multi-lesson learning experience for middle-school students).',
    `Break the outline below into a sequence of ${MIN_LESSONS} to ${MAX_LESSONS} lessons that, in`,
    'order, take the student through the learning experience.',
    '',
    'For each lesson, return:',
    '  - key: a short kebab-case identifier unique within the unit',
    '    (e.g. "intro-html", "build-form").',
    '  - name: a human-readable title (e.g. "Introduction to HTML").',
    '  - description: 2-5 sentences of what the lesson should teach. This',
    '    becomes the prompt the per-lesson generator will later use to',
    '    plan and write the lesson, so be concrete: name what concept is',
    '    introduced, what the student does, and what they should be able',
    '    to do by the end.',
    '',
    `Unit title: ${ctx.unitName ?? ''}`,
    '',
    `Unit outline: ${ctx.unitOutline ?? ''}`,
  ].join('\n');

  const context = {unit: ctx.unitName, subtask: 'outline'};
  logPrompt(PROMPT_TAGS.UNIT_OUTLINE, prompt, context);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: unitOutlineSchema,
  });
  const lessons = (response.output as {lessons: OutlineLesson[]}).lessons;
  logResponse(PROMPT_TAGS.UNIT_OUTLINE, lessons, context);
  if (!lessons?.length) {
    throw new Error('Model returned no lessons');
  }
  return lessons;
}
