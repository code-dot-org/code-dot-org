import {act, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {AILAB_DEFAULT_SOURCES} from '@cdo/apps/ailab/lab2/sources';
import {AilabLevelProperties} from '@cdo/apps/ailab/lab2/types';
import AilabView from '@cdo/apps/ailab/lab2/views/AilabView';
import AilabWorkspace from '@cdo/apps/ailab/lab2/views/AilabWorkspace';
import useSources from '@cdo/apps/lab2/hooks/useSources';
import lab from '@cdo/apps/lab2/lab2Redux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

jest.mock('@cdo/apps/lab2/hooks/useSources');
jest.mock('@cdo/apps/ailab/lab2/views/AilabWorkspace', () =>
  jest.fn(() => <button type="button">Settings</button>)
);

const mockedUseSources = jest.mocked(useSources);
const mockedWorkspace = jest.mocked(AilabWorkspace);

const LEVEL = {
  id: 1,
  name: 'level 1',
  appName: 'ailab',
} as AilabLevelProperties;

function sourcesLoaded(loaded: boolean) {
  mockedUseSources.mockReturnValue({
    currentSources: loaded ? AILAB_DEFAULT_SOURCES : undefined,
    projectManager: null,
    loadError: undefined,
    hasEdited: false,
    updateSources: jest.fn(),
    startOver: jest.fn(),
  } as unknown as ReturnType<typeof useSources>);
}

const overlay = () => document.querySelector('.uitest-is-loading-overlay');
const workspaceInert = () =>
  screen.getByRole('button', {name: 'Settings'}).parentElement?.inert;

const reportWorkspaceLoading = (isLoading: boolean) =>
  act(() => mockedWorkspace.mock.lastCall?.[0].onLoadingChange(isLoading));

describe('AilabView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stubRedux();
    registerReducers({lab});
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderView() {
    render(
      <Provider store={getStore()}>
        <AilabView levelProperties={LEVEL} />
      </Provider>
    );
  }

  it('shows lab2 loading while the project is fetched', () => {
    sourcesLoaded(false);
    renderView();

    expect(overlay()).not.toBeNull();
    expect(mockedWorkspace).not.toHaveBeenCalled();
  });

  it('keeps the overlay up while the workspace reports it is loading', () => {
    sourcesLoaded(true);
    renderView();

    reportWorkspaceLoading(true);
    expect(overlay()).not.toBeNull();
    expect(workspaceInert()).toBe(true);

    reportWorkspaceLoading(false);
    expect(overlay()).toBeNull();
    expect(workspaceInert()).toBe(false);
  });
});
