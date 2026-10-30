import {configureStore} from '@reduxjs/toolkit';

import {getUserChatHistory} from '@cdo/apps/aichat/aichatApi';
import {aichatReducer} from '@cdo/apps/aichat/redux/slice';
import {fetchUserChatHistory} from '@cdo/apps/aichat/redux/thunks/fetchUserChatHistory';

jest.mock('@cdo/apps/aichat/aichatApi', () => ({
  getUserChatHistory: jest.fn(),
}));

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getMetricsReporter: () => ({logError: jest.fn()}),
    }),
  },
}));

const mockGetUserChatHistory = getUserChatHistory as jest.MockedFunction<
  typeof getUserChatHistory
>;

const makeStore = () =>
  configureStore({
    reducer: {
      aichat: aichatReducer,
      progress: (state = {scriptId: 2}) => state,
    },
  });

describe('fetchUserChatHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserChatHistory.mockResolvedValue([]);
  });

  it('does not request history for a signed-out viewer', async () => {
    const result = await makeStore().dispatch(
      fetchUserChatHistory({userId: null, isOwnHistory: true, levelId: 7})
    );

    expect(fetchUserChatHistory.fulfilled.match(result)).toBe(true);
    expect(mockGetUserChatHistory).not.toHaveBeenCalled();
  });

  it('asks for the level it was given', async () => {
    await makeStore().dispatch(
      fetchUserChatHistory({userId: 5, isOwnHistory: true, levelId: 7})
    );

    expect(mockGetUserChatHistory).toHaveBeenCalledWith(
      5,
      7,
      2,
      undefined,
      undefined
    );
  });
});
