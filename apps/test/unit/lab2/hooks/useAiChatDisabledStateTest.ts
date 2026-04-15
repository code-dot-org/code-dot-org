import {renderHook} from '@testing-library/react-hooks';

import {useAiChatDisabled} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import {useAiChatDisabledState} from '@cdo/apps/lab2/hooks/useAiChatDisabledState';
import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

jest.mock('@cdo/apps/aichat/context/aiChatDisabledContext');
jest.mock('@cdo/apps/lab2/projects/utils');
jest.mock('@cdo/apps/util/reduxHooks');

const mockUseAiChatDisabled = useAiChatDisabled as jest.MockedFunction<
  typeof useAiChatDisabled
>;
const mockGetIsStartMode = getIsStartMode as jest.MockedFunction<
  typeof getIsStartMode
>;
const mockUseAppSelector = useAppSelector as jest.MockedFunction<
  typeof useAppSelector
>;

describe('useAiChatDisabledState', () => {
  const setChatDisabledState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAiChatDisabled.mockReturnValue({
      chatDisabled: false,
      chatDisabledMessage: undefined,
      setChatDisabled: jest.fn(),
      setChatDisabledMessage: jest.fn(),
      setChatDisabledState,
    });
    mockGetIsStartMode.mockReturnValue(false);
  });

  const renderWithState = ({
    appName = 'dance',
    isPredictLevel = false,
    hasSubmittedPredictResponse = false,
    isLevelbuilder = false,
  }: {
    appName?: string;
    isPredictLevel?: boolean;
    hasSubmittedPredictResponse?: boolean;
    isLevelbuilder?: boolean;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state: any = {
      currentUser: {
        isTeacher: false,
        isLevelbuilder,
        aiChatAccessLevel: 'disabled',
      },
      teacherSections: {
        selectedSectionId: null,
        sections: {},
      },
    };

    mockUseAppSelector.mockImplementation(selector => selector(state));

    return renderHook(() =>
      useAiChatDisabledState({
        appName,
        isPredictLevel,
        hasSubmittedPredictResponse,
      })
    );
  };

  it('disables chat on predict levels before submission for non-levelbuilders', () => {
    renderWithState({isPredictLevel: true, hasSubmittedPredictResponse: false});

    expect(setChatDisabledState).toHaveBeenLastCalledWith({
      chatDisabled: true,
      chatDisabledMessage: 'Chat is disabled until you submit your prediction.',
    });
  });

  it('bypasses predict-level disable for levelbuilders', () => {
    renderWithState({
      isPredictLevel: true,
      hasSubmittedPredictResponse: false,
      isLevelbuilder: true,
    });

    expect(setChatDisabledState).toHaveBeenLastCalledWith({
      chatDisabled: false,
    });
  });
});
