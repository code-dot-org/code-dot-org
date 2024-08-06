import * as aichatApi from '@cdo/apps/aichat/aichatApi';
import ChatEventLogger from '@cdo/apps/aichat/chatEventLogger';
import {AichatContext, ChatMessage} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

describe('ChatEventLogger', () => {
  let userChatMessage: ChatMessage;
  let aichatContext: AichatContext;
  let chatEventLogger: ChatEventLogger;
  let postLogChatEventSpy: jest.SpyInstance;

  beforeEach(() => {
    userChatMessage = {
      role: Role.USER,
      chatMessageText: 'hello',
      status: 'OK',
      timestamp: Date.now(),
    };
    aichatContext = {
      currentLevelId: 123,
      scriptId: 321,
      channelId: 'abc123',
    };
    chatEventLogger = ChatEventLogger.getInstance();
  });

  afterEach(() => {
    postLogChatEventSpy.mockRestore();
  });

  it('logChatEvent calls on postLogChatEvent', async () => {
    postLogChatEventSpy = jest
      .spyOn(aichatApi, 'postLogChatEvent')
      .mockResolvedValue({chat_event_id: 1, chat_event: userChatMessage});

    chatEventLogger.logChatEvent(userChatMessage, aichatContext);
    expect(postLogChatEventSpy).toHaveBeenCalledTimes(1);
  });

  it('logChatEvent waits to send second chat event when sending in process - postLogChatEvent eventually called twice', async () => {
    postLogChatEventSpy = jest
      .spyOn(aichatApi, 'postLogChatEvent')
      .mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({chat_event_id: 1, chat_event: userChatMessage});
          }, 1000);
        });
      });

    chatEventLogger.logChatEvent(userChatMessage, aichatContext);
    chatEventLogger.logChatEvent(userChatMessage, aichatContext);
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
