import {ModelParameters} from '@cdo/apps/aichat/types';

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

// Visibility for AI customization fields set by levelbuilders.
export enum Visibility {
  HIDDEN = 'hidden',
  READONLY = 'readonly',
  EDITABLE = 'editable',
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
