import {postLogChatEvent} from './aichatApi';
import {ChatEvent, AichatContext} from './types';

interface LoggerPayload {
  chatEvent: ChatEvent;
  aichatContext: AichatContext;
}
export default class ChatEventLogger {
  private queue: LoggerPayload[];
  private sendingInProgress: boolean;

  private static instance: ChatEventLogger;

  constructor() {
    this.queue = [];
    this.sendingInProgress = false;
  }

  public static getInstance(): ChatEventLogger {
    if (ChatEventLogger.instance === undefined) {
      ChatEventLogger.create();
    }
    return ChatEventLogger.instance;
  }

  public static create(): void {
    ChatEventLogger.instance = new ChatEventLogger();
  }

  public logChatEvent(chatEvent: ChatEvent, aichatContext: AichatContext) {
    this.queue.push({chatEvent, aichatContext});
    if (!this.sendingInProgress) {
      this.sendChatEvent();
    }
  }

  private async sendChatEvent() {
    // Send aichat events to the server to be logged.
    while (this.queue.length > 0) {
      const loggerPayload = this.queue.shift(); // Remove the first element from the queue.
      if (loggerPayload) {
        const {chatEvent, aichatContext} = loggerPayload;
        this.sendingInProgress = true;
        try {
          await postLogChatEvent(chatEvent, aichatContext);
        } catch (error) {
          console.error(
            'Error logging chat event:',
            chatEvent.descriptionKey,
            error
          );
        } finally {
          this.sendingInProgress = false;
        }
      }
    }
  }
}
