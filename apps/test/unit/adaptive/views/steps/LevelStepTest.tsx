import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {LevelStep as LevelStepContent} from '@cdo/apps/adaptive/types';
import LevelStep from '@cdo/apps/adaptive/views/steps/LevelStep';
import {
  aichatReducer,
  addEventToChatEventsCurrent,
} from '@cdo/apps/aichat/redux/slice';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/adaptive/views/PathwayContext', () => ({
  usePathwayContext: () => ({
    pathway: {
      id: 'test-pathway',
      title: 'Test',
      project: {templateLevelName: 'tmpl'},
    },
    checkpoint: {id: 'ck', title: 'CK', steps: []},
    statusMap: {},
    progress: {steps: {}},
    saveGeneratedInstructions: jest.fn(),
    aiContext: undefined,
  }),
}));

jest.mock('@cdo/apps/adaptive/views/steps/useStepInstructions', () => ({
  useStepInstructions: () => ({
    instructions: 'Do the thing.',
    isResolved: true,
  }),
}));

jest.mock('@cdo/apps/adaptive/ai/tutorContext', () => ({
  buildTutorContext: () => 'context',
}));

jest.mock('@cdo/apps/adaptive/project/projectInfo', () => ({
  projectInfoFromChannel: () => ({name: undefined, description: undefined}),
}));

jest.mock('@cdo/apps/lab2/hooks/useSources', () => ({
  __esModule: true,
  default: () => ({
    isLoading: false,
    isEditable: true,
    hasEdited: false,
    currentSources: {source: ''},
    channel: undefined,
    projectManager: null,
    loadError: undefined,
  }),
}));

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      setProjectManager: jest.fn(),
      clearProjectManager: jest.fn(),
    }),
  },
}));

jest.mock('@cdo/apps/lab2/redux/lab2ProjectRedux', () => ({
  resetProjectMetadata: () => ({type: 'lab2Project/resetProjectMetadata'}),
}));

// lab2EntryPoints lives at apps/lab2EntryPoints.ts (outside apps/src/), so
// it cannot be referenced via the @cdo/apps/ alias. Resolve with a path
// relative to this test file (5 directories up from apps/test/unit/adaptive/views/steps/).
//
// TestView is defined inside the factory to avoid jest hoisting problems: jest.mock
// calls are hoisted above variable declarations, so any const defined in the module
// body would be uninitialized when the factory runs.
jest.mock('../../../../../lab2EntryPoints', () => {
  const React = require('react');
  const {
    ExternalNavigationContext,
  } = require('@cdo/apps/lab2/views/components/Instructions/ExternalNavigationContext');
  // Exposes navigation state via a Continue button (disabled/enabled) and
  // optional tooltip text, and renders the hideNonInstructionTabs flag as
  // visible text — all queryable without data-testid.
  function TestView({
    levelProperties,
  }: {
    levelProperties: {hideNonInstructionTabs?: boolean};
  }) {
    const nav = React.useContext(ExternalNavigationContext);
    return React.createElement('div', null, [
      React.createElement(
        'p',
        {key: 'tabs'},
        `hide tabs: ${String(levelProperties?.hideNonInstructionTabs)}`
      ),
      React.createElement(
        'button',
        {
          key: 'btn',
          type: 'button',
          disabled: !nav?.enabled,
          onClick: nav?.onContinue,
        },
        'Continue'
      ),
      nav?.tooltip ? React.createElement('p', {key: 'tip'}, nav.tooltip) : null,
    ]);
  }
  return {lab2EntryPoints: {weblab2: {view: TestView}}};
});

// Suppress Suspense-related console output in tests.
jest.mock('@cdo/apps/lab2/views/Loading', () => ({
  __esModule: true,
  default: () => <div>Loading...</div>,
}));

function makeLevelStep(
  levelPropertiesOverrides: Partial<LevelProperties> = {}
): LevelStepContent {
  return {
    id: 'step-1',
    kind: 'level',
    title: 'Step 1',
    level: 'test-level',
    levelProperties: {
      id: 1,
      name: 'test-level',
      appName: 'weblab2' as LevelProperties['appName'],
      ...levelPropertiesOverrides,
    },
  } as unknown as LevelStepContent;
}

describe('LevelStep (LevelPlayer)', () => {
  let store: Store;

  beforeEach(() => {
    stubRedux();
    registerReducers({aichat: aichatReducer});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
    jest.clearAllMocks();
  });

  function renderStep(step = makeLevelStep()) {
    return render(
      <Provider store={store}>
        <LevelStep
          step={step}
          continueLabel="Continue"
          onComplete={jest.fn()}
        />
      </Provider>
    );
  }

  it('sets hideNonInstructionTabs on viewProperties passed to the lab view', () => {
    renderStep();
    expect(screen.getByText('hide tabs: true')).toBeInTheDocument();
  });

  it('disables the Continue button when no chat messages have been sent', () => {
    renderStep();
    expect(screen.getByRole('button', {name: 'Continue'})).toBeDisabled();
    expect(
      screen.getByText('To continue, send a message to the AI tutor')
    ).toBeInTheDocument();
  });

  it('enables the Continue button after a user chat message is dispatched', () => {
    renderStep();
    store.dispatch(
      addEventToChatEventsCurrent({
        timestamp: 1,
        chatMessageText: 'Hello',
        role: Role.USER,
        status: AiInteractionStatus.UNKNOWN,
      })
    );
    expect(screen.getByRole('button', {name: 'Continue'})).toBeEnabled();
    expect(
      screen.queryByText('To continue, send a message to the AI tutor')
    ).not.toBeInTheDocument();
  });

  it('does not enable the Continue button from an assistant message alone', () => {
    renderStep();
    store.dispatch(
      addEventToChatEventsCurrent({
        timestamp: 1,
        chatMessageText: 'I can help!',
        role: Role.ASSISTANT,
        status: AiInteractionStatus.OK,
        requestId: 42,
      })
    );
    expect(screen.getByRole('button', {name: 'Continue'})).toBeDisabled();
  });
});
