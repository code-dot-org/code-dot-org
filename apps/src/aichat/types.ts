import {LevelProperties} from '@cdo/apps/lab2/types';
import {
  AiTutorInteractionStatus as AITutorInteractionStatus,
  PiiTypes as PII,
} from '@cdo/apps/util/sharedConstants';

export type AITutorInteractionStatusType =
  (typeof AITutorInteractionStatus)[keyof typeof AITutorInteractionStatus];

export {PII, AITutorInteractionStatus};

export type ChatCompletionMessage = {
  id: number;
  role: Role;
  chatMessageText: string;
  status: AITutorInteractionStatusType;
  timestamp?: string;
};

export enum Role {
  ASSISTANT = 'assistant',
  USER = 'user',
  SYSTEM = 'system',
}
export interface AichatLevelProperties extends LevelProperties {
  // --- DEPRECATED - used for old AI Chat
  systemPrompt: string;
  botTitle?: string;
  botDescription?: string;
  // ---

  /**
   * Initial AI customizations set by the level.
   * For each field, levelbuilders may define the initial default value,
   * and visibility (hidden, readonly, or editable).
   * Visibility is not editable by the student; students can only change the value if it is set to editable.
   */
  initialAiCustomizations?: LevelAiCustomizations;
}

/** AI customizations for student chat bots */
export interface AiCustomizations {
  botName: string;
  temperature: number;
  systemPrompt: string;
  retrievalContexts: string[];
  modelCardInfo?: ModelCardInfo;
}

/** Chat bot Model Card information */
export interface ModelCardInfo {
  description: string;
  intendedUse: string;
  limitationsAndWarnings: string;
  testingAndEvaluation: string;
  askAboutTopics: string[];
}

// Visibility for AI customization fields set by levelbuilders.
type Visibility = 'hidden' | 'readonly' | 'editable';

/**
 * Level-defined AI customizations for student chat bots set by levelbuilders on the level's properties.
 * Each field is the same as AiCustomizations, but with an additional visibility property.
 */
export type LevelAiCustomizations = {
  [key in keyof AiCustomizations]: {
    value: AiCustomizations[key];
    visibility: Visibility;
  };
} & {
  /** The initial panel to show when displaying the level */
  initialPanel?: 'edit' | 'presentation';
  /**
   * If the student can go back to the editing panel after starting on the presentation panel.
   * Only applies if initialPanel is 'presentation'.
   */
  canGoBackToEditing?: boolean;
};
