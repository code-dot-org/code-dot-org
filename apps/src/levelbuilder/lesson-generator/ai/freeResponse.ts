import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';
import {
  authoringRulesLines,
  LevelContext,
} from '@cdo/apps/levelbuilder/curriculum-generator/ai/context';
import {
  getTextModel,
  logPrompt,
  logResponse,
  PROMPT_TAGS,
} from '@cdo/apps/levelbuilder/curriculum-generator/ai/shared';

// FreeResponse is a plain properties-backed level (no DSL): the question
// prose is the level's long_instructions, `placeholder` seeds the response
// textarea, and `solution` is teacher-only markdown (stored encrypted).
// Same stub policy as Multi/Match — placeholder content the curriculum
// author rewrites, structurally complete so the level runs immediately.

const freeResponsePlanSchema = Output.object({
  schema: z.object({
    question: z
      .string()
      .describe(
        'STUB question/prompt markdown shown above the response box, 1-3 ' +
          'sentences. Placeholder prose; the curriculum author will rewrite.'
      ),
    placeholder: z
      .string()
      .describe(
        'Short placeholder text shown inside the empty response box, e.g. ' +
          '"Describe what your program does…". One clause.'
      ),
    solution: z
      .string()
      .describe(
        'STUB teacher-only markdown: a brief sample strong response plus ' +
          '1-3 look-fors when reviewing student answers. Placeholder ' +
          'quality; the curriculum author will refine.'
      ),
  }),
});

export interface FreeResponseGeneration {
  longInstructions: string;
  placeholder: string;
  solution: string;
  summary: string;
}

export async function generateFreeResponseLevel(
  ctx: LevelContext
): Promise<FreeResponseGeneration> {
  const prompt = [
    'You are helping a curriculum author build a free-response assessment',
    'level: the student reads a prompt and types a written answer. Output',
    'STUB content the author will rewrite — terse placeholders that get',
    'the structure right so the level is runnable as soon as it lands,',
    'not polished prose.',
    '',
    'Produce:',
    '  - question: 1-3 sentence prompt markdown. Placeholder prose.',
    '  - placeholder: one short clause shown inside the empty response box.',
    '  - solution: teacher-only markdown — a brief sample strong response',
    '    plus 1-3 look-fors for reviewing answers.',
    ...authoringRulesLines(ctx),
    ...(ctx.lessonOutline
      ? [
          '',
          'Lesson context (keep continuity, but only build this assessment):',
          ctx.lessonOutline,
        ]
      : []),
    ...(ctx.precedingLevels
      ? [
          '',
          'Preceding levels in this lesson. Reference what the student just',
          'did when writing the prompt:',
          ctx.precedingLevels,
        ]
      : []),
    '',
    `Description: ${ctx.levelDescription}`,
  ].join('\n');

  const logContext = {level: ctx.levelName, subtask: 'plan'};
  logPrompt(PROMPT_TAGS.FREE_RESPONSE_PLAN, prompt, logContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: freeResponsePlanSchema,
  });
  const plan = response.output as {
    question: string;
    placeholder: string;
    solution: string;
  };
  logResponse(PROMPT_TAGS.FREE_RESPONSE_PLAN, plan, logContext);
  if (!plan.question?.trim()) throw new Error('Model returned no question');

  return {
    longInstructions: plan.question.trim(),
    placeholder: plan.placeholder?.trim() ?? '',
    solution: plan.solution?.trim() ?? '',
    summary: `Free response — Q: ${plan.question.trim()}`,
  };
}
