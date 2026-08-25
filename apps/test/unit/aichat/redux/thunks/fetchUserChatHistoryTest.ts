import {configureStore} from '@reduxjs/toolkit';

import {getUserChatHistory} from '@cdo/apps/aichat/aichatApi';
import {aichatReducer} from '@cdo/apps/aichat/redux/slice';
import {fetchUserChatHistory} from '@cdo/apps/aichat/redux/thunks/fetchUserChatHistory';
import {ServerChatEvent} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

const mockMetricsReporter = {logError: jest.fn()};

jest.mock('@cdo/apps/aichat/aichatApi', () => ({
  getUserChatHistory: jest.fn(),
}));

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getMetricsReporter: () => mockMetricsReporter,
    }),
  },
}));

const mockGetUserChatHistory = getUserChatHistory as jest.MockedFunction<
  typeof getUserChatHistory
>;

const SET_LEVEL = 'test/setCurrentLevelId';

const makeStore = () =>
  configureStore({
    reducer: {
      aichat: aichatReducer,
      progress: (
        state = {currentLevelId: '1', scriptId: 2, viewAsUserId: null},
        action: {type: string; payload?: string}
      ) =>
        action.type === SET_LEVEL
          ? {...state, currentLevelId: action.payload}
          : state,
    },
  });

const historyFor = (text: string): ServerChatEvent[] => [
  {
    id: 1,
    role: Role.USER,
    chatMessageText: text,
    status: Status.OK,
    timestamp: 1,
    requestId: 1,
  },
];

describe('fetchUserChatHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('applies history for the level it was requested for', async () => {
    mockGetUserChatHistory.mockResolvedValue(historyFor('level 1 message'));
    const store = makeStore();

    await store.dispatch(fetchUserChatHistory({userId: 7, isOwnHistory: true}));

    expect(store.getState().aichat.chatEventsCurrent).toEqual(
      expect.arrayContaining([
        expect.objectContaining({chatMessageText: 'level 1 message'}),
      ])
    );
  });

  it('drops a response that arrives after the user changed levels', async () => {
    const store = makeStore();
    // The response lands after navigation, as a slow fetch for the level the
    // user just left does. Applying it would seed the new level's window with
    // the old level's messages, which then go to the model as history.
    mockGetUserChatHistory.mockImplementation(async () => {
      store.dispatch({type: SET_LEVEL, payload: '2'});
      return historyFor('level 1 message');
    });

    await store.dispatch(fetchUserChatHistory({userId: 7, isOwnHistory: true}));

    expect(store.getState().aichat.chatEventsCurrent).toEqual([]);
  });

  it('drops a stale student history response as well', async () => {
    const store = makeStore();
    mockGetUserChatHistory.mockImplementation(async () => {
      store.dispatch({type: SET_LEVEL, payload: '2'});
      return historyFor('level 1 message');
    });

    await store.dispatch(
      fetchUserChatHistory({userId: 7, isOwnHistory: false})
    );

    expect(store.getState().aichat.studentChatHistory).toEqual([]);
  });
});
