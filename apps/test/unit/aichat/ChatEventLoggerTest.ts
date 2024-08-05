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
    postLogChatEventSpy = jest
      .spyOn(aichatApi, 'postLogChatEvent')
      .mockResolvedValue({chat_event_id: 1, chat_event: userChatMessage});
  });

  afterEach(() => {
    postLogChatEventSpy.mockRestore();
  });

  it('logChatEvent calls on postLogChatEvent', async () => {
    chatEventLogger.logChatEvent(userChatMessage as ChatMessage, aichatContext);
    expect(postLogChatEventSpy).toHaveBeenCalledTimes(1);
  });

  it('postLogChatEvent not called when sendingInProgress is true', async () => {
    // Simulate a sending in progress state.
    chatEventLogger.setSendingInProgress(true);
    chatEventLogger.logChatEvent(userChatMessage as ChatMessage, aichatContext);
    // If sending in process is true, sendChatEvent should not be called.
    expect(postLogChatEventSpy).toHaveBeenCalledTimes(0);
  });

  it('postLogChatEvent called twice when logChatEvent called twice', async () => {
    chatEventLogger.setSendingInProgress(false);
    chatEventLogger.logChatEvent(userChatMessage as ChatMessage, aichatContext);
    // Simulate that response to first chat event has been received.
    chatEventLogger.setSendingInProgress(false);
    chatEventLogger.logChatEvent(userChatMessage as ChatMessage, aichatContext);
    expect(postLogChatEventSpy).toHaveBeenCalledTimes(2);
  });
});
