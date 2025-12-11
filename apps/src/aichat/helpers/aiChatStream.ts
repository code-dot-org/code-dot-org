import {createConsumer, Consumer, Subscription} from '@rails/actioncable';

import {AiRequestExecutionStatus} from '@cdo/generated-scripts/sharedConstants';

import {getUpdatedMessages} from '../getUpdatedMessages';
import {
  AichatContext,
  CompletedChatMessage,
  ModelParameters,
  PendingChatMessage,
} from '../types';

type StreamEvent =
  | {event: 'start'; request_id: number}
  | {event: 'delta'; text: string; request_id: number}
  | {event: 'complete'; request_id: number}
  | {event: 'error'; code?: string; details?: string; request_id?: number};

let consumer: Consumer | null = null;

function getConsumer() {
  if (!consumer) {
    consumer = createConsumer();
  }
  return consumer;
}

export function streamAichatCompletionMessage(
  newMessage: PendingChatMessage,
  storedMessages: CompletedChatMessage[],
  modelParameters: ModelParameters,
  aichatContext: AichatContext,
  maxStreamTimeMs: number = 45000,
  callbacks?: {
    onStart?: (requestId: number) => void;
    onDelta?: (delta: string, requestId?: number) => void;
    onComplete?: (fullText: string, requestId?: number) => void;
    onError?: (code?: string, details?: string, requestId?: number) => void;
  }
): Promise<CompletedChatMessage[]> {
  return new Promise((resolve, reject) => {
    const payload = {
      newMessage,
      storedMessages,
      modelParameters,
      aichatContext,
    };

    const consumerInstance = getConsumer();
    let accumulated = '';
    let settled = false;
    let requestId: number | undefined;

    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('Chat completion stream timed out'));
    }, maxStreamTimeMs);

    const subscription: Subscription = consumerInstance.subscriptions.create(
      {channel: 'AichatChannel'},
      {
        received: raw => {
          let data: StreamEvent;
          try {
            data =
              typeof raw === 'string'
                ? (JSON.parse(raw) as StreamEvent)
                : (raw as StreamEvent);
          } catch (_error) {
            return;
          }

          const eventType = data.event;

          switch (eventType) {
            case 'start':
              requestId = data.request_id;
              callbacks?.onStart?.(data.request_id);
              return;

            case 'delta': {
              const deltaText = data.text || '';
              accumulated += deltaText;
              callbacks?.onDelta?.(deltaText, requestId);
              return;
            }

            case 'complete': {
              cleanup();
              const finalRequestId = requestId || Date.now();
              callbacks?.onComplete?.(accumulated, finalRequestId);
              resolve(
                getUpdatedMessages(
                  newMessage,
                  accumulated,
                  AiRequestExecutionStatus.SUCCESS
                ).map(message => ({...message, requestId: finalRequestId}))
              );
              return;
            }

            case 'error': {
              cleanup();
              callbacks?.onError?.(data.code, data.details, requestId);
              reject(new Error(data.details || data.code || 'error'));
              return;
            }
          }
        },
        connected() {
          this.perform('request_completion', payload);
        },
        disconnected() {
          if (!settled) {
            cleanup();
            reject(new Error('Chat completion stream disconnected'));
          }
        },
      }
    );

    function cleanup() {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timeoutId);
      consumerInstance.subscriptions.remove(subscription);
    }
  });
}
