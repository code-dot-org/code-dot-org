/**
 * Types for the AI Tutor package. Ported from `apps/src/aiTutor/types.ts`
 * plus the `aichat` `ChatButtonData` shape (so suggestedPrompts.ts can keep
 * the legacy field names).
 */

/** Per-level / per-project context the tutor reads before answering. */
export interface AiTutorContext {
  sourceCode?: string;
  hiddenSourceCode?: string;
  readOnlySourceCode?: string;
  validationContents?: string;
  validationResults?: string;
  longInstructions?: string;
  documentation?: string;
  documentationLocation?: string;
  consoleOutput?: string;
  hasRun?: boolean;
  hasEdited?: boolean;
}

export type MaybePromise<T> = T | Promise<T>;

/** A canned-prompt chip shown above the chat input. */
export interface ChatButtonData {
  id: string;
  icon?: {iconName: string};
  label: string;
  value: string;
  analyticsProperties?: {cannedPrompt: string};
}

/** Convenience alias for `ChatButtonData` matching the legacy name. */
export type AiTutorSuggestedPrompt = ChatButtonData;

/** A single turn in the conversation log. */
export type ChatTurn =
  | {role: 'tutor'; body: string}
  | {role: 'student'; body: string};
