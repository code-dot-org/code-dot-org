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

// Closed set of dynamic_instructions slots that the AI Lab UI looks up by
// key. Slots map 1:1 to screens in the ML pipeline: pick a dataset, see
// the data, pick features, train, evaluate, save. Anything not in this
// list is dropped — the legacy editor's textarea is a JSON blob with the
// exact same keys.
const AILAB_STEP_KEYS = [
  'selectDataset',
  'uploadedDataset',
  'selectedDataset',
  'dataDisplayLabel',
  'dataDisplayFeatures',
  'selectedFeatureNumerical',
  'selectedFeatureCategorical',
  'trainModel',
  'generateResults',
  'results',
  'resultsDetails',
  'saveModel',
  'modelSummary',
] as const;

type AilabStepKey = (typeof AILAB_STEP_KEYS)[number];

const datasetIdEnum = z.enum(
  AILAB_DATASETS.map(d => d.id) as unknown as [string, ...string[]]
);

// The mode JSON the AI Lab editor reads. Hide-toggles collapse the UI to
// only the screens that matter for this level; the legacy editor renders
// these as a JSON textarea, so we serialize back to a string at the save
// boundary.
const ailabModeSchema = z.object({
  datasetId: datasetIdEnum.describe(
    'The dataset the student trains on. Must be one of the listed ids.'
  ),
  hideSelectLabel: z
    .boolean()
    .describe('Hide the Pick Label screen when true.'),
  hideSpecifyColumns: z
    .boolean()
    .describe('Hide the Pick Columns screen when true.'),
  hideSelectTrainer: z
    .boolean()
    .describe('Hide the Pick Trainer screen when true.'),
  hideChooseReserve: z
    .boolean()
    .describe('Hide the Reserve Data screen when true.'),
  hideModelCard: z.boolean().describe('Hide the Model Card screen when true.'),
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

// Stub instructions, like Web Lab 2 — bullet-point TODOs the curriculum
// author flesh out by hand. Per-step text lives in dynamicInstructions,
// keyed by screen. Only emit text for the screens this level actually
// uses (i.e. not hidden); leave the rest as the empty string so the
// stored JSON shape stays the canonical one.
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
          AILAB_STEP_KEYS.map(key => [
            key,
            z
              .string()
              .describe(
                `Stub TODO text for the ${key} screen. Use an empty string ` +
                  'when the corresponding screen is hidden via mode flags.'
              ),
          ])
        ) as Record<AilabStepKey, z.ZodString>
      )
      .describe(
        'Per-screen stub instructions. Keys map 1:1 to ML pipeline screens.'
      ),
  }),
});

export interface AilabGeneration {
  longInstructions: string;
  mode: string;
  dynamicInstructions: string;
  // Plain-text rendering of which screens are enabled and which datasets the
  // level uses. Surfaced in the per-level preceding-levels context so
  // downstream levels can keep continuity (same dataset, escalating accuracy
  // requirements, etc.) without re-parsing the serialized mode blob.
  summary: string;
}

const datasetList = AILAB_DATASETS.map(d => `  - ${d.id}: ${d.name}`).join(
  '\n'
);

// Single call: ask Claude for a stub instruction outline + the JSON mode
// blob + per-screen stub text. The AI picks a dataset from a closed enum
// of ids; we serialize mode and dynamicInstructions back into JSON
// strings at the save boundary because that's the shape the legacy AI
// Lab editor stores.
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
  const plan = response.output as {
    longInstructions: string;
    mode: {
      datasetId: string;
      hideSelectLabel: boolean;
      hideSpecifyColumns: boolean;
      hideSelectTrainer: boolean;
      hideChooseReserve: boolean;
      hideModelCard: boolean;
      hideSave: boolean;
      hideInstructionsOverlay: boolean;
      requireAccuracy: number | null;
    };
    dynamicInstructions: Record<AilabStepKey, string>;
  };
  logResponse(PROMPT_TAGS.AILAB_PLAN, plan, planContext);
  if (!plan.longInstructions?.trim()) {
    throw new Error('Model returned no instructions');
  }

  // The AI Lab editor stores mode and dynamic_instructions as serialized
  // JSON strings (the legacy textareas). Build the actual record the
  // editor would write — datasets is an array of one in nearly every
  // existing level — and stringify on the way out.
  const modeRecord: Record<string, unknown> = {
    datasets: [plan.mode.datasetId],
    hideSelectLabel: plan.mode.hideSelectLabel,
    hideSpecifyColumns: plan.mode.hideSpecifyColumns,
    hideSelectTrainer: plan.mode.hideSelectTrainer,
    hideChooseReserve: plan.mode.hideChooseReserve,
    hideModelCard: plan.mode.hideModelCard,
    hideSave: plan.mode.hideSave,
    hideInstructionsOverlay: plan.mode.hideInstructionsOverlay,
  };
  if (plan.mode.requireAccuracy !== null) {
    modeRecord.requireAccuracy = plan.mode.requireAccuracy;
  }

  // List the visible screens so the preceding-levels formatter can drop
  // a one-line summary into the context block.
  const visibleScreens = AILAB_STEP_KEYS.filter(
    key => (plan.dynamicInstructions[key] || '').trim() !== ''
  );

  return {
    longInstructions: plan.longInstructions.trim(),
    mode: JSON.stringify(modeRecord, null, 2),
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
