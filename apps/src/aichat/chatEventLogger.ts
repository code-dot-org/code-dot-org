import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

import {postLogChatEvent} from './aichatApi';
import {ChatEvent, AichatContext} from './types';

interface ChatEventLoggerPayload {
  chatEvent: ChatEvent;
  aichatContext: AichatContext;
}
export default class ChatEventLogger {
  private chatEventsQueue: ChatEventLoggerPayload[];
  private sendingChatEventInProgress: boolean;

  private static _instance: ChatEventLogger;

  constructor() {
    this.chatEventsQueue = [];
    this.sendingChatEventInProgress = false;
  }

  public static getInstance(): ChatEventLogger {
    if (ChatEventLogger._instance === undefined) {
      ChatEventLogger.create();
    }
    return ChatEventLogger._instance;
  }

  public static create() {
    ChatEventLogger._instance = new ChatEventLogger();
  }

  logChatEvent(chatEvent: ChatEvent, aichatContext: AichatContext) {
    this.chatEventsQueue.push({chatEvent, aichatContext});
    this.sendChatEvent();
  }

  async sendChatEvent() {
    // Send aichat events to the server to be logged.
    while (
      this.chatEventsQueue.length > 0 &&
      !this.sendingChatEventInProgress
    ) {
      const chatEventLoggerPayload = this.chatEventsQueue.shift(); // Remove the first element from the queue.
      if (chatEventLoggerPayload) {
        const {chatEvent, aichatContext} = chatEventLoggerPayload;
        let logChatEventResponse;
        this.sendingChatEventInProgress = true;
        try {
          logChatEventResponse = await postLogChatEvent(
            chatEvent,
            aichatContext
          );
          console.log('logChatEventResponse', logChatEventResponse);
          this.sendingChatEventInProgress = false;
        } catch (error) {
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .logError('Error in aichat event logging request', error as Error);
          return;
        }
      }
    }
  }
}
