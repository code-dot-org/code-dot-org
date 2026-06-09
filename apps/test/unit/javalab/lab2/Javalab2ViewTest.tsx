import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {render} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import progress from '@cdo/apps/code-studio/progressRedux';
import Javalab2View from '@cdo/apps/javalab/lab2/Javalab2View';
import {JavalabLevelProperties} from '@cdo/apps/javalab/lab2/types';
import lab, {setChannel} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
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

// useSource normally writes the start code into redux and triggers a throttled
// (no-op) save of its own. Stub it so the test isolates the first-load forced
// save added in Javalab2View; redux is seeded directly below.
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
  let save: jest.Mock;

  beforeEach(() => {
    stubRedux();
    registerReducers({progress, lab2Project, lab, lab2System, currentUser});
    store = getStore();

    save = jest.fn();
    jest
      .spyOn(Lab2Registry.getInstance(), 'getProjectManager')
      // The view only calls save(); a partial mock is enough.
      .mockReturnValue({save} as never);
  });

  afterEach(() => {
    restoreRedux();
    jest.restoreAllMocks();
  });

  function renderView(initialSources: ProjectSources | undefined) {
    // Seed the loaded start code, as useSource would, plus the owned channel
    // the read-only check reads from redux.
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

  it('force-saves the start code to S3 on first load when no server sources exist', () => {
    renderView(undefined);

    expect(save).toHaveBeenCalledTimes(1);
    const [savedSources, , , skipSourcesChangedCheck] = save.mock.calls[0];
    expect(savedSources).toEqual(projectSources);
    expect(skipSourcesChangedCheck).toBe(true);
  });

  it('does not force-save when the project was loaded from the server', () => {
    renderView(projectSources);

    expect(save).not.toHaveBeenCalled();
  });
});
