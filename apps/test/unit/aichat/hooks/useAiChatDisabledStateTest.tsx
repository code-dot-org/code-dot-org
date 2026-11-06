import {renderHook} from '@testing-library/react-hooks';

import shouldUseAiGateway from '@cdo/apps/aichat/api/shouldUseAiGateway';
import {
  AI_SETTINGS_SUPPORT_LINK,
  AI_CHAT_NOT_AUTHORIZED_STUDENT,
  AI_CHAT_NOT_AUTHORIZED_TEACHER,
  AI_CHAT_NOT_AVAILABLE_INTERNATIONAL,
  AI_TUTOR_NOT_AVAILABLE_INTERNATIONAL,
  AI_CHAT_LAB_FAQ_LINK,
  AI_TUTOR_FAQ_LINK,
  VERIFIED_TEACHER_SUPPORT_LINK,
} from '@cdo/apps/aichat/constants';
import {
  AI_GATEWAY_FALLBACK_DCDO_KEY,
  areAiChatToolsEnabled,
} from '@cdo/apps/aichat/helpers/aiChatAccess';
import {useAiChatDisabledState} from '@cdo/apps/aichat/hooks/useAiChatDisabledState';
import DCDO from '@cdo/apps/dcdo';
import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {
  AiChatClientTypes,
  AiChatModelIds,
  AiChatProviders,
} from '@cdo/generated-scripts/sharedConstants';

let mockState = {
  currentUser: {
    isTeacher: false,
    aiChatAccessLevel: 'enabled',
    blockedAichatProviders: [] as string[],
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
  ...jest.requireActual('@cdo/apps/aichat/helpers/aiChatAccess'),
  areAiChatToolsEnabled: jest.fn(),
}));

