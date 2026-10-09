import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {render} from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import {AichatState} from '@cdo/apps/aichat/redux';
import {
  AssetSource,
  ChatAsset,
  CompletedChatMessage,
} from '@cdo/apps/aichat/types';
import ChatWorkspace from '@cdo/apps/aichat/views/ChatWorkspace';
import {AichatLabState} from '@cdo/apps/aichatLab/redux';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  AiChatClientTypes,
  AiChatModelIds,
  AiInteractionStatus,
} from '@cdo/generated-scripts/sharedConstants';

const mockGetAssetUrl = jest.fn(
  (asset: ChatAsset, channelId?: string, levelName?: string) =>
    `/level_starter_assets/${levelName}/${asset.filename}`
);

jest.mock('@cdo/apps/aichat/utils', () => ({
  ...jest.requireActual('@cdo/apps/aichat/utils'),
  getAssetUrl: (...args: [ChatAsset, string?, string?]) =>
    mockGetAssetUrl(...args),
}));

type MockState = {
  aichat: Partial<AichatState>;
  aichatLab: Partial<AichatLabState>;
  currentUser: {userId: number};
  progress: {scriptId: number | null; currentLevelId: string | null};
  teacherSections: {selectedStudents: Record<string, unknown>};
  pageConstants: {locale: string};
};

const emptyAichat = (): Partial<AichatState> => ({
  chatEventsPast: [],
  chatEventsCurrent: [],
  studentChatHistory: [],
  stagedFiles: [],
  userAddedSelectionContext: {},
});

let mockState: MockState;

// Replaces mockState rather than mutating it: selectAllVisibleMessages is a
// reselect selector that memoizes on the state reference it was last given.
const setAichat = (patch: Partial<AichatState>) => {
  mockState = {...mockState, aichat: {...mockState.aichat, ...patch}};
};

// Applies the reset effect's clears to mockState so the test can tell a render
// that skipped stale state from one that drew an already-cleared slice.
const mockDispatch = jest.fn((action: unknown) => {
  const type = (action as {type?: string})?.type;
  if (type === 'aichat/clearChatMessages') {
    setAichat({chatEventsPast: [], chatEventsCurrent: []});
  }
  if (type === 'aichat/clearStagedFiles') {
    setAichat({stagedFiles: []});
  }
});

jest.mock('@cdo/apps/util/reduxHooks', () => ({
  ...jest.requireActual('@cdo/apps/util/reduxHooks'),
  useAppSelector: (selector: (s: unknown) => unknown) => selector(mockState),
  useAppDispatch: () => mockDispatch,
}));

describe('ChatWorkspace', () => {
  const asset: ChatAsset = {
    filename: 'activity1.jpg',
    source: AssetSource.LEVEL,
  };
  const sentMessage: CompletedChatMessage = {
    role: Role.USER,
    status: AiInteractionStatus.OK,
    chatMessageText: 'what is this?',
    requestId: 1,
    timestamp: 1,
    assets: [asset],
  };
  const baseProps = {
    modelParameters: {
      selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
      temperature: 0.5,
      systemPrompt: '',
      retrievalContexts: [],
    },
    clientType: AiChatClientTypes.AI_CHAT_LAB,
    multimodalEnabled: true,
    channelId: 'abc123',
  };

  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetAssetUrl.mockClear();
    mockState = {
      aichat: emptyAichat(),
      aichatLab: {saveInProgress: false},
      currentUser: {userId: 7},
      progress: {scriptId: null, currentLevelId: '1'},
      teacherSections: {selectedStudents: {}},
      pageConstants: {locale: 'en_us'},
    };
  });

  it("does not draw the previous level's assets under the new level name", () => {
    const {rerender} = render(
      <ThemeProvider>
        <ChatWorkspace {...baseProps} levelId={1} levelName="level-one" />
      </ThemeProvider>
    );

    // Stage a starter asset and send it on level one.
    setAichat({
      stagedFiles: [{key: 'activity1.jpg-1', asset, status: 'uploaded'}],
      chatEventsCurrent: [sentMessage],
    });
    rerender(
      <ThemeProvider>
        <ChatWorkspace {...baseProps} levelId={1} levelName="level-one" />
      </ThemeProvider>
    );
    expect(mockGetAssetUrl).toHaveBeenCalledWith(asset, 'abc123', 'level-one');

    mockGetAssetUrl.mockClear();
    rerender(
      <ThemeProvider>
        <ChatWorkspace {...baseProps} levelId={2} levelName="level-two" />
      </ThemeProvider>
    );

    const levelNamesRequested = mockGetAssetUrl.mock.calls.map(call => call[2]);
    expect(levelNamesRequested).not.toContain('level-two');
    // The reset effect still ran for the new level.
    expect(mockState.aichat.stagedFiles).toEqual([]);
    expect(mockState.aichat.chatEventsCurrent).toEqual([]);
  });

  it('draws messages for a chat outside any level', () => {
    const {rerender} = render(
      <ThemeProvider>
        <ChatWorkspace {...baseProps} levelId={null} levelName="no-level" />
      </ThemeProvider>
    );

    setAichat({chatEventsCurrent: [sentMessage]});
    rerender(
      <ThemeProvider>
        <ChatWorkspace {...baseProps} levelId={null} levelName="no-level" />
      </ThemeProvider>
    );

    expect(mockGetAssetUrl).toHaveBeenCalledWith(asset, 'abc123', 'no-level');
  });
});
