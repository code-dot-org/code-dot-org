import {ModelParameters} from '@cdo/apps/aichat/types/model';
import {
  FieldVisibilities,
  Visibility,
} from '@cdo/apps/aichatLab/types/customizations';
import {LevelAichatSettings} from '@cdo/apps/aichatLab/types/levelProperties';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

// Presets fix every field of LevelAichatSettings except the prompts
// (systemPrompt + levelSystemPrompt) and, for Bot Builder, the model card
// — those are AI-generated per level. responseJsonSchema is omitted
// because no shipped preset varies it.
export interface AichatPreset {
  id: AichatPresetId;
  label: string;
  description: string;
  defaults: Omit<
    ModelParameters,
    'systemPrompt' | 'retrievalContexts' | 'responseJsonSchema'
  >;
  visibilities: Omit<FieldVisibilities, 'responseJsonSchema'>;
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

export const DEFAULT_AICHAT_PRESET: AichatPresetId = 'explore';

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
