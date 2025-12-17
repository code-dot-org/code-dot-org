import {createConsumer, Consumer, Subscription} from '@rails/actioncable';

import {createUuid} from '@cdo/apps/utils';
import {AiRequestExecutionStatus} from '@cdo/generated-scripts/sharedConstants';

import {
  AichatContext,
  CompletedChatMessage,
  ExecutionStatus,
  ModelParameters,
  PendingChatMessage,
} from '../types';

import {getUpdatedMessages} from './getUpdatedMessages';

type StreamEvent =
  | {event: 'start'; request_id: number}
  | {event: 'delta'; text: string; request_id: number; seq: number}
  | {event: 'complete'; text: string; request_id: number}
  | {
      event: 'error';
      code: ExecutionStatus;
      details?: string;
      request_id: number;
    };

let consumer: Consumer;

function getConsumer() {
  if (!consumer) {
    consumer = createConsumer();
  }
  return consumer;
}

export function streamAichatCompletionMessage({
  newMessage,
  storedMessages,
  modelParameters,
  aichatContext,
  maxStreamTimeMs,
  streamCallbacks,
}: {
  newMessage: PendingChatMessage;
  storedMessages: CompletedChatMessage[];
  modelParameters: ModelParameters;
  aichatContext: AichatContext;
  maxStreamTimeMs: number;
  streamCallbacks: {
    onStart?: (requestId: number) => void;
    onDelta?: (delta: string) => void;
    onComplete?: (fullText: string) => void;
    onError?: (code: ExecutionStatus, details?: string) => void;
  };
}): Promise<CompletedChatMessage[]> {
  return new Promise((resolve, reject) => {
    const payload = {
      newMessage,
      storedMessages,
      modelParameters,
      aichatContext,
    };

    const consumerInstance = getConsumer();
    let settled = false;

    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('Chat completion stream timed out'));
    }, maxStreamTimeMs);

    const streamId = createUuid();
    let nextExpectedSeq = 1;
    const deltaBuffer = new Map<number, string>();

    const subscription: Subscription = consumerInstance.subscriptions.create(
      {channel: 'AichatChannel', stream_id: streamId},
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
              streamCallbacks.onStart?.(data.request_id);
              return;

            case 'delta': {
              const deltaText = data.text || '';
              deltaBuffer.set(data.seq, deltaText);

              while (deltaBuffer.has(nextExpectedSeq)) {
                const textToDisplay = deltaBuffer.get(nextExpectedSeq)!;

                streamCallbacks.onDelta?.(textToDisplay);

                deltaBuffer.delete(nextExpectedSeq);
                nextExpectedSeq++;
              }
              return;
            }

            case 'complete': {
              cleanup();
              streamCallbacks.onComplete?.(data.text);
              resolve(
                getUpdatedMessages(
                  newMessage,
                  data.text,
                  AiRequestExecutionStatus.SUCCESS
                ).map(message => ({...message, requestId: data.request_id}))
              );
              return;
            }

            case 'error': {
              cleanup();
              streamCallbacks.onError?.(data.code, data.details);
              resolve(
                getUpdatedMessages(newMessage, '', data.code).map(message => ({
                  ...message,
                  requestId: data.request_id,
                }))
              );
              return;
            }

            default:
              reject(new Error('Event type not valid'));
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
