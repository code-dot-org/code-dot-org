// Public API for @code-dot-org/aitutor.
//
// See specs/PLAN.md. The message model, the transport seam and its four
// implementations, the panel, what the panel tells the model about a project,
// and the file edits it can offer to make.
//
// The Vite plugin that holds the key is NOT exported here — it is node code,
// and the browser entry must not be able to reach it. It has its own subpath:
// `@code-dot-org/aitutor/dev`.

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
  DashboardTransport,
  type DashboardTransportOptions,
} from './transport/dashboard/DashboardTransport';
export {messagesFor, stillRunning} from './transport/dashboard/executionStatus';

export {
  DirectTransport,
  proxyStatus,
  type DirectTransportOptions,
} from './transport/direct/DirectTransport';
export type {ProxyStatus} from './dev/protocol';

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
  proposalOffered,
  proposalSettled,
  turnCompleted,
  turnFailed,
  type AiTutorState,
} from './session/slice';

export {
  TutorProvider,
  useTutorConfig,
  type TutorConfig,
} from './session/TutorContext';

export {
  answerFrom,
  applicableFiles,
  proposalFrom,
  type ProposalPolicy,
  type TutorProposal,
} from './response/proposal';
export {formatAnswer, formatProposalText} from './response/format';
export {
  answerSchema,
  type Answer,
  type AnswerCodeFile,
  type AnswerSchemaOptions,
  type JsonSchema,
} from './response/schema';

export {useTutor, type Tutor} from './session/useTutor';

export {
  AiChatAccessLevels,
  APPS_WHERE_AI_TUTOR_IS_ESSENTIAL,
  APPS_WITH_ESSENTIAL_AI_CHAT,
  areAiChatToolsEnabled,
  shouldShowAiTutor,
  type AiChatAccessLevel,
} from './access/accessLevels';
export {
  AI_CHAT_NOT_AUTHORIZED_STUDENT,
  AI_CHAT_NOT_AUTHORIZED_TEACHER,
  AI_SETTINGS_SUPPORT_LINK,
  disabledStateFor,
  VERIFIED_TEACHER_SUPPORT_LINK,
  type AccessFacts,
  type AiChatDisabledState,
  type DisabledLink,
} from './access/disabledState';

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
export {default as ChatDisabled} from './components/ChatDisabled';
export {default as Composer} from './components/Composer';
export {default as MessageView} from './components/MessageView';
export {default as ProposalActions} from './components/ProposalActions';
export {default as SuggestedPrompts} from './components/SuggestedPrompts';
export {default as TutorHeaderButtons} from './components/TutorHeaderButtons';
export {default as WaitingAnimation} from './components/WaitingAnimation';
export {failureText} from './components/failureText';
export {strings} from './strings';
