import {Output} from 'ai';
import z from 'zod/v3';

import {ModelParameters} from '@cdo/apps/aichat/types/model';
import {
  FieldVisibilities,
  Visibility,
} from '@cdo/apps/aichatLab/types/customizations';
import {LevelAichatSettings} from '@cdo/apps/aichatLab/types/levelProperties';
import {generateText} from '@cdo/apps/aiGateway';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {LevelContext} from '../../curriculum-generator/ai/context';
import {
  getTextModel,
  logPrompt,
  logResponse,
  PROMPT_TAGS,
} from '../../curriculum-generator/ai/shared';

// Presets fix every field of LevelAichatSettings except the prompts
// (systemPrompt + levelSystemPrompt) and, for Bot Builder, the model card
// — those are AI-generated per level. responseJsonSchema is omitted
// because no shipped preset varies it.
type PresetDefaultKey = 'selectedModelId' | 'temperature';
type PresetVisibilityKey =
  | 'selectedModelId'
  | 'temperature'
  | 'systemPrompt'
  | 'retrievalContexts'
  | 'modelCardInfo';

export interface AichatPreset {
  id: AichatPresetId;
  label: string;
  description: string;
  defaults: Pick<ModelParameters, PresetDefaultKey>;
  visibilities: Pick<FieldVisibilities, PresetVisibilityKey>;
  hidePresentationPanel: LevelAichatSettings['hidePresentationPanel'];
  multimodalEnabled: NonNullable<LevelAichatSettings['multimodalEnabled']>;
  promptForModelCard: boolean;
}

export const AICHAT_PRESET_IDS = [
  'explore',
  'tutor',
  'evaluation',
  'domainExpert',
  'botBuilder',
] as const;

export type AichatPresetId = (typeof AICHAT_PRESET_IDS)[number];

export const AICHAT_PRESETS: Record<AichatPresetId, AichatPreset> = {
  explore: {
    id: 'explore',
    label: 'Explore',
    description:
      'Free-form chat with a persona-driven bot. Everything hidden; ' +
      'the system prompt sets the bot identity.',
    defaults: {
      selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
      temperature: 0.5,
    },
    visibilities: {
      selectedModelId: Visibility.HIDDEN,
      temperature: Visibility.HIDDEN,
      systemPrompt: Visibility.HIDDEN,
      retrievalContexts: Visibility.HIDDEN,
      modelCardInfo: Visibility.HIDDEN,
    },
    hidePresentationPanel: false,
    multimodalEnabled: false,
    promptForModelCard: false,
  },
  tutor: {
    id: 'tutor',
    label: 'Tutor',
    description:
      'Bot guides the student through a specific skill. Lower ' +
      'temperature for consistency; safety/scope in levelSystemPrompt.',
    defaults: {
      selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
      temperature: 0.3,
    },
    visibilities: {
      selectedModelId: Visibility.HIDDEN,
      temperature: Visibility.HIDDEN,
      systemPrompt: Visibility.HIDDEN,
      retrievalContexts: Visibility.HIDDEN,
      modelCardInfo: Visibility.HIDDEN,
    },
    hidePresentationPanel: false,
    multimodalEnabled: false,
    promptForModelCard: false,
  },
  evaluation: {
    id: 'evaluation',
    label: 'Evaluation',
    description:
      "Bot evaluates the student's work or analyses an artifact. " +
      'System prompt shown read-only so the student knows the criteria. ' +
      'Multimodal on so the student can upload images/PDFs.',
    defaults: {
      selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
      temperature: 0.3,
    },
    visibilities: {
      selectedModelId: Visibility.HIDDEN,
      temperature: Visibility.HIDDEN,
      systemPrompt: Visibility.READONLY,
      retrievalContexts: Visibility.HIDDEN,
      modelCardInfo: Visibility.HIDDEN,
    },
    hidePresentationPanel: false,
    multimodalEnabled: true,
    promptForModelCard: false,
  },
  domainExpert: {
    id: 'domainExpert',
    label: 'Domain Expert',
    description:
      'Bot constrained to a single subject. Presentation panel hidden ' +
      'so the chat fills the workspace; system prompt visible read-only.',
    defaults: {
      selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
      temperature: 0.3,
    },
    visibilities: {
      selectedModelId: Visibility.HIDDEN,
      temperature: Visibility.HIDDEN,
      systemPrompt: Visibility.READONLY,
      retrievalContexts: Visibility.HIDDEN,
      modelCardInfo: Visibility.HIDDEN,
    },
    hidePresentationPanel: true,
    multimodalEnabled: false,
    promptForModelCard: false,
  },
  botBuilder: {
    id: 'botBuilder',
    label: 'Bot Builder',
    description:
      'Student designs their own bot — every customization editable, ' +
      'model card on. The starter prompt and model card are placeholders ' +
      'the student rewrites.',
    defaults: {
      selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
      temperature: 0.5,
    },
    visibilities: {
      selectedModelId: Visibility.EDITABLE,
      temperature: Visibility.EDITABLE,
      systemPrompt: Visibility.EDITABLE,
      retrievalContexts: Visibility.HIDDEN,
      modelCardInfo: Visibility.EDITABLE,
    },
    hidePresentationPanel: false,
    multimodalEnabled: false,
    promptForModelCard: true,
  },
};

