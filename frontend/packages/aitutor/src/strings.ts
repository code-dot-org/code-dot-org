// The panel's copy.
//
// Lifted verbatim from `apps/i18n/common/en_us.json` — the same words the
// legacy panel says, so a student who moves between a studio lab and a
// frontend one is not told two different things about the same failure.
//
// NOT LOCALIZED YET, and that is an open question rather than an oversight
// (specs/PLAN.md §12): the legacy strings come from `commonI18n`, a studio
// singleton backed by a bundle this package has no access to. Keeping them in
// one file is what makes the eventual answer a change to one import.

export const strings = {
  /** Names of the two speakers, for screen readers. */
  userMessage: 'User chat message',
  botMessage: 'AI bot chat message',
  botIconAlt: 'An icon depicting a robot',

  /** What the panel says instead of a message that did not survive. */
  tooPersonal: 'This message has been flagged as too personal.',
  inappropriateUser:
    'This message has been flagged by our content moderation policy. Please try a different message.',
  inappropriateModel:
    'The chatbot response has been flagged by our content moderation policy. Please try a different message',
  inputTooLarge:
    'AI Chat can only process so much information and your last message used too many words. Please clear the chat, or shorten your last message, system prompt, or retrieval(s) to continue chatting.',
  timeout:
    'Oops! Your request is taking a bit too long to answer. You can try again, or clear the chat to start fresh. If you attached any files to your message, consider trying with fewer or smaller files.',
  rateLimited:
    'Oops! Our AI model is busy right now. Please try again in a moment.',
  responseError: 'There was an error getting a response. Please try again.',

  /** The composer. */
  placeholder: 'Ask a question about your code',
  submit: 'Submit',
  stop: 'Stop',
} as const;
