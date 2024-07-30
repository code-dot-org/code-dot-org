import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

import {postLogAichatEvent} from './aichatApi';
import {AichatEvent, AichatContext} from './types';

interface AichatEventsLoggerPayload {
  aichatEvent: AichatEvent;
  aichatContext: AichatContext;
}
export default class AichatEventsLogger {
  private aichatEventsQueue: AichatEventsLoggerPayload[];
  private sendingAichatEventInProgress: boolean;

  private static _instance: AichatEventsLogger;

  constructor() {
    this.aichatEventsQueue = [];
    this.sendingAichatEventInProgress = false;
  }

  public static getInstance(): AichatEventsLogger {
    if (AichatEventsLogger._instance === undefined) {
      AichatEventsLogger.create();
    }
    return AichatEventsLogger._instance;
  }

  public static create() {
    AichatEventsLogger._instance = new AichatEventsLogger();
  }

  logAichatEvent(aichatEvent: AichatEvent, aichatContext: AichatContext) {
    this.aichatEventsQueue.push({aichatEvent, aichatContext});
    this.sendAichatEvents();
  }

  async sendAichatEvents() {
    // Send aichat events to the server to be logged.
    while (
      this.aichatEventsQueue.length > 0 &&
      !this.sendingAichatEventInProgress
    ) {
      const aichatEventLoggerPayload = this.aichatEventsQueue.shift(); // Remove the first element from the array.
      if (aichatEventLoggerPayload) {
        const {aichatEvent, aichatContext} = aichatEventLoggerPayload;
        let logAichatEventResponse;
        this.sendingAichatEventInProgress = true;
        try {
          this.sendingAichatEventInProgress = true;
          logAichatEventResponse = await postLogAichatEvent(
            aichatEvent,
            aichatContext
          );
          this.sendingAichatEventInProgress = false;
          // if queue not empty - send event - in a loop.
          console.log('logAichatEventResponse', logAichatEventResponse);
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
