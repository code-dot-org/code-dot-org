import * as aichatApi from '@cdo/apps/aichat/aichatApi';
import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import ChatEventLogger from '@cdo/apps/aichat/chatEventLogger';
import {AichatContext, CompletedChatMessage} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  AiChatClientTypes,
  AiInteractionStatus,
} from '@cdo/generated-scripts/sharedConstants';

describe('ChatEventLogger', () => {
  let userChatMessage: CompletedChatMessage;
  let aichatContext: AichatContext;
  let chatEventLogger: ChatEventLogger;
  let postLogChatEventSpy: jest.SpyInstance;

  beforeEach(() => {
    userChatMessage = {
      requestId: 1,
      role: Role.USER,
      chatMessageText: 'hello',
      status: AiInteractionStatus.OK,
      timestamp: Date.now(),
    };
    aichatContext = {
      clientType: AiChatClientTypes.AI_CHAT_LAB,
      currentLevelId: 123,
      scriptId: 321,
      channelId: 'abc123',
    };
    AichatContextManager.setContext(aichatContext);
    chatEventLogger = ChatEventLogger.getInstance();
  });

  afterEach(() => {
    postLogChatEventSpy.mockRestore();
  });

  it('logChatEvent calls on postLogChatEvent', async () => {
    postLogChatEventSpy = jest
      .spyOn(aichatApi, 'postLogChatEvent')
      .mockResolvedValue(userChatMessage);

    chatEventLogger.logChatEvent(userChatMessage);
    expect(postLogChatEventSpy).toHaveBeenCalledTimes(1);
  });

  it('logs an event against the context supplied with it', async () => {
    postLogChatEventSpy = jest
      .spyOn(aichatApi, 'postLogChatEvent')
      .mockResolvedValue(userChatMessage);
    const originatingContext: AichatContext = {
      ...aichatContext,
      currentLevelId: 456,
      channelId: 'other-channel',
    };

    chatEventLogger.logChatEvent(userChatMessage, originatingContext);

    // The supplied context wins over the one the context manager currently
    // holds, so a response that arrives after a level change is still filed
    // under the level it was requested on.
    expect(postLogChatEventSpy).toHaveBeenCalledWith(
      userChatMessage,
      originatingContext
    );
  });

  it('resolves the current context per event rather than once per drain', async () => {
    let resolveFirstSend = () => {};
    postLogChatEventSpy = jest
      .spyOn(aichatApi, 'postLogChatEvent')
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolveFirstSend = () => resolve(userChatMessage);
          })
      )
      .mockResolvedValue(userChatMessage);

    chatEventLogger.logChatEvent(userChatMessage);
    // Queued behind the first send, which has not resolved yet.
    chatEventLogger.logChatEvent(userChatMessage);
    expect(postLogChatEventSpy).toHaveBeenCalledTimes(1);

    // The user moves to another level while the first send is in flight.
    const nextContext: AichatContext = {
      ...aichatContext,
      currentLevelId: 456,
      channelId: 'next-channel',
    };
    AichatContextManager.setContext(nextContext);

    resolveFirstSend();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(postLogChatEventSpy).toHaveBeenCalledTimes(2);
    // The event dequeued before the change keeps the old context; the one
    // dequeued after it picks up the new one.
    expect(postLogChatEventSpy).toHaveBeenNthCalledWith(
      1,
      userChatMessage,
      aichatContext
    );
    expect(postLogChatEventSpy).toHaveBeenNthCalledWith(
      2,
      userChatMessage,
      nextContext
    );
  });

  it('logChatEvent waits to send second chat event when sending in process - postLogChatEvent eventually called twice', async () => {
    postLogChatEventSpy = jest
      .spyOn(aichatApi, 'postLogChatEvent')
      .mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(userChatMessage);
          }, 1000);
        });
      });

    chatEventLogger.logChatEvent(userChatMessage);
    chatEventLogger.logChatEvent(userChatMessage);
    // Because the first postLogChatEvent call is not yet resolved, the second logChatEvent
    // does not call on sendChatEvent.
    expect(postLogChatEventSpy).toHaveBeenCalledTimes(1);
    return new Promise<void>(resolve => {
      setTimeout(() => {
        // After 1 second, the first postLogChatEvent call resolves
        // so that sending is no longer in process. Since the queue has length of 1,
        // postLogChatEvent is called again so now it has been called a total of 2 times.
        expect(postLogChatEventSpy).toHaveBeenCalledTimes(2);
        resolve();
      }, 1000);
    });
  });
});
