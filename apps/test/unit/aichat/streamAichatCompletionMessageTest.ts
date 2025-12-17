import {createConsumer, Subscription} from '@rails/actioncable';

import {getUpdatedMessages} from '@cdo/apps/aichat/helpers/getUpdatedMessages';
import {streamAichatCompletionMessage} from '@cdo/apps/aichat/helpers/streamAichatCompletionMessage';
import {
  AichatContext,
  CompletedChatMessage,
  PendingChatMessage,
} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  AiChatClientTypes,
  AiChatModelIds,
  AiInteractionStatus,
  AiRequestExecutionStatus,
} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@rails/actioncable', () => ({
  createConsumer: jest.fn(),
}));
jest.mock('@cdo/apps/aichat/helpers/getUpdatedMessages', () => ({
  getUpdatedMessages: jest.fn(),
}));
jest.mock('@cdo/apps/utils', () => ({
  createUuid: jest.fn(() => 'stream-uuid'),
}));

describe('streamAichatCompletionMessage', () => {
  const performMock = jest.fn();
  const removeMock = jest.fn();
  const createMock = jest.fn();
  const consumer = {
    subscriptions: {
      create: createMock,
      remove: removeMock,
    },
  };

  const newMessage: PendingChatMessage = {
    chatMessageText: 'hello',
    role: Role.USER,
    status: AiInteractionStatus.UNKNOWN,
    timestamp: 1,
  };
  const storedMessages: CompletedChatMessage[] = [];
  const modelParameters = {
    selectedModelId: AiChatModelIds.CHATGPT,
    temperature: 0.2,
    retrievalContexts: [],
    systemPrompt: 'system',
  };
  const aichatContext: AichatContext = {
    clientType: AiChatClientTypes.AI_CHAT_LAB,
    currentLevelId: 1,
    scriptId: 2,
    channelId: 'abc',
  };

  let subscriptionCallbacks: {
    received: (data: unknown) => void;
    connected: () => void;
    disconnected: () => void;
  };
  let subscription: Subscription & {perform: jest.Mock};
  let onStart: jest.Mock,
    onDelta: jest.Mock,
    onComplete: jest.Mock,
    onError: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (createConsumer as jest.Mock).mockReturnValue(consumer);
    onStart = jest.fn();
    onDelta = jest.fn();
    onComplete = jest.fn();
    onError = jest.fn();

    createMock.mockImplementation((_identifier, callbacks) => {
      subscriptionCallbacks = callbacks;
      subscription = {...callbacks, perform: performMock};
      return subscription;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('streams deltas in order and resolves on completion', async () => {
    const updatedMessages: CompletedChatMessage[] = [
      {
        chatMessageText: 'user',
        role: Role.USER,
        status: AiInteractionStatus.OK,
        timestamp: 5,
        requestId: 0,
      },
      {
        chatMessageText: 'assistant',
        role: Role.ASSISTANT,
        status: AiInteractionStatus.OK,
        timestamp: 6,
        requestId: 0,
      },
    ];
    (getUpdatedMessages as jest.Mock).mockReturnValue(updatedMessages);

    const promise = streamAichatCompletionMessage({
      newMessage,
      storedMessages,
      modelParameters,
      aichatContext,
      maxStreamTimeMs: 1000,
      streamCallbacks: {onStart, onDelta, onComplete, onError},
    });

    expect(createMock).toHaveBeenCalledWith(
      {channel: 'AichatChannel', stream_id: 'stream-uuid'},
      expect.any(Object)
    );

    subscriptionCallbacks.connected.call(subscription);
    subscriptionCallbacks.received({event: 'start', request_id: 42});
    subscriptionCallbacks.received({
      event: 'delta',
      text: 'world',
      request_id: 42,
      seq: 2,
    });
    subscriptionCallbacks.received({
      event: 'delta',
      text: 'hello ',
      request_id: 42,
      seq: 1,
    });
    subscriptionCallbacks.received({
      event: 'complete',
      text: 'hello world',
      request_id: 42,
    });

    const result = await promise;

    expect(performMock).toHaveBeenCalledWith(
      'request_completion',
      expect.objectContaining({newMessage, storedMessages})
    );
    expect(onStart).toHaveBeenCalledWith(42);
    expect(onDelta.mock.calls.map(([delta]) => delta)).toEqual([
      'hello ',
      'world',
    ]);
    expect(onComplete).toHaveBeenCalledWith('hello world');
    expect(getUpdatedMessages).toHaveBeenCalledWith(
      newMessage,
      'hello world',
      AiRequestExecutionStatus.SUCCESS
    );
    expect(result).toEqual(
      updatedMessages.map(message => ({...message, requestId: 42}))
    );
    expect(removeMock).toHaveBeenCalledWith(subscription);
  });

  it('resolves with error status when error event received', async () => {
    const updatedMessages: CompletedChatMessage[] = [
      {
        chatMessageText: 'oops',
        role: Role.USER,
        status: AiInteractionStatus.ERROR,
        timestamp: 10,
        requestId: 0,
      },
    ];
    (getUpdatedMessages as jest.Mock).mockReturnValue(updatedMessages);

    const promise = streamAichatCompletionMessage({
      newMessage,
      storedMessages,
      modelParameters,
      aichatContext,
      maxStreamTimeMs: 1000,
      streamCallbacks: {onError},
    });

    subscriptionCallbacks.connected.call(subscription);
    subscriptionCallbacks.received({
      event: 'error',
      code: AiRequestExecutionStatus.MODEL_TIMEOUT,
      request_id: 7,
      details: 'timeout',
    });

    const result = await promise;
    expect(onError).toHaveBeenCalledWith(
      AiRequestExecutionStatus.MODEL_TIMEOUT,
      'timeout'
    );
    expect(getUpdatedMessages).toHaveBeenCalledWith(
      newMessage,
      '',
      AiRequestExecutionStatus.MODEL_TIMEOUT
    );
    expect(result).toEqual(
      updatedMessages.map(message => ({...message, requestId: 7}))
    );
    expect(removeMock).toHaveBeenCalled();
  });

  it('rejects when stream times out', async () => {
    (getUpdatedMessages as jest.Mock).mockReturnValue([]);
    const promise = streamAichatCompletionMessage({
      newMessage,
      storedMessages,
      modelParameters,
      aichatContext,
      maxStreamTimeMs: 50,
      streamCallbacks: {},
    });

    subscriptionCallbacks.connected.call(subscription);
    jest.advanceTimersByTime(51);

    await expect(promise).rejects.toThrow('Chat completion stream timed out');
    expect(removeMock).toHaveBeenCalledWith(subscription);
  });
});
