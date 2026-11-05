import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {LevelProperties} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

// ---- Module mocks --------------------------------------------------------

// lab2ReduxSelectors (imported by ResourcePanel itself) pulls in progressHelpers
// -> lessonLockRedux -> teacherSectionsRedux -> accounts/constants, which calls
// makeEnum at module-eval time and breaks the test environment. Stub it.
jest.mock('@cdo/apps/lab2/redux/lab2ReduxSelectors', () => ({
  isReadOnlyWorkspace: () => false,
  isPermanentlyReadOnlyWorkspace: () => false,
  isReadOnlyPredictLevel: () => false,
}));

// lab2Redux drags in the same transitive chain. Stub for safety.
jest.mock('@cdo/apps/lab2/lab2Redux', () => ({
  __esModule: true,
  default: (state = {}) => state,
}));
jest.mock('@cdo/apps/lab2/redux/lab2ProjectRedux', () => ({
  __esModule: true,
  default: (state = {channelId: null, projectType: 'weblab2'}) => state,
  resetProjectMetadata: () => ({type: 'lab2Project/resetProjectMetadata'}),
}));
jest.mock('@cdo/apps/lab2/redux/lab2ViewRedux', () => ({
  __esModule: true,
  default: (state = {}) => state,
}));
jest.mock('@cdo/apps/lab2/redux/predictLevelRedux', () => ({
  __esModule: true,
  default: (state = {}) => state,
}));
jest.mock('@cdo/apps/templates/currentUserRedux', () => ({
  __esModule: true,
  default: (state = {isTeacher: false, userId: null, userType: 'student'}) =>
    state,
}));

// AiTutorChat and AiTutorChatWithInstructionsDrawer both pull in aichat/redux
// -> StatsigReporter -> logToCloud -> makeEnum, which fails at module-eval time.
jest.mock('@cdo/apps/lab2/views/components/AiTutorChat', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/AiTutorChatWithInstructionsDrawer/AiTutorChatWithInstructionDrawer',
  () => ({__esModule: true, default: () => null})
);
// aichat/redux itself is transitively imported by several paths.
jest.mock('@cdo/apps/aichat/redux', () => ({
  __esModule: true,
  default: (state = {}) => state,
}));
// logToCloud is the root of the makeEnum failure; stub it.
jest.mock('@cdo/apps/logToCloud', () => ({
  PageAction: {},
  logToCloud: jest.fn(),
}));

jest.mock('@code-dot-org/component-library/common/contexts', () => ({
  useTheme: () => ({theme: 'Light'}),
  ThemeProvider: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

jest.mock('@cdo/apps/lab2/views/components/rubrics/RubricWrapper', () => ({
  useRubric: () => ({showRubric: false}),
}));

jest.mock('@cdo/apps/aichat/helpers/aiChatAccess', () => ({
  shouldShowAiTutor: () => false,
}));

jest.mock('@cdo/apps/aichat/hooks/useAiChatDisabledState', () => ({
  useAiChatDisabledState: () => undefined,
}));

jest.mock('@cdo/apps/lab2/productTours/useResourcePanelTours', () => ({
  __esModule: true,
  default: () => undefined,
}));

jest.mock('@cdo/apps/lab2/productTours/productToursPerLab', () => ({
  ToursPerLab: {},
  isTourAvailableOnLevel: () => false,
  isTourEnabledOnLevel: () => false,
}));

jest.mock('@cdo/apps/lab2/keyboardShortcuts/shortcutsPerLab', () => ({
  getLabShortcuts: () => undefined,
}));

jest.mock('@cdo/apps/lab2/utils', () => ({
  sendLab2AnalyticsEvent: jest.fn(),
  tryGetLocalStorage: () => 'yes',
  trySetLocalStorage: jest.fn(),
}));

jest.mock('@cdo/apps/utils', () => ({
  tryGetLocalStorage: () => 'yes',
  trySetLocalStorage: jest.fn(),
}));

jest.mock('@cdo/apps/lab2/hooks/usePanelPosition', () => ({
  __esModule: true,
  default: () => ({}),
}));

jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Footer/setFooterVisibility',
  () => ({__esModule: true, default: jest.fn()})
);

jest.mock('@cdo/apps/lab2/views/LabViewsRenderer', () => ({
  useExtraLinksButtonContext: () => ({setShowExtraLinksButton: jest.fn()}),
}));

// Stub all sub-panels so they don't need their own dependencies.
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/UnifiedBackpackPanel',
  () => ({__esModule: true, default: () => <div>Backpack Panel</div>})
);
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/VersionHistory',
  () => ({VersionHistoryPanel: () => <div>Version History Panel</div>})
);
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Validation/ValidationPanel',
  () => ({__esModule: true, default: () => <div>Validation Panel</div>})
);
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/StudentResources/StudentResourcesPanel',
  () => ({__esModule: true, default: () => <div>Student Resources Panel</div>})
);
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/InstructionsV2',
  () => ({__esModule: true, default: () => <div>Instructions</div>})
);
jest.mock('@cdo/apps/lab2/views/components/PanelContainer', () => ({
  __esModule: true,
  default: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Footer/ResourcePanelExtraLinks',
  () => ({__esModule: true, default: () => null})
);
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Footer/CopyrightButton',
  () => ({__esModule: true, default: () => null})
);
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Footer/DisclaimerButton',
  () => ({__esModule: true, default: () => null})
);
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Footer/SettingsPanel',
  () => ({__esModule: true, default: () => null})
);
jest.mock('@cdo/apps/lab2/views/components/IconButtonWithTooltip', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock(
  '@cdo/apps/aichat/views/aiChatHeaderButtons/AiChatHeaderButtons',
  () => ({
    __esModule: true,
    default: () => null,
  })
);
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/BackpackHeaderButtons',
  () => ({__esModule: true, default: () => null})
);
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/NavigationArea',
  () => ({__esModule: true, default: () => null})
);
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ForTeachersOnly',
  () => ({__esModule: true, default: () => <div>Teachers Only</div>})
);
jest.mock('@cdo/apps/lab2/ai/ai-tutor-model-id', () => ({
  aiTutorModelId: 'test-model-id',
}));

