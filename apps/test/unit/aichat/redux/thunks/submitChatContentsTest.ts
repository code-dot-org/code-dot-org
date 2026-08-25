import {configureStore} from '@reduxjs/toolkit';

import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import {logChatEvent} from '@cdo/apps/aichat/helpers/logChatEvent';
import {aichatReducer} from '@cdo/apps/aichat/redux/slice';
import {sendAnalytics} from '@cdo/apps/aichat/redux/thunks/sendAnalytics';
import {submitChatContents} from '@cdo/apps/aichat/redux/thunks/submitChatContents';
import {CompletedChatMessage, ModelParameters} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {sendProgressReport} from '@cdo/apps/code-studio/progressRedux';
import {TestResults} from '@cdo/apps/constants';
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
const mockLogChatEvent = logChatEvent as jest.Mock;
const mockSendProgressReport = sendProgressReport as jest.Mock;
const mockSendAnalytics = sendAnalytics as jest.Mock;

const modelParameters: ModelParameters = {
  selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
  temperature: 0.5,
  retrievalContexts: [],
  systemPrompt: 'system prompt',
};

const SET_LEVEL = 'test/setCurrentLevelId';

interface TestProgressState {
  currentLevelId?: string;
  scriptId: number;
  viewAsUserId: number | null;
}

const INITIAL_PROGRESS: TestProgressState = {
  currentLevelId: '1',
  scriptId: 2,
  viewAsUserId: null,
};

// Lets a test move to another level mid-request. configureStore contextually
// types the reducer's state parameter, so it needs the annotation.
const progressReducer = (
  state: TestProgressState = INITIAL_PROGRESS,
  action: {type: string; payload?: string}
): TestProgressState =>
  action.type === SET_LEVEL
    ? {...state, currentLevelId: action.payload}
    : state;

