import {SUGGESTED_PROMPTS_FOR_SELECTION} from './predefinedPrompts';

export const DEFAULT_THREAD_TITLE = 'Unnamed chat';

// Optional way to delineate the type/usage of a thread to tailor what we want, such as:
// - Do or don't show suggested prompts
// - Start with a more specific initial message
export type ThreadTypeFields = {
  initialMessage: string;
  showSuggestedPrompts: boolean;
};
export const THREAD_TYPES: {[threadType: string]: ThreadTypeFields} = {
  default: {
    initialMessage: SUGGESTED_PROMPTS_FOR_SELECTION['default'].initialMessage,
    showSuggestedPrompts: true,
  },
  lessonSummaryHelp: {
    initialMessage:
      "Let's work together to prep for this lesson! What would you like help with?",
    showSuggestedPrompts: false,
  },
};
