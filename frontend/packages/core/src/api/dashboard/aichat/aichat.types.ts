import type {z} from 'zod';

import type {
  ChatRequestSchema,
  StartChatCompletionSchema,
} from './aichat.schemata';

export type StartChatCompletion = z.infer<typeof StartChatCompletionSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/**
 * Which product is asking.
 *
 * Mirrors `SharedConstants::AI_CHAT_CLIENT_TYPES`. The server reads it to pick
 * a read timeout and to record what the request was for.
 */
export const AiChatClientTypes = {
  AI_CHAT_LAB: 'ai-chat-lab',
  AI_TUTOR: 'ai-tutor',
  FLOW_LAB: 'flow-lab',
  LESSON_DEEP_DIVE: 'lesson-deep-dive',
} as const;

export type AiChatClientType =
  (typeof AiChatClientTypes)[keyof typeof AiChatClientTypes];

/** Seconds the server allows a completion, per client type. */
export const AiChatReadTimeouts: Record<AiChatClientType, number> = {
  'ai-chat-lab': 30,
  'ai-tutor': 30,
  'flow-lab': 60,
  'lesson-deep-dive': 60,
};

/** Where a request is coming from, as the completion endpoint wants it. */
export interface AichatContext {
  clientType: AiChatClientType;
  currentLevelId?: number;
  scriptId?: number;
  channelId?: string;
  lessonId?: number;
}