const makeStore = () =>
  configureStore({
    reducer: {
      aichat: aichatReducer,
      progress: progressReducer,
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

  it('applies jsonSchemaResponseCallback to successful assistant messages', async () => {
    mockPostAichatCompletionMessage.mockResolvedValue(
      makeMessages({
        chatMessageText: '{"answer":"formatted"}',
        status: Status.OK,
      })
    );
    const jsonSchemaResponseCallback = jest.fn(() => 'formatted response');
    const store = makeStore();

    const result = await store.dispatch(
      submitChatContents({
        text: 'Hello',
        modelParameters,
        clientType: AiChatClientTypes.AI_TUTOR,
        jsonSchemaResponseCallback,
      })
    );

    expect(submitChatContents.fulfilled.match(result)).toBe(true);
    // The legacy Rails-job path never has a parsed form to offer, so
    // submitChatContents parses chatMessageText itself before invoking the
    // callback -- the callback always receives already-parsed JSON.
    expect(jsonSchemaResponseCallback).toHaveBeenCalledWith({
      answer: 'formatted',
    });
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

  it('does not apply jsonSchemaResponseCallback to assistant error messages', async () => {
    mockPostAichatCompletionMessage.mockResolvedValue(
      makeMessages({
        chatMessageText: 'Error: service account missing',
        status: Status.ERROR,
      })
    );
    const jsonSchemaResponseCallback = jest.fn(() => {
      throw new Error('should not parse error text');
    });
    const store = makeStore();

    const result = await store.dispatch(
      submitChatContents({
        text: 'Hello',
        modelParameters,
        clientType: AiChatClientTypes.AI_TUTOR,
        jsonSchemaResponseCallback,
      })
    );

    expect(submitChatContents.fulfilled.match(result)).toBe(true);
    expect(jsonSchemaResponseCallback).not.toHaveBeenCalled();
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
  describe('when the user changes levels while the request is in flight', () => {
    // Simulates navigating to another level after the request goes out but
    // before the model responds -- nothing cancels the thunk.
    const respondAfterLevelChange = (
      store: ReturnType<typeof makeStore>,
      messages: CompletedChatMessage[]
    ) =>
      mockPostAichatCompletionMessage.mockImplementation(async () => {
        store.dispatch({type: SET_LEVEL, payload: '2'});
        return messages;
      });

    it('does not add the response to the chat window', async () => {
      const store = makeStore();
      respondAfterLevelChange(
        store,
        makeMessages({chatMessageText: 'a sloth', status: Status.OK})
      );

      await store.dispatch(
        submitChatContents({
          text: 'draw a sloth',
          modelParameters,
          clientType: AiChatClientTypes.AI_CHAT_LAB,
        })
      );

      // The window belongs to level 2 now. Leaking level 1's response into it
      // is what sent one level's history to the model on the next request.
      expect(
        store
          .getState()
          .aichat.chatEventsCurrent.filter(
            event => 'role' in event && event.role === Role.ASSISTANT
          )
      ).toEqual([]);
    });

    it('records the messages against the level they were sent from', async () => {
      const store = makeStore();
      respondAfterLevelChange(
        store,
        makeMessages({chatMessageText: 'a sloth', status: Status.OK})
      );

      await store.dispatch(
        submitChatContents({
          text: 'draw a sloth',
          modelParameters,
          clientType: AiChatClientTypes.AI_CHAT_LAB,
        })
      );

      expect(mockLogChatEvent).toHaveBeenCalledTimes(2);
      for (const call of mockLogChatEvent.mock.calls) {
        // Level 1, where the request was sent -- not level 2, where the user is.
        expect(call[2]).toEqual(
          expect.objectContaining({currentLevelId: 1, channelId: 'channel-id'})
        );
      }
    });

    it('does not report progress for the level the user moved to', async () => {
      const store = makeStore();
      respondAfterLevelChange(
        store,
        makeMessages({chatMessageText: 'a sloth', status: Status.OK})
      );

      await store.dispatch(
        submitChatContents({
          text: 'draw a sloth',
          modelParameters,
          clientType: AiChatClientTypes.AI_CHAT_LAB,
        })
      );

      expect(mockSendProgressReport).not.toHaveBeenCalled();
    });

    it('records a failure against the originating level without notifying the new one', async () => {
      const store = makeStore();
      mockPostAichatCompletionMessage.mockImplementation(async () => {
        store.dispatch({type: SET_LEVEL, payload: '2'});
        throw new Error('model unavailable');
      });

      await store.dispatch(
        submitChatContents({
          text: 'draw a sloth',
          modelParameters,
          clientType: AiChatClientTypes.AI_CHAT_LAB,
        })
      );

      expect(mockLogChatEvent).toHaveBeenCalledTimes(1);
      expect(mockLogChatEvent.mock.calls[0][0]).toEqual(
        expect.objectContaining({status: Status.ERROR})
      );
      expect(mockLogChatEvent.mock.calls[0][2]).toEqual(
        expect.objectContaining({currentLevelId: 1})
      );
      // No error bubble in the level the user is looking at.
      expect(
        store
          .getState()
          .aichat.chatEventsCurrent.filter(event => 'notificationType' in event)
      ).toEqual([]);
    });
  });

  it('reports progress and shows the response when the level has not changed', async () => {
    mockPostAichatCompletionMessage.mockResolvedValue(
      makeMessages({chatMessageText: 'a sloth', status: Status.OK})
    );
    const store = makeStore();

    await store.dispatch(
      submitChatContents({
        text: 'draw a sloth',
        modelParameters,
        clientType: AiChatClientTypes.AI_CHAT_LAB,
      })
    );

    expect(mockSendProgressReport).toHaveBeenCalledWith(
      'aichat',
      TestResults.LEVEL_STARTED
    );
    expect(store.getState().aichat.chatEventsCurrent).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          role: Role.ASSISTANT,
          chatMessageText: 'a sloth',
        }),
      ])
    );
  });
});
