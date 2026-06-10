import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {Codebridge} from '@codebridge/Codebridge';
import {render} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import progress from '@cdo/apps/code-studio/progressRedux';
import Javalab2View from '@cdo/apps/javalab/lab2/Javalab2View';
import {handleRunClick} from '@cdo/apps/javalab/lab2/javabuilderRunUtils';
import {JavalabLevelProperties} from '@cdo/apps/javalab/lab2/types';
import lab, {setChannel} from '@cdo/apps/lab2/lab2Redux';
import lab2Project, {
  setProjectSource,
  setProjectSourceLevelId,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import lab2System from '@cdo/apps/lab2/redux/systemRedux';
import {Channel, MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import currentUser from '@cdo/apps/templates/currentUserRedux';

jest.mock('@codebridge/Codebridge', () => ({
  Codebridge: jest.fn(() => <div>Codebridge</div>),
}));

jest.mock('@cdo/apps/javalab/lab2/javabuilderRunUtils', () => ({
  handleRunClick: jest.fn(),
  stopJavaCode: jest.fn(),
  sendJavaConsoleInput: jest.fn(),
}));

// useSource normally writes the start code into redux and triggers a throttled
// (no-op) save of its own. Stub it and seed redux directly below.
jest.mock('@codebridge/hooks/useSource', () => ({
  useSource: () => ({startSources: undefined}),
}));

const LEVEL_ID = 5;

const levelProperties: JavalabLevelProperties = {
  id: LEVEL_ID,
  name: '',
  appName: 'javalab',
};

const source: MultiFileSource = {folders: {}, files: {}};
const projectSources: ProjectSources = {source};

const channel: Channel = {
  id: 'test-channel',
  name: '',
  isOwner: true,
  projectType: 'javalab',
  publishedAt: null,
  createdAt: '',
  updatedAt: '',
};

describe('Javalab2View', () => {
  let store: Store;

  beforeEach(() => {
    jest.clearAllMocks();
    stubRedux();
    registerReducers({progress, lab2Project, lab, lab2System, currentUser});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderView(initialSources: ProjectSources | undefined) {
    // Seed the loaded code, as useSource would.
    store.dispatch(setChannel(channel));
    store.dispatch(setProjectSource(projectSources));
    store.dispatch(setProjectSourceLevelId(LEVEL_ID));
    return render(
      <Provider store={store}>
        <ThemeProvider>
          <Javalab2View
            levelProperties={levelProperties}
            initialSources={initialSources}
            channel={channel}
          />
        </ThemeProvider>
      </Provider>
    );
  }

  // The run flow lives in javabuilderRunUtils (mocked); the view's job is
  // telling it whether the project has server sources yet.
  async function runFromView() {
    const codebridgeProps = (Codebridge as unknown as jest.Mock).mock.calls.at(
      -1
    )[0];
    await codebridgeProps.onRun(
      /* runTests */ false,
      jest.fn(),
      /* source */ undefined
    );
    const handleRunClickArgs = (handleRunClick as jest.Mock).mock.calls.at(-1);
    return {needsInitialSourcesSave: handleRunClickArgs[5]};
  }

  it('requests an initial sources save on run when no server sources exist', async () => {
    renderView(undefined);

    const {needsInitialSourcesSave} = await runFromView();
    expect(needsInitialSourcesSave).toBe(true);
  });

  it('does not request an initial sources save when the project was loaded from the server', async () => {
    renderView(projectSources);

    const {needsInitialSourcesSave} = await runFromView();
    expect(needsInitialSourcesSave).toBe(false);
  });
});
