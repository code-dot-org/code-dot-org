// Public API for @code-dot-org/aitutor.
//
// See specs/PLAN.md. Milestones 1 to 3: the message model, the transport seam,
// a transport that answers from a recording, the panel, and what the panel
// tells the model about the project. Nothing here talks to a server yet.

export {
  AiInteractionStatus,
  isUserTurnFailure,
  type CompletedStatus,
} from './model/status';

export {
  Role,
  isCompletedMessage,
  isPendingMessage,
  type ChatMessage,
  type CompletedMessage,
  type PendingMessage,
} from './model/messages';

export type {
  TutorReply,
  TutorRequest,
  TutorSessionInfo,
  TutorTransport,
} from './transport/types';

export {
  FixtureExhausted,
  FixtureTransport,
  type FixtureTransportOptions,
} from './transport/fixture/FixtureTransport';

export {
  matches,
  parseTranscript,
  type FixtureReply,
  type FixtureTurn,
  type Matcher,
  type Transcript,
} from './transport/fixture/transcript';

export {default as aiTutorSlice} from './session/slice';
export {
  conversationCleared,
  messageSent,
  turnCompleted,
  turnFailed,
  type AiTutorState,
} from './session/slice';

export {
  TutorProvider,
  useTutorConfig,
  type TutorConfig,
  type TutorProposal,
} from './session/TutorContext';

export {useTutor, type Tutor} from './session/useTutor';

export {
  codeBlock,
  hiddenContextFrom,
  MAX_CONSOLE_LINES,
} from './context/hiddenContext';
export type {AiTutorContext} from './context/types';

export {
  defaultPrompts,
  levelPrompts,
  promptsFor,
  standaloneProjectPrompts,
  type SuggestedPrompt,
} from './prompts/suggestedPrompts';

export {default as AiTutorPanel} from './components/AiTutorPanel';
export type {AiTutorPanelProps} from './components/AiTutorPanel';
export {default as Composer} from './components/Composer';
export {default as MessageView} from './components/MessageView';
export {default as SuggestedPrompts} from './components/SuggestedPrompts';
export {default as WaitingAnimation} from './components/WaitingAnimation';
export {failureText} from './components/failureText';
export {strings} from './strings';
