export const DEFAULT_THREAD_TITLE = 'Unnamed chat';
export const DEFAULT_INITIAL_CHAT_MESSAGE = `Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me.`;

// Optional way to delineate the type/usage of a thread to tailor what we want, such as:
// - Do or don't show suggested prompts
// - Start with a more specific initial message
export type ThreadTypeFields = {
  initialMessage: string;
  showSuggestedPrompts: boolean;
};
export const THREAD_TYPES: {[threadType: string]: ThreadTypeFields} = {
  default: {
    initialMessage: DEFAULT_INITIAL_CHAT_MESSAGE,
    showSuggestedPrompts: true,
  },
  lessonSummaryHelp: {
    initialMessage:
      "Let's work together to prep for this lesson! What would you like help with?",
    showSuggestedPrompts: false,
  },
};
