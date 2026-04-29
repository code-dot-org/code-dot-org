import {configureStore} from '@reduxjs/toolkit';

import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import {aichatReducer} from '@cdo/apps/aichat/redux/slice';
import {sendAnalytics} from '@cdo/apps/aichat/redux/thunks/sendAnalytics';
import {submitChatContents} from '@cdo/apps/aichat/redux/thunks/submitChatContents';
import {CompletedChatMessage, ModelParameters} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {sendProgressReport} from '@cdo/apps/code-studio/progressRedux';
import {
  AiChatClientTypes,
  AiChatModelIds,
  AiInteractionStatus as Status,
} from '@cdo/generated-scripts/sharedConstants';

const mockMetricsReporter = {
  incrementCounter: jest.fn(),
  reportLoadTime: jest.fn(),
  logError: jest.fn(),
};

jest.mock('@cdo/apps/aichat/aichatApi', () => ({
  postAichatCompletionMessage: jest.fn(),
}));

jest.mock('@cdo/apps/aichat/helpers/logChatEvent', () => ({
  logChatEvent: jest.fn(),
}));

jest.mock('@cdo/apps/code-studio/progressRedux', () => ({
  sendProgressReport: jest.fn(() => ({type: 'progress/report'})),
}));

jest.mock('@cdo/apps/aichat/redux/thunks/sendAnalytics', () => ({
  sendAnalytics: jest.fn(() => ({type: 'analytics/send'})),
}));

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getMetricsReporter: () => mockMetricsReporter,
    }),
  },
}));

jest.mock('@cdo/apps/utils', () => ({
  createUuid: jest.fn(() => 'test-update-id'),
}));

const mockPostAichatCompletionMessage =
  postAichatCompletionMessage as jest.MockedFunction<
    typeof postAichatCompletionMessage
  >;
const mockSendProgressReport = sendProgressReport as jest.Mock;
const mockSendAnalytics = sendAnalytics as jest.Mock;

const modelParameters: ModelParameters = {
  selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
  temperature: 0.5,
  retrievalContexts: [],
  systemPrompt: 'system prompt',
};

const makeStore = () =>
  configureStore({
    reducer: {
      aichat: aichatReducer,
      progress: (
        state = {currentLevelId: '1', scriptId: 2, viewAsUserId: null}
      ) => state,
      lab: (state = {channel: {id: 'channel-id'}, levelProperties: {}}) =>
        state,
    },
  });

const makeMessages = (
  assistant: Pick<CompletedChatMessage, 'chatMessageText' | 'status'>
): CompletedChatMessage[] => [
  {
    role: Role.USER,
    chatMessageText: 'Hello',
    status: Status.OK,
    timestamp: 1,
    requestId: 42,
    updateId: 'test-update-id',
  },
  {
    role: Role.ASSISTANT,
    timestamp: 2,
    requestId: 42,
    ...assistant,
  },
];

describe('submitChatContents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendProgressReport.mockReturnValue({type: 'progress/report'});
    mockSendAnalytics.mockReturnValue({type: 'analytics/send'});
  });

  it('applies responseCallback to successful assistant messages', async () => {
    mockPostAichatCompletionMessage.mockResolvedValue(
      makeMessages({
        chatMessageText: '{"answer":"formatted"}',
        status: Status.OK,
      })
    );
    const responseCallback = jest.fn(() => 'formatted response');
    const store = makeStore();

    const result = await store.dispatch(
      submitChatContents({
        text: 'Hello',
        modelParameters,
        clientType: AiChatClientTypes.AI_TUTOR,
        responseCallback,
      })
    );

    expect(submitChatContents.fulfilled.match(result)).toBe(true);
    expect(responseCallback).toHaveBeenCalledWith('{"answer":"formatted"}');
    expect(store.getState().aichat.chatEventsCurrent).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          role: Role.ASSISTANT,
          status: Status.OK,
          chatMessageText: 'formatted response',
        }),
      ])
    );
  });

  it('does not apply responseCallback to assistant error messages', async () => {
    mockPostAichatCompletionMessage.mockResolvedValue(
      makeMessages({
        chatMessageText: 'Error: service account missing',
        status: Status.ERROR,
      })
    );
    const responseCallback = jest.fn(() => {
      throw new Error('should not parse error text');
    });
    const store = makeStore();

    const result = await store.dispatch(
      submitChatContents({
        text: 'Hello',
        modelParameters,
        clientType: AiChatClientTypes.AI_TUTOR,
        responseCallback,
      })
    );

    expect(submitChatContents.fulfilled.match(result)).toBe(true);
    expect(responseCallback).not.toHaveBeenCalled();
    expect(store.getState().aichat.chatEventsCurrent).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          role: Role.ASSISTANT,
          status: Status.ERROR,
          chatMessageText: 'Error: service account missing',
        }),
      ])
    );
  });
});