jest.mock('@cdo/apps/aichat/api/shouldUseAiGateway', () => ({
  __esModule: true,
  default: jest.fn(),
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
const mockShouldUseAiGateway = shouldUseAiGateway as jest.MockedFunction<
  typeof shouldUseAiGateway
>;

const BLOCKED_PROVIDERS = [AiChatProviders.GOOGLE];

describe('useAiChatDisabledState', () => {
  beforeEach(() => {
    mockState = {
      currentUser: {
        isTeacher: false,
        aiChatAccessLevel: 'enabled',
        blockedAichatProviders: [] as string[],
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
    mockShouldUseAiGateway.mockReturnValue(false);
  });

  afterEach(() => {
    DCDO.reset();
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
        openInNewTab: true,
        text: 'Learn more',
      },
    });
  });

  it('returns the standard student message when a US only model is blocked', () => {
    mockState.currentUser.blockedAichatProviders = BLOCKED_PROVIDERS;

    const {result} = renderHook(() =>
      useAiChatDisabledState({
        appName: 'pythonlab',
        selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
      })
    );

    expect(result.current).toEqual({
      disabled: true,
      disabledMessage: AI_CHAT_NOT_AUTHORIZED_STUDENT,
    });
  });

  it('returns the tutor-specific region message and FAQ link for blocked teachers in ai tutor', () => {
    mockState.currentUser.isTeacher = true;
    mockState.currentUser.blockedAichatProviders = BLOCKED_PROVIDERS;

    const {result} = renderHook(() =>
      useAiChatDisabledState({
        appName: 'pythonlab',
        clientType: AiChatClientTypes.AI_TUTOR,
        selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
      })
    );

    // AI Tutor's model is the same on every level, so its copy must not blame
    // "this level" for the block.
    expect(result.current).toEqual({
      disabled: true,
      disabledMessage: AI_TUTOR_NOT_AVAILABLE_INTERNATIONAL,
      disabledLink: {
        href: AI_TUTOR_FAQ_LINK,
        openInNewTab: true,
        text: 'Learn more',
      },
    });
  });

  it('returns the level-scoped region message and FAQ link for blocked teachers in the aichat lab', () => {
    mockState.currentUser.isTeacher = true;
    mockState.currentUser.blockedAichatProviders = BLOCKED_PROVIDERS;

    const {result} = renderHook(() =>
      useAiChatDisabledState({
        appName: 'aichat',
        clientType: AiChatClientTypes.AI_CHAT_LAB,
        selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
      })
    );

    expect(result.current).toEqual({
      disabled: true,
      disabledMessage: AI_CHAT_NOT_AVAILABLE_INTERNATIONAL,
      disabledLink: {
        href: AI_CHAT_LAB_FAQ_LINK,
        openInNewTab: true,
        text: 'Learn more',
      },
    });
  });

  it('omits the FAQ link for blocked teachers when clientType is unknown', () => {
    mockState.currentUser.isTeacher = true;
    mockState.currentUser.blockedAichatProviders = BLOCKED_PROVIDERS;

    const {result} = renderHook(() =>
      useAiChatDisabledState({
        appName: 'pythonlab',
        selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
      })
    );

    expect(result.current).toEqual({
      disabled: true,
      disabledMessage: AI_CHAT_NOT_AVAILABLE_INTERNATIONAL,
    });
  });

  it('does not block models available outside the US for blocked users', () => {
    mockState.currentUser.isTeacher = true;
    mockState.currentUser.blockedAichatProviders = BLOCKED_PROVIDERS;

    const {result} = renderHook(() =>
      useAiChatDisabledState({
        appName: 'pythonlab',
        selectedModelId: AiChatModelIds.CHATGPT,
      })
    );

    expect(result.current).toEqual({disabled: false});
  });

  it('does not block US only models when the user is not blocked', () => {
    const {result} = renderHook(() =>
      useAiChatDisabledState({
        appName: 'pythonlab',
        selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
      })
    );

    expect(result.current).toEqual({disabled: false});
  });

  it('does not block when no selectedModelId is provided', () => {
    mockState.currentUser.blockedAichatProviders = BLOCKED_PROVIDERS;

    const {result} = renderHook(() =>
      useAiChatDisabledState({appName: 'pythonlab'})
    );

    expect(result.current).toEqual({disabled: false});
  });

  it('shows predict gating before the blocked message for teachers on an unsubmitted predict level', () => {
    mockState.currentUser.isTeacher = true;
    mockState.currentUser.blockedAichatProviders = BLOCKED_PROVIDERS;

    const {result} = renderHook(() =>
      useAiChatDisabledState({
        appName: 'pythonlab',
        clientType: AiChatClientTypes.AI_TUTOR,
        selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
        isPredictLevel: true,
        hasSubmittedPredictResponse: false,
      })
    );

    expect(result.current).toEqual({
      disabled: true,
      disabledMessage: 'Chat is disabled until you submit your prediction.',
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
        openInNewTab: true,
        text: 'Learn how to become a verified teacher',
      },
    });
  });

  describe('when the gateway fallback is enabled', () => {
    beforeEach(() => {
      DCDO.set(AI_GATEWAY_FALLBACK_DCDO_KEY, true);
      mockState.currentUser.blockedAichatProviders = BLOCKED_PROVIDERS;
    });

    it('enables a blocked model the gateway serves', () => {
      mockShouldUseAiGateway.mockReturnValue(true);

      const {result} = renderHook(() =>
        useAiChatDisabledState({
          appName: 'pythonlab',
          selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
        })
      );

      expect(result.current).toEqual({disabled: false});
    });

    it('still blocks a blocked model that Rails serves', () => {
      const {result} = renderHook(() =>
        useAiChatDisabledState({
          appName: 'pythonlab',
          selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
        })
      );

      expect(result.current).toEqual({
        disabled: true,
        disabledMessage: AI_CHAT_NOT_AUTHORIZED_STUDENT,
      });
    });
  });

  it('blocks a blocked model the gateway serves when the fallback is off', () => {
    mockState.currentUser.blockedAichatProviders = BLOCKED_PROVIDERS;
    mockShouldUseAiGateway.mockReturnValue(true);

    const {result} = renderHook(() =>
      useAiChatDisabledState({
        appName: 'pythonlab',
        selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
      })
    );

    expect(result.current).toEqual({
      disabled: true,
      disabledMessage: AI_CHAT_NOT_AUTHORIZED_STUDENT,
    });
  });
});
