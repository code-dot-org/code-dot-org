import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {NetworkError} from '@cdo/apps/util/HttpClient';

import {postLogChatEvent} from './aichatApi';
import AichatContextManager from './aichatContextManager';
import {ChatEvent} from './types';

export default class ChatEventLogger {
  private queue: ChatEvent[];
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

  public logChatEvent(chatEvent: ChatEvent) {
    this.queue.push(chatEvent);
    if (!this.sendingInProgress) {
      this.sendChatEvent();
    }
  }

  private async sendChatEvent() {
    const aichatContext = AichatContextManager.getContext();
    // Send aichat events to the server to be logged.
    while (this.queue.length > 0) {
      const chatEvent = this.queue.shift(); // Remove the first element from the queue.
      if (chatEvent) {
        this.sendingInProgress = true;
        try {
          await postLogChatEvent(chatEvent, aichatContext);
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
