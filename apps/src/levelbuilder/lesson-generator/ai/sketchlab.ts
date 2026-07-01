import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';

import {LevelContext} from '../../curriculum-generator/ai/context';
import {
  getTextModel,
  logPrompt,
  logResponse,
  PROMPT_TAGS,
} from '../../curriculum-generator/ai/shared';

const sketchlabPlanSchema = Output.object({
  schema: z.object({
    longInstructions: z
      .string()
      .describe(
        'STUB ONLY. Format as a single literal `TODOs:` line followed by ' +
          '4-8 markdown bullets, each bare content (no `TODO:` prefix on ' +
          'the bullet — the header sets the context once). Name what the ' +
          'student should draw or annotate on the blank sketch canvas. The ' +
          'curriculum author writes the final prose later.'
      ),
  }),
});

export interface SketchlabGeneration {
  longInstructions: string;
}

// Sketch Lab lets the student draw / annotate on a blank canvas. The
// generator only stubs the student-facing instructions; the sketch
// itself is left empty for the curriculum author to draw by hand.
export async function generateSketchlabLevel(
  ctx: LevelContext
): Promise<SketchlabGeneration> {
  const prompt = [
    'You are helping a curriculum author build a "Sketch Lab" level: an',
    'open-ended drawing / annotation exercise where the student draws on a',
    'blank canvas. Assume a middle-school audience unless the description',
    'below names a different grade band, in which case follow it.',
    '',
    'Emit ONE thing: a STUB outline for the student-facing instructions.',
    'Format as a single literal `TODOs:` line followed by 4-8 markdown',
    'bullets, each bare content (no `TODO:` prefix on the bullet — the',
    'header sets the context once). Name what the student should draw or',
    'annotate. Do NOT write polished student-facing copy — the curriculum',
    'author writes that later. No other headings, no paragraphs.',
    '',
    'The sketch canvas is intentionally left blank; do not describe',
    'starter shapes or images.',
    ...(ctx.unitOutline
      ? [
          '',
          `Unit context — this level sits inside the unit "${
            ctx.unitName ?? ''
          }". Use it for broad continuity (audience/grade, recurring themes, tone, arc)`,
          'but build only the specific level described below:',
          ctx.unitOutline,
        ]
      : []),
    ...(ctx.lessonOutline
      ? [
          '',
          'Lesson context (this level is one piece of a larger lesson — keep',
          'continuity with prior steps, but only build the specific level',
          'described below):',
          ctx.lessonOutline,
        ]
      : []),
    ...(ctx.precedingLevels
      ? [
          '',
          'Preceding levels in this lesson, in order. Use them for continuity',
          '— building on the same concepts, reusing characters or examples —',
          'but do NOT restate them; only build the level described last:',
          ctx.precedingLevels,
        ]
      : []),
    '',
    `Description: ${ctx.levelDescription}`,
  ].join('\n');

  const logContext = {level: ctx.levelName, subtask: 'plan'};
  logPrompt(PROMPT_TAGS.SKETCHLAB_PLAN, prompt, logContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: sketchlabPlanSchema,
  });
  const plan = response.output as {longInstructions: string};
  logResponse(PROMPT_TAGS.SKETCHLAB_PLAN, plan, logContext);
  if (!plan.longInstructions?.trim()) {
    throw new Error('Model returned no instructions');
  }
  return {longInstructions: plan.longInstructions.trim()};
}
