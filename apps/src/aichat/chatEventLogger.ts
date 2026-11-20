import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {NetworkError} from '@cdo/apps/util/HttpClient';

import {postLogChatEvent} from './aichatApi';
import AichatContextManager from './aichatContextManager';
import {AichatContext, ChatEvent} from './types';

interface QueuedChatEvent {
  chatEvent: ChatEvent;
  /**
   * The context this event belongs to. Callers that know it -- because the
   * work that produced the event started under a context that may since have
   * been replaced -- should pass it. When absent, the context in effect at the
   * moment the event is sent is used.
   */
  aichatContext?: AichatContext;
}

export default class ChatEventLogger {
  private queue: QueuedChatEvent[];
  private sendingInProgress: boolean;

  private static instance: ChatEventLogger;

  constructor() {
    this.queue = [];
    this.sendingInProgress = false;
  }

  public static getInstance(): ChatEventLogger {
    if (ChatEventLogger.instance === undefined) {
      ChatEventLogger.instance = new ChatEventLogger();
    }
    return ChatEventLogger.instance;
  }

  public logChatEvent(chatEvent: ChatEvent, aichatContext?: AichatContext) {
    this.queue.push({chatEvent, aichatContext});
    if (!this.sendingInProgress) {
      this.sendChatEvent();
    }
  }

  private async sendChatEvent() {
    // Send aichat events to the server to be logged.
    while (this.queue.length > 0) {
      const queued = this.queue.shift(); // Remove the first element from the queue.
      if (queued) {
        this.sendingInProgress = true;
        try {
          // Resolve the context per event rather than once per drain. This loop
          // awaits, and the level can change while it runs, so a context read
          // at the start of the drain would file later events under the level
          // the drain began on.
          const aichatContext =
            queued.aichatContext ?? AichatContextManager.getContext();
          await postLogChatEvent(queued.chatEvent, aichatContext);
        } catch (error) {
          // Only send log report if not a 403 error.
          if (
            !(error instanceof NetworkError && error.response.status === 403)
          ) {
            Lab2Registry.getInstance()
              .getMetricsReporter()
              .logError(
                'Error in aichat event logging request',
                error as Error
              );
          }
        } finally {
          this.sendingInProgress = false;
        }
      }
    }
  }
}
