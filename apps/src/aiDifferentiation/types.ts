import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  AiDiffContext,
  AiDiffArtifactType,
  AiInteractionStatus,
} from '@cdo/generated-scripts/sharedConstants';

import {ResponseValidator} from '../util/HttpClient';

import {EXIT_TICKET_PROMPT, LESSON_HOOK_PROMPT} from './predefinedPrompts';

export type LessonHook = {
  comment: string;
  introduction: string;
  activity: string;
  wrap_up: string;
};

export type ExitTicket = {
  comment: string;
  exit_ticket_items: ExitTicketItem[];
};

export type ExitTicketItem = {
  type: string;
  question: string;
  answer: string;
};

export type AiArtifact = {
  id: number;
  title: string;
  updatedAt: Date;
  type: (typeof AiDiffArtifactType)[keyof typeof AiDiffArtifactType];
  content: object;
  url: string;
};

export type ChatTextMessage = {
  role: Role;
  chatMessageText: string;
  status: (typeof AiInteractionStatus)[keyof typeof AiInteractionStatus];
  id?: number;
  isArtifactCandidate?: boolean;
  artifactCandidateType?: (typeof AiDiffArtifactType)[keyof typeof AiDiffArtifactType];
  isArtifact?: boolean;
};

export type ChatPrompt = {
  label: string;
  prompt: string;
  artifactCandidateType?: (typeof AiDiffArtifactType)[keyof typeof AiDiffArtifactType];
  response?: string;
  followUpPrompts?: ChatPrompt[];
};

export interface PromptMenuConfiguration {
  initialMessage: string;
  suggestedPrompts: ChatPrompt[];
}

type ServerChatThread = {
  id: number;
  title: string;
  updated_at: Date;
  context_type: (typeof AiDiffContext)[keyof typeof AiDiffContext];
  has_artifact: boolean;
  messages?: [ChatItem];
  artifact?: ServerAiArtifact;
};

type ServerChatMessage = {
  id: number;
  status: string;
  role: string;
  content: string;
  updated_at: Date;
  is_preset: boolean;
  preset_chip_text: string;
  is_artifact_candidate: boolean;
  artifact_candidate_type: string;
};

type ServerAiArtifact = {
  id: number;
  title: string;
  updated_at: Date;
  type: (typeof AiDiffArtifactType)[keyof typeof AiDiffArtifactType];
  content: object;
  url: string;
};

export type ChatThread = {
  id: number;
  title: string;
  updatedAt: Date;
  contextType: (typeof AiDiffContext)[keyof typeof AiDiffContext];
  hasArtifact: boolean;
  messages?: [ChatItem];
  artifact?: AiArtifact;
};

export type ChatItem = ChatTextMessage | ChatPrompt[];

export type SuggestPromptsType =
  | 'plan'
  | 'create'
  | 'support'
  | 'apcsp'
  | 'innovator'
  | 'codeWhisperer'
  | 'bridgeBuilder'
  | 'storyteller'
  | 'communityArchitect'
  | 'leadLearner';

export type Context = {
  type: (typeof AiDiffContext)[keyof typeof AiDiffContext];
  levelId?: number;
  lessonId?: number;
  unitId?: number;
  courseId?: number;
  viewAsUserId?: number;
};

function messageValidatorHelper(
  response: Record<string, unknown> | unknown[]
): ChatTextMessage {
  if (Array.isArray(response)) {
    throw new Error('Source response should be an object (received array).');
  }
  const serverMsg = response as ServerChatMessage;
  let inferredArtifactType = undefined;
  if (serverMsg.role === Role.USER && serverMsg.is_preset) {
    if (serverMsg.preset_chip_text === EXIT_TICKET_PROMPT.label) {
      inferredArtifactType = AiDiffArtifactType.EXIT_TICKET;
    } else if (serverMsg.preset_chip_text === LESSON_HOOK_PROMPT.label) {
      inferredArtifactType = AiDiffArtifactType.LESSON_HOOK;
    }
  }
  return {
    role: serverMsg.role,
    chatMessageText:
      serverMsg.is_preset && serverMsg.preset_chip_text
        ? serverMsg.preset_chip_text
        : serverMsg.content,
    status:
      serverMsg.status === undefined
        ? AiInteractionStatus.OK
        : serverMsg.status,
    id: serverMsg.id,
    isArtifactCandidate: serverMsg.is_artifact_candidate,
    artifactCandidateType:
      serverMsg.artifact_candidate_type || inferredArtifactType,
  } as ChatTextMessage;
}

function artifactValidatorHelper(
  response: Record<string, unknown>
): AiArtifact {
  const serverMsg = response as ServerAiArtifact;
  return {
    id: serverMsg.id,
    title: serverMsg.title,
    updatedAt: new Date(serverMsg.updated_at),
    type: serverMsg.type,
    content: serverMsg.content,
    url: serverMsg.url,
  } as AiArtifact;
}

const chatThreadValidator: ResponseValidator<ChatThread[]> = bodyJson => {
  if (!Array.isArray(bodyJson)) {
    throw new Error('Expected an array of chat events');
  }

  // Filter out threads that don't have a context defined
  const serverThreads = bodyJson.filter(
    thread => (thread as ServerChatThread).context_type !== null
  ) as ServerChatThread[];

  for (const serverThread of serverThreads) {
    if (serverThread.id === undefined) {
      throw Error('id');
    }
  }

  const threads: ChatThread[] = serverThreads.map(serverThread => {
    return {
      id: serverThread.id,
      title: serverThread.title,
      updatedAt: new Date(serverThread.updated_at),
      contextType: serverThread.context_type,
      hasArtifact: serverThread.has_artifact,
      messages: serverThread.messages,
      artifact: serverThread.artifact,
    } as ChatThread;
  });

  return threads;
};

const chatThreadMessagesValidator: ResponseValidator<ChatThread> = bodyJson => {
  const serverThread = bodyJson as ServerChatThread;
  const serverMessages = serverThread.messages as ChatTextMessage[];

  const messages: ChatTextMessage[] = serverMessages.map(serverMessage => {
    return messageValidatorHelper(serverMessage);
  });

  const artifact: AiArtifact | undefined = serverThread.artifact
    ? artifactValidatorHelper(serverThread.artifact)
    : undefined;

  return {
    id: serverThread.id,
    title: serverThread.title,
    updatedAt: new Date(serverThread.updated_at),
    contextType: serverThread.context_type,
    messages: messages,
    artifact: artifact,
  } as ChatThread;
};

export {artifactValidatorHelper};
export {chatThreadValidator};
export {chatThreadMessagesValidator};