// ---- Helpers -------------------------------------------------------------

function makeLevelProperties(
  overrides: Partial<LevelProperties> = {}
): LevelProperties {
  return {
    id: 1,
    name: 'test',
    appName: 'weblab2' as LevelProperties['appName'],
    longInstructions: 'Do the thing.',
    ...overrides,
  } as LevelProperties;
}

describe('ResourcePanel — hideNonInstructionTabs', () => {
  let store: Store;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      // Minimal stubs — the real reducers pull transitive deps that fail at
      // module eval time (makeEnum, etc.). The ResourcePanel only reads a few
      // fields; defaults here cover them all.
      lab: (state = {}) => state,
      lab2Project: (state = {channelId: null, projectType: 'weblab2'}) => state,
      lab2View: (state = {}) => state,
      predictLevel: (state = {}) => state,
      currentUser: (
        state = {isTeacher: false, userId: null, userType: 'student'}
      ) => state,
      progress: (state = {currentLessonId: 1, viewAsUserId: null}) => state,
    });
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
    jest.clearAllMocks();
  });

  function renderPanel(
    levelPropertiesOverrides: Partial<LevelProperties> = {}
  ) {
    const levelProperties = makeLevelProperties(levelPropertiesOverrides);
    return render(
      <Provider store={store}>
        <ResourcePanel
          levelProperties={levelProperties}
          isRunning={false}
          hasRun={false}
          hasEdited={false}
          versionHistoryProps={{
            startSources: {source: ''},
            onLoadVersion: jest.fn(),
          }}
          backpackProps={{
            validateFileName: () => ({
              isSupportFileName: true,
              newFileName: 'f',
            }),
            saveFileToProject: jest.fn(),
            createNewProjectFile: jest.fn(),
            findIdForFileName: jest.fn(),
            supportedFileTypes: [],
          }}
        />
      </Provider>
    );
  }

  it('shows Backpack and Version History tabs by default', () => {
    renderPanel();
    expect(screen.getByRole('button', {name: 'Backpack'})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Version History'})
    ).toBeInTheDocument();
  });

  it('hides Backpack and Version History tabs when hideNonInstructionTabs is true', () => {
    renderPanel({hideNonInstructionTabs: true});
    expect(
      screen.queryByRole('button', {name: 'Backpack'})
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Version History'})
    ).not.toBeInTheDocument();
  });

  it('still shows the Instructions tab when hideNonInstructionTabs is true', () => {
    renderPanel({hideNonInstructionTabs: true});
    expect(
      screen.getByRole('button', {name: 'Instructions'})
    ).toBeInTheDocument();
  });
});
