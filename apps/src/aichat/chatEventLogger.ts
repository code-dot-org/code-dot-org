import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {NetworkError} from '@cdo/apps/util/HttpClient';

import {postLogChatEvent} from './aichatApi';
import {ChatEvent, AichatContext} from './types';

export default class ChatEventLogger {
  private queue: ChatEvent[];
  private sendingInProgress: boolean;

  private static instance: ChatEventLogger;

  constructor(private readonly aichatContext: AichatContext) {
    this.queue = [];
    this.sendingInProgress = false;
  }

  public static getInstance(): ChatEventLogger {
    if (ChatEventLogger.instance === undefined) {
      throw new Error('ChatEventLogger was not initialized with API context.');
    }
    return ChatEventLogger.instance;
  }

  public static initialize(context: AichatContext) {
    ChatEventLogger.instance = new ChatEventLogger(context);
  }

  public logChatEvent(chatEvent: ChatEvent) {
    this.queue.push(chatEvent);
    if (!this.sendingInProgress) {
      this.sendChatEvent();
    }
  }

  private async sendChatEvent() {
    // Send aichat events to the server to be logged.
    while (this.queue.length > 0) {
      const chatEvent = this.queue.shift(); // Remove the first element from the queue.
      if (chatEvent) {
        this.sendingInProgress = true;
        try {
          await postLogChatEvent(chatEvent, this.aichatContext);
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
