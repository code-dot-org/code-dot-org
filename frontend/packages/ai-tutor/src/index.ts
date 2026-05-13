// Public API for @code-dot-org/ai-tutor.
//
// Ports `apps/src/aiTutor/` + `apps/src/aiGateway/` + the polling subset of
// `apps/src/aichat/` into one package. Two LLM call paths intentionally:
//
//   - `generateText(...)` — one-shot, Vercel-SDK-shaped call against the AI
//     Gateway. Use it for short interactions, tool use, structured output
//     schemas. Mirrors `apps/src/aiGateway/generateText.ts`.
//
//   - `postAichatCompletionMessage(...)` — start-then-poll against the
//     Rails `/aichat_request/*` endpoints. Use it for chat turns that may
//     run long (the legacy AI Tutor's path; survives HTTP-edge timeouts).
//
// `<AiTutorChat>` is the package's stateful chat surface — internally uses
// the polling path so it behaves like the legacy AI Tutor.

export {default as AiTutorChat} from './AiTutorChat';
export type {
  AiTutorChatProps,
  AiTutorInjectedMessage,
  AiTutorInjectedTurn,
  AiTutorStepChoice,
  AiTutorStepControls,
} from './AiTutorChat';

export {
  generateText,
  generateTextThroughGateway,
  fetchAccessToken,
  AI_GATEWAY_URL,
  ACCESS_TOKEN_PATH,
} from './aiGateway';

export {
  postAichatCompletionMessage,
  AiRequestExecutionStatus,
  START_CHAT_COMPLETION_URL,
  GET_CHAT_REQUEST_URL,
  type AichatChatMessage,
  type AichatContext,
  type AichatModelParameters,
  type AichatCompletionResult,
  type AiRequestExecutionStatusValue,
  type PostAichatCompletionMessageOptions,
} from './aichatApi';

export {
  buildHiddenContextString,
  makeHiddenContextCallback,
  MAX_CONSOLE_LINES,
  type BuildContextStringOptions,
} from './aiTutorContext';

export {MARKDOWN_OPTIONS} from './markdown';

export {
  defaultPrompts,
  levelPrompts,
  standaloneProjectPrompts,
} from './suggestedPrompts';

export type {
  AiTutorContext,
  AiTutorSuggestedPrompt,
  ChatButtonData,
  ChatTurn,
  MaybePromise,
} from './types';
