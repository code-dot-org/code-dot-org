import {useFileRowOptions} from '@codebridge/FileBrowser/FileBrowserRow/hooks/useFileRowOptions';
import {renderHook} from '@testing-library/react-hooks';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {useBackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';

let mockState: {
  lab2Project: {
    projectSources: {
      source: {
        files: {
          [key: string]: {
            id: string;
            name: string;
            contents: string;
            folderId: string;
          };
        };
        folders: Record<string, never>;
      };
    };
  };
};

let mockAiTutorDisabled = false;

jest.mock('@codebridge/codebridgeContext', () => ({
  useCodebridgeContext: jest.fn(() => ({
    config: {supportedFileTypes: ['html']},
    levelProperties: {appName: 'weblab2'},
    aiTutorDisabled: mockAiTutorDisabled,
  })),
}));

jest.mock('@codebridge/FileBrowser/hooks', () => ({
  usePrompts: jest.fn(() => ({
    openConfirmDeleteFile: jest.fn(),
    openMoveFilePrompt: jest.fn(),
    openRenameFilePrompt: jest.fn(),
    openSaveToBackpackPrompt: jest.fn(),
  })),
}));

jest.mock('@cdo/apps/aichat/redux', () => ({
  sendAnalytics: jest.fn(),
}));

jest.mock('@cdo/apps/aichat/redux/slice', () => ({
  addItemToUserAddedSelectionContext: jest.fn(),
  addStagedFile: jest.fn(),
}));

jest.mock('@cdo/apps/lab2/projects/utils', () => ({
  ...jest.requireActual('@cdo/apps/lab2/projects/utils'),
  getAppOptionsEditBlocks: jest.fn(),
}));

jest.mock('@cdo/apps/sharedComponents/backpack/BackpackAPIContext', () => ({
  useBackpackAPIContext: jest.fn(),
}));

jest.mock('@cdo/apps/util/reduxHooks', () => ({
  ...jest.requireActual('@cdo/apps/util/reduxHooks'),
  useAppSelector: (
    selector: (
      state: typeof mockState
    ) => typeof mockState.lab2Project.projectSources.source
  ) => selector(mockState),
  useAppDispatch: () => jest.fn(),
}));

const mockGetAppOptionsEditBlocks =
  getAppOptionsEditBlocks as jest.MockedFunction<
    typeof getAppOptionsEditBlocks
  >;
const mockUseBackpackAPIContext = useBackpackAPIContext as jest.MockedFunction<
  typeof useBackpackAPIContext
>;

describe('useFileRowOptions', () => {
  const file = {
    id: '1',
    name: 'index.html',
    contents: '<h1>hello</h1>',
    folderId: '0',
  };

  beforeEach(() => {
    mockState = {
      lab2Project: {
        projectSources: {
          source: {
            files: {
              [file.id]: file,
            },
            folders: {},
          },
        },
      },
    };
    mockAiTutorDisabled = false;
    mockGetAppOptionsEditBlocks.mockReturnValue(undefined);
    mockUseBackpackAPIContext.mockReturnValue(null);
  });

  it('includes add to AI tutor chat when AI tutor is enabled', () => {
    const {result} = renderHook(() => useFileRowOptions(file, false));

    const visibleLabels = result.current
      .filter(option => option.condition)
      .map(option => option.labelText);

    expect(visibleLabels).toContain(codebridgeI18n.addToAiTutorContext());
  });

  it('hides add to AI tutor chat when AI tutor is disabled', () => {
    mockAiTutorDisabled = true;

    const {result} = renderHook(() => useFileRowOptions(file, false));

    const visibleLabels = result.current
      .filter(option => option.condition)
      .map(option => option.labelText);

    expect(visibleLabels).not.toContain(codebridgeI18n.addToAiTutorContext());
  });
});
