import {expect} from 'chai'; // eslint-disable-line no-restricted-imports
import sinon from 'ts-sinon';

import * as aichatApi from '@cdo/apps/aichat/aichatApi';
import ChatEventLogger from '@cdo/apps/aichat/chatEventLogger';
import {ChatMessage} from '@cdo/apps/aichat/types';

describe('ChatEventLogger', () => {
  it('logChatEvent calls on postLogChatEvent', async () => {
    const userChatMessage = {
      role: 'user',
      chatMessageText: 'hello',
      status: 'OK',
      timestamp: Date.now(),
    };
    const aichatContext = {
      currentLevelId: 123,
      scriptId: 321,
      channelId: 'abc123',
    };

    sinon.stub(aichatApi, 'postLogChatEvent').resolves({
      chat_event_id: 1,
      chat_event: userChatMessage as ChatMessage,
    });
    const chatEventLogger = ChatEventLogger.getInstance();
    expect(chatEventLogger).to.not.be.undefined;
    chatEventLogger.logChatEvent(userChatMessage as ChatMessage, aichatContext);
    expect(aichatApi.postLogChatEvent).to.have.been.calledOnce;
    sinon.restore();
  });

  it('sendChatEvent not called when sendingInProgress is true', async () => {
    const userChatMessage = {
      role: 'user',
      chatMessageText: 'hello',
      status: 'OK',
      timestamp: Date.now(),
    };
    const aichatContext = {
      currentLevelId: 123,
      scriptId: 321,
      channelId: 'abc123',
    };

    sinon.stub(aichatApi, 'postLogChatEvent').resolves({
      chat_event_id: 2,
      chat_event: userChatMessage as ChatMessage,
    });

    const chatEventLogger = ChatEventLogger.getInstance();
    chatEventLogger.setSendingInProgress(true);
    chatEventLogger.logChatEvent(userChatMessage as ChatMessage, aichatContext);
    expect(aichatApi.postLogChatEvent).to.not.have.been.calledOnce;
    sinon.restore();
  });

  it('postLogChatEvent called twice when logChatEvent called twice', async () => {
    const userChatMessage = {
      role: 'user',
      chatMessageText: 'hello',
      status: 'OK',
      timestamp: Date.now(),
    };
    const assistantChatMessage = {
      role: 'assistant',
      chatMessageText: 'How can I assist you?',
      status: 'OK',
      timestamp: Date.now(),
    };
    const aichatContext = {
      currentLevelId: 123,
      scriptId: 321,
      channelId: 'abc123',
    };

    sinon.stub(aichatApi, 'postLogChatEvent').resolves({
      chat_event_id: 3,
      chat_event: userChatMessage as ChatMessage,
    });

    const chatEventLogger = ChatEventLogger.getInstance();
    chatEventLogger.logChatEvent(userChatMessage as ChatMessage, aichatContext);
    chatEventLogger.logChatEvent(
      assistantChatMessage as ChatMessage,
      aichatContext
    );
    expect(aichatApi.postLogChatEvent).to.have.been.calledTwice;
    sinon.restore();
  });
});
