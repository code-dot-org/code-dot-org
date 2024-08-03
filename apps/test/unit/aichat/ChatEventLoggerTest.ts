import {expect} from 'chai'; // eslint-disable-line no-restricted-imports
import sinon from 'ts-sinon';

import * as aichatApi from '@cdo/apps/aichat/aichatApi';
import ChatEventLogger from '@cdo/apps/aichat/chatEventLogger';
import {AichatContext, ChatMessage} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

describe('ChatEventLogger', () => {
  let userChatMessage: ChatMessage;
  let aichatContext: AichatContext;

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

    sinon.stub(aichatApi, 'postLogChatEvent').resolves({
      chat_event_id: 1,
      chat_event: userChatMessage as ChatMessage,
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('logChatEvent calls on postLogChatEvent', async () => {
    const chatEventLogger = ChatEventLogger.getInstance();
    expect(chatEventLogger).to.not.be.undefined;
    chatEventLogger.logChatEvent(userChatMessage as ChatMessage, aichatContext);
    expect(aichatApi.postLogChatEvent).to.have.been.calledOnce;
    sinon.restore();
  });

  it('sendChatEvent not called when sendingInProgress is true', async () => {
    const chatEventLogger = ChatEventLogger.getInstance();
    chatEventLogger.setSendingInProgress(true);
    chatEventLogger.logChatEvent(userChatMessage as ChatMessage, aichatContext);
    expect(aichatApi.postLogChatEvent).to.not.have.been.calledOnce;
    sinon.restore();
  });

  it('postLogChatEvent called twice when logChatEvent called twice', async () => {
    const chatEventLogger = ChatEventLogger.getInstance();
    chatEventLogger.logChatEvent(userChatMessage as ChatMessage, aichatContext);
    chatEventLogger.logChatEvent(userChatMessage as ChatMessage, aichatContext);
    expect(aichatApi.postLogChatEvent).to.have.been.calledTwice;
  });
});
