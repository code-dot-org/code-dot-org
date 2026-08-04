import {
  INSTRUCTIONS_KEYS,
  type InstructionsKey,
  type Mode,
} from '@code-dot-org/ailab';
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

import {AILAB_DATASETS} from './datasets';

const datasetIdEnum = z.enum(
  AILAB_DATASETS.map(d => d.id) as unknown as [string, ...string[]]
);

const ailabModeSchema = z.object({
  datasetId: datasetIdEnum.describe(
    'The dataset the student trains on. Must be one of the listed ids.'
  ),
  hideSelectLabel: z
    .boolean()
    .describe('Hide the Pick Label screen when true.'),
  hideSave: z.boolean().describe('Hide the Save screen when true.'),
  hideInstructionsOverlay: z
    .boolean()
    .describe('Hide the per-screen instructions overlay when true.'),
  requireAccuracy: z
    .number()
    .min(0)
    .max(100)
    .nullable()
    .describe(
      'Minimum accuracy (0-100) the student must reach before the level can advance. null leaves no requirement.'
    ),
});

type AilabPlanMode = z.infer<typeof ailabModeSchema>;

const ailabPlanSchema = Output.object({
  schema: z.object({
    longInstructions: z
      .string()
      .describe(
        'STUB ONLY. Format as a single literal `TODOs:` line followed by ' +
          '4-8 markdown bullets, each bare content (no `TODO:` prefix on ' +
          'the bullet — the header sets the context once). Name what the ' +
          'student is asked to do across the visible screens. The ' +
          'curriculum author writes the final prose later.'
      ),
    mode: ailabModeSchema,
    dynamicInstructions: z
      .object(
        Object.fromEntries(
          INSTRUCTIONS_KEYS.map(key => [
            key,
            z
              .string()
              .describe(
                `Stub TODO text for the ${key} screen. Use an empty string ` +
                  'when the corresponding screen is hidden via mode flags.'
              ),
          ])
        ) as Record<InstructionsKey, z.ZodString>
      )
      .describe(
        'Per-screen stub instructions. Keys map 1:1 to ML pipeline screens.'
      ),
  }),
});

interface AilabPlan {
  longInstructions: string;
  mode: AilabPlanMode;
  dynamicInstructions: Record<InstructionsKey, string>;
}

export interface AilabGeneration {
  longInstructions: string;
  mode: string;
  dynamicInstructions: string;
  // For the preceding-levels formatter: dataset + enabled screens, so
  // downstream levels can build continuity without re-parsing the mode blob.
  summary: string;
}

const datasetList = AILAB_DATASETS.map(d => `  - ${d.id}: ${d.name}`).join(
  '\n'
);

export async function generateAilabLevel(
  ctx: LevelContext
): Promise<AilabGeneration> {
  const prompt = [
    'You are helping a curriculum author build an "AI Lab" level. AI Lab',
    'walks a student through a fixed machine-learning pipeline: pick a',
    'dataset, look at the data, pick features, train a model, evaluate',
    'accuracy, optionally save the model. The author scopes each level by',
    'choosing a dataset, hiding the screens the level does not need, and',
    'optionally setting an accuracy threshold.',
    '',
    'Assume a middle-school student unless the description below names a',
    'different grade band. Produce three things:',
    '  1. A STUB outline (`longInstructions`) — a single literal `TODOs:`',
    '     line followed by 4-8 markdown bullets, each bare content (no',
    '     `TODO:` prefix on the bullet — the header sets the context once).',
    '     No polished student-facing copy; the curriculum author writes the',
    '     final prose later.',
    '  2. A `mode` blob: dataset id + hide-screen toggles + optional',
    '     requireAccuracy. Hide every screen that is not the focus of this',
    '     level. Pick toy datasets (suffix `_toy`) only when the level is',
    '     about exploring a contrived example; otherwise prefer a real',
    '     dataset whose subject matches the description.',
    '  3. `dynamicInstructions`: one entry per pipeline screen. For',
    '     screens visible in this level, write a single `TODO:` stub. For',
    '     hidden screens, leave the value as an empty string.',
    '',
    'Available datasets (id: display name):',
    datasetList,
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
          '— same dataset across levels, escalating accuracy requirements,',
          'reusing a worked example — but do NOT restate them; only build',
          'the level described last:',
          ctx.precedingLevels,
        ]
      : []),
    '',
    `Description: ${ctx.levelDescription}`,
  ].join('\n');

  const planContext = {level: ctx.levelName, subtask: 'plan'};
  logPrompt(PROMPT_TAGS.AILAB_PLAN, prompt, planContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: ailabPlanSchema,
  });
  const plan = response.output as AilabPlan;
  logResponse(PROMPT_TAGS.AILAB_PLAN, plan, planContext);
  if (!plan.longInstructions?.trim()) {
    throw new Error('Model returned no instructions');
  }

  const mode: Mode = {
    datasets: [plan.mode.datasetId],
    hideSelectLabel: plan.mode.hideSelectLabel,
    hideSave: plan.mode.hideSave,
    hideInstructionsOverlay: plan.mode.hideInstructionsOverlay,
    ...(plan.mode.requireAccuracy !== null
      ? {requireAccuracy: plan.mode.requireAccuracy}
      : {}),
  };

  const visibleScreens = INSTRUCTIONS_KEYS.filter(
    key => (plan.dynamicInstructions[key] || '').trim() !== ''
  );

  return {
    longInstructions: plan.longInstructions.trim(),
    mode: JSON.stringify(mode, null, 2),
    dynamicInstructions: JSON.stringify(plan.dynamicInstructions, null, 2),
    summary: `dataset=${plan.mode.datasetId}; screens=${
      visibleScreens.join(',') || '(none)'
    }${
      plan.mode.requireAccuracy !== null
        ? `; requireAccuracy=${plan.mode.requireAccuracy}`
        : ''
    }`,
  };
}