const baseAichatSchema = z.object({
  longInstructions: z
    .string()
    .describe(
      'STUB ONLY. Format as a single literal `TODOs:` line followed by ' +
        '4-8 markdown bullets, each bare content (no `TODO:` prefix on ' +
        'the bullet — the header sets the context once). Name what the ' +
        'student is asked to try with the bot. The curriculum author ' +
        'writes the final prose later.'
    ),
  systemPrompt: z
    .string()
    .describe(
      "The bot's system prompt — what persona/role it takes and what it " +
        "knows/refuses. This drives the bot's behavior; it must be a real, " +
        'runnable prompt, not a stub.'
    ),
  levelSystemPrompt: z
    .string()
    .describe(
      "Hidden safety/scope rules appended to the bot's system prompt. " +
        'Use to add length limits, citation requirements, refusal rules, ' +
        'or other guardrails. Stub format is fine here: a single literal ' +
        '`TODOs:` line followed by bare-content bullets.'
    ),
});

const modelCardSchema = z.object({
  botName: z.string(),
  description: z.string(),
  intendedUse: z.string(),
  limitationsAndWarnings: z.string(),
  testingAndEvaluation: z.string(),
  exampleTopics: z.array(z.string()),
});

const aichatPlanSchema = Output.object({
  schema: baseAichatSchema.extend({
    modelCard: modelCardSchema
      .optional()
      .describe(
        'Bot Builder preset only: placeholder model card the student ' +
          'edits. Omit for every other preset.'
      ),
  }),
});

export interface AichatGeneration {
  longInstructions: string;
  aichatSettings: LevelAichatSettings;
  summary: string;
}

function settingsFromPresetAndPlan(
  preset: AichatPreset,
  plan: {
    systemPrompt: string;
    levelSystemPrompt: string;
    modelCard?: {
      botName: string;
      description: string;
      intendedUse: string;
      limitationsAndWarnings: string;
      testingAndEvaluation: string;
      exampleTopics: string[];
    };
  }
): LevelAichatSettings {
  const emptyModelCard = {
    botName: '',
    description: '',
    intendedUse: '',
    limitationsAndWarnings: '',
    testingAndEvaluation: '',
    exampleTopics: [],
    isPublished: false,
  };
  const modelCard =
    preset.promptForModelCard && plan.modelCard
      ? {...plan.modelCard, isPublished: false}
      : emptyModelCard;

  return {
    initialCustomizations: {
      selectedModelId: preset.defaults.selectedModelId,
      temperature: preset.defaults.temperature,
      systemPrompt: plan.systemPrompt,
      retrievalContexts: [],
      modelCardInfo: modelCard,
    },
    visibilities: {
      ...preset.visibilities,
      responseJsonSchema: Visibility.HIDDEN,
    },
    levelSystemPrompt: plan.levelSystemPrompt,
    hidePresentationPanel: preset.hidePresentationPanel,
    availableModelIds: [preset.defaults.selectedModelId],
    multimodalEnabled: preset.multimodalEnabled,
  };
}

export async function generateAichatLevel(
  ctx: LevelContext,
  presetId: AichatPresetId
): Promise<AichatGeneration> {
  const preset = AICHAT_PRESETS[presetId];
  const prompt = [
    `You are helping a curriculum author build an "AI Chat" level using the`,
    `"${preset.label}" preset.`,
    preset.description,
    '',
    'Assume a middle-school student unless the description below names a',
    'different grade band. Produce:',
    '  - longInstructions: STUB only. Format as a single literal `TODOs:`',
    '    line followed by 4-8 markdown bullets, each bare content (no',
    '    `TODO:` prefix on the bullet). The curriculum author writes',
    '    student-facing prose later.',
    "  - systemPrompt: a real, runnable prompt that defines the bot's persona,",
    '    knowledge, and refusal rules for this level. This is the bot itself —',
    '    NOT a stub.',
    '  - levelSystemPrompt: hidden safety/scope rules appended to systemPrompt.',
    '    The same stub format is acceptable here (TODOs: header + bare',
    '    bullets); the curriculum author will tune.',
    ...(preset.promptForModelCard
      ? [
          '  - modelCard: placeholder strings the student edits. Brief and',
          '    generic; the point is that they have something to overwrite.',
        ]
      : []),
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
          '— recurring persona, callbacks, building on earlier discussions —',
          'but do NOT restate them; only build the level described last:',
          ctx.precedingLevels,
        ]
      : []),
    '',
    `Description: ${ctx.levelDescription}`,
  ].join('\n');

  const planContext = {level: ctx.levelName, subtask: `plan-${presetId}`};
  logPrompt(PROMPT_TAGS.AICHAT_PLAN, prompt, planContext);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: aichatPlanSchema,
  });
  const plan = response.output as {
    longInstructions: string;
    systemPrompt: string;
    levelSystemPrompt: string;
    modelCard?: {
      botName: string;
      description: string;
      intendedUse: string;
      limitationsAndWarnings: string;
      testingAndEvaluation: string;
      exampleTopics: string[];
    };
  };
  logResponse(PROMPT_TAGS.AICHAT_PLAN, plan, planContext);
  if (!plan.longInstructions?.trim()) {
    throw new Error('Model returned no instructions');
  }
  if (!plan.systemPrompt?.trim()) {
    throw new Error('Model returned no systemPrompt');
  }

  const aichatSettings = settingsFromPresetAndPlan(preset, plan);

  // Only a gist forward: the full system prompt is the persona itself,
  // not something for the next level to imitate.
  const summary = `preset=${preset.id}; system="${plan.systemPrompt
    .replace(/\s+/g, ' ')
    .slice(0, 120)}…"`;

  return {
    longInstructions: plan.longInstructions.trim(),
    aichatSettings,
    summary,
  };
}
