import {renderHook} from '@testing-library/react-hooks';

import {
  AI_SETTINGS_SUPPORT_LINK,
  AI_CHAT_NOT_AUTHORIZED_STUDENT,
  AI_CHAT_NOT_AUTHORIZED_TEACHER,
  VERIFIED_TEACHER_SUPPORT_LINK,
} from '@cdo/apps/aichat/constants';
import {areAiChatToolsEnabled} from '@cdo/apps/aichat/helpers/aiChatAccess';
import {useAiChatDisabledState} from '@cdo/apps/aichat/hooks/useAiChatDisabledState';
import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';

let mockState = {
  currentUser: {
    isTeacher: false,
    aiChatAccessLevel: 'enabled',
    isLevelbuilder: false,
  },
};

let mockSelectedSectionAccessLevel: string | undefined;

jest.mock('@cdo/apps/util/reduxHooks', () => ({
  ...jest.requireActual('@cdo/apps/util/reduxHooks'),
  useAppSelector: (
    selector: (state: typeof mockState) => boolean | string | undefined
  ) => selector(mockState),
}));

jest.mock(
  '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors',
  () => ({
    selectedSectionSelector: jest.fn(),
  })
);

jest.mock('@cdo/apps/aichat/helpers/aiChatAccess', () => ({
  areAiChatToolsEnabled: jest.fn(),
}));

jest.mock('@cdo/apps/lab2/projects/utils', () => ({
  ...jest.requireActual('@cdo/apps/lab2/projects/utils'),
  getIsStartMode: jest.fn(),
}));

const mockSelectedSectionSelector = selectedSectionSelector as jest.Mock;
const mockAreAiChatToolsEnabled = areAiChatToolsEnabled as jest.MockedFunction<
  typeof areAiChatToolsEnabled
>;
const mockGetIsStartMode = getIsStartMode as jest.MockedFunction<
  typeof getIsStartMode
>;

describe('useAiChatDisabledState', () => {
  beforeEach(() => {
    mockState = {
      currentUser: {
        isTeacher: false,
        aiChatAccessLevel: 'enabled',
        isLevelbuilder: false,
      },
    };
    mockSelectedSectionAccessLevel = undefined;
    mockSelectedSectionSelector.mockImplementation(() =>
      mockSelectedSectionAccessLevel
        ? {aiChatAccessLevel: mockSelectedSectionAccessLevel}
        : undefined
    );
    mockAreAiChatToolsEnabled.mockReturnValue(true);
    mockGetIsStartMode.mockReturnValue(false);
  });

  it('returns disabled when appName is missing', () => {
    const {result} = renderHook(() => useAiChatDisabledState({}));

    expect(result.current).toEqual({disabled: true});
  });

  it('returns predict gating state for students before submission', () => {
    const {result} = renderHook(() =>
      useAiChatDisabledState({
        appName: 'pythonlab',
        isPredictLevel: true,
        hasSubmittedPredictResponse: false,
      })
    );

    expect(result.current).toEqual({
      disabled: true,
      disabledMessage: 'Chat is disabled until you submit your prediction.',
    });
  });

  it('returns enabled for levelbuilders even when chat would otherwise be disabled', () => {
    mockState.currentUser.isLevelbuilder = true;
    mockAreAiChatToolsEnabled.mockReturnValue(false);

    const {result} = renderHook(() =>
      useAiChatDisabledState({
        appName: 'pythonlab',
        isPredictLevel: true,
        hasSubmittedPredictResponse: false,
      })
    );

    expect(result.current).toEqual({disabled: false});
  });

  it('returns the student authorization message when access is denied', () => {
    mockAreAiChatToolsEnabled.mockReturnValue(false);

    const {result} = renderHook(() =>
      useAiChatDisabledState({appName: 'pythonlab'})
    );

    expect(result.current).toEqual({
      disabled: true,
      disabledMessage: AI_CHAT_NOT_AUTHORIZED_STUDENT,
    });
  });

  it('returns the section-specific teacher message when the selected section is blocked', () => {
    mockState.currentUser.isTeacher = true;
    mockSelectedSectionAccessLevel = 'blocked';
    mockAreAiChatToolsEnabled.mockImplementation(
      ({aiChatAccessLevel}: {aiChatAccessLevel?: string}) =>
        aiChatAccessLevel !== 'blocked'
    );

    const {result} = renderHook(() =>
      useAiChatDisabledState({appName: 'pythonlab'})
    );

    expect(result.current).toEqual({
      disabled: true,
      disabledMessage: 'Chat is disabled for this class section.',
      disabledLink: {
        href: AI_SETTINGS_SUPPORT_LINK,
        text: 'Learn more',
      },
    });
  });

  it('returns the teacher authorization message when teacher access is denied', () => {
    mockState.currentUser.isTeacher = true;
    mockAreAiChatToolsEnabled.mockReturnValue(false);

    const {result} = renderHook(() =>
      useAiChatDisabledState({appName: 'pythonlab'})
    );

    expect(result.current).toEqual({
      disabled: true,
      disabledMessage: AI_CHAT_NOT_AUTHORIZED_TEACHER,
      disabledLink: {
        href: VERIFIED_TEACHER_SUPPORT_LINK,
        text: 'Learn how to become a verified teacher',
      },
    });
  });
});
