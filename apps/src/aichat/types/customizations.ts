import {ValueOf} from '@cdo/apps/types/utils';
import {
  AiChatClientTypes,
  AiChatModelIds,
} from '@cdo/generated-scripts/sharedConstants';
import modelsJson from '@cdo/static/aichat/modelDescriptions.json';

/**
 * Model parameters provided to the LLM chat endpoint.
 */
export interface ModelParameters {
  selectedModelId: ValueOf<typeof AiChatModelIds>;
  temperature: number;
  systemPrompt: string;
  retrievalContexts: string[];
}

/**
 * Model customizations a student can make on an AI Chat Lab level.
 * These include model parameters and model card information.
 */
export interface AiCustomizations extends ModelParameters {
  modelCardInfo: ModelCardInfo;
}

export type FieldVisibilities = {[key in keyof AiCustomizations]: Visibility};

/** Chat bot Model Card information */
export interface ModelCardInfo {
  botName: string;
  description: string;
  intendedUse: string;
  limitationsAndWarnings: string;
  testingAndEvaluation: string;
  exampleTopics: string[];
  isPublished: boolean;
}

/** Metadata about a given model, common across all aichat levels */
export type ModelDescription = (typeof modelsJson)[number] & {
  id: ValueOf<typeof AiChatModelIds>;
};

// Visibility for AI customization fields set by levelbuilders.
export enum Visibility {
  HIDDEN = 'hidden',
  READONLY = 'readonly',
  EDITABLE = 'editable',
}

export type AiChatClientType = ValueOf<typeof AiChatClientTypes>;

/**
 * Context provided to AI chat API endpoints.
 */
export type AichatContext = {
  clientType: AiChatClientType;
  currentLevelId: number | null;
  scriptId: number | null;
  channelId: string | undefined;
};

export enum ViewMode {
  EDIT = 'edit-mode',
  PRESENTATION = 'presentation-mode',
}

// The type of save action being performed (customization update, publish, model card save, etc).
export type SaveType = 'updateChatbot' | 'publishModelCard' | 'saveModelCard';

export type SaveErrorType =
  | 'toxicityError'
  | 'permissionsError'
  | 'genericError';

export interface SaveError {
  type: SaveErrorType;
  message?: string;
}
