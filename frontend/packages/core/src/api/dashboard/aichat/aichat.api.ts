import type {Transport} from '../../transports/types';

import {ChatRequestSchema, StartChatCompletionSchema} from './aichat.schemata';
import type {
  AichatContext,
  ChatRequest,
  StartChatCompletion,
} from './aichat.types';

/**
 * The chat completion endpoints.
 *
 * Two calls, because a completion is not a request/response: the server queues
 * the work and hands back an id, and the caller asks about it until it is done.
 * The LOOP is not here — it belongs to whoever is waiting, and how long to wait
 * and what to do about a timeout are decisions this layer should not make.
 */
export function createAichatApi(transport: Transport) {
  return {
    /**
     * POST /aichat_request/start_chat_completion
     *
     * `newMessage`, `storedMessages` and `modelParameters` are passed through
     * as the caller shaped them: their contents belong to the chat client, and
     * a schema here would be a second place to keep them in step.
     */
    async startChatCompletion(params: {
      newMessage: object;
      storedMessages: object[];
      modelParameters: object;
      aichatContext: AichatContext;
    }): Promise<StartChatCompletion> {
      const response = await transport.request<unknown>({
        method: 'POST',
        url: '/aichat_request/start_chat_completion',
        body: params,
      });

      return StartChatCompletionSchema.parse(response);
    },

    /** GET /aichat_request/chat_request/:requestId */
    async getChatRequest(params: {requestId: number}): Promise<ChatRequest> {
      const response = await transport.request<unknown>({
        method: 'GET',
        url: `/aichat_request/chat_request/${params.requestId}`,
      });

      return ChatRequestSchema.parse(response);
    },
  };
}
