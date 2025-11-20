import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import progress from '@cdo/apps/code-studio/progressRedux';
import {INITIAL_VERSION_ID} from '@cdo/apps/lab2/constants';
import lab, {setChannel} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import lab2Project, {
  setViewingOldVersion,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import lab2System from '@cdo/apps/lab2/redux/systemRedux';
import {Channel, ProjectVersion} from '@cdo/apps/lab2/types';
import VersionHistoryPanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/VersionHistory/VersionHistoryPanel';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

const SAMPLE_VERSION_LIST: ProjectVersion[] = [
  {versionId: '0', lastModified: '2024-11-25T18:11:10.000Z', isLatest: false},
  {versionId: '1', lastModified: '2024-12-25T18:11:10.000Z', isLatest: false},
  {versionId: '2', lastModified: '2025-01-25T18:11:10.000Z', isLatest: false},
  {versionId: '3', lastModified: '2025-02-25T18:11:10.000Z', isLatest: true},
];

const ownedChannel: Channel = {
  id: '1',
  name: '1',
  isOwner: true,
  projectType: 'pythonlab',
  publishedAt: null,
  createdAt: '',
  updatedAt: '',
};

describe('VersionHistoryPanel', () => {
  let store: Store;
  let mockedProjectManager: jest.Mocked<ProjectManager>;
  const setSelectedVersion = jest.fn();

  beforeEach(() => {
    stubRedux();
    registerReducers({
      lab2Project,
      progress,
      lab,
      lab2System,
    });

    store = getStore();
    mockedProjectManager = {
      getVersionList: jest.fn(() => Promise.resolve(SAMPLE_VERSION_LIST)),
      restoreSources: jest.fn(() => Promise.resolve({source: 'restored'})),
      loadSources: jest.fn(() => Promise.resolve({source: 'loaded'})),
      flushSave: jest.fn(),
    } as unknown as jest.Mocked<ProjectManager>;
    Lab2Registry.getInstance().setProjectManager(mockedProjectManager);
    // Set up the channel so we are not in read only mode (isOwner = true)
    store.dispatch(setChannel(ownedChannel));
  });

  afterEach(() => {
    restoreRedux();
    jest.resetAllMocks();
  });

  function renderDefault(overrides = {}) {
    const defaultProps = {
      startSources: {source: ''},
      selectedVersion: '3',
      setSelectedVersion,
      appName: 'pythonlab',
      levelId: 123,
      disabled: false,
      ...overrides,
    };

    return render(
      <ThemeProvider>
        <Provider store={store}>
          <VersionHistoryPanel {...defaultProps} />
        </Provider>
      </ThemeProvider>
    );
  }

  it('renders version list on load', async () => {
    renderDefault();

    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 3000}
    );

    // Initial version should always be the bottom option in the list.
    // We look for initial version rather than one of the dated versions to avoid issues with time zones.
    expect(screen.getByText('Initial version')).toBeInTheDocument();
  });

  it('renders alert if getVersionList fails', async () => {
    mockedProjectManager = {
      getVersionList: jest.fn().mockRejectedValue(new Error()),
    } as unknown as jest.Mocked<ProjectManager>;
    Lab2Registry.getInstance().setProjectManager(mockedProjectManager);

    renderDefault();

    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 2000}
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('selects latest version on load', async () => {
    renderDefault({selectedVersion: ''});

    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 2000}
    );

    await waitFor(() => {
      expect(setSelectedVersion).toHaveBeenCalledWith('3');
    });
  });

  it('selects initial version if there is no version list', async () => {
    mockedProjectManager = {
      getVersionList: jest.fn(() => Promise.resolve([])),
      loadSources: jest.fn(() => Promise.resolve({source: 'loaded'})),
      flushSave: jest.fn(),
    } as unknown as jest.Mocked<ProjectManager>;
    Lab2Registry.getInstance().setProjectManager(mockedProjectManager);

    renderDefault({selectedVersion: ''});

    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 2000}
    );

    await waitFor(() => {
      expect(setSelectedVersion).toHaveBeenCalledWith(INITIAL_VERSION_ID);
    });
  });

  it('loads selected version when version is clicked', async () => {
    renderDefault();

    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 2000}
    );

    const versionInput = screen.getByDisplayValue('2') as HTMLInputElement;
    expect(versionInput.checked).toBe(false);

    const user = userEvent.setup();
    await user.click(versionInput);

    await waitFor(() => {
      expect(setSelectedVersion).toHaveBeenCalledWith('2');
    });

    expect(mockedProjectManager.loadSources).toHaveBeenCalled();
  });

  it('restores selected version on restore', async () => {
    renderDefault({selectedVersion: '0'});

    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 2000}
    );

    const restoreButton = screen.getByRole('button', {name: 'Restore'});
    const user = userEvent.setup();
    await user.click(restoreButton);

    await waitFor(
      () =>
        expect(mockedProjectManager.restoreSources).toHaveBeenCalledWith('0'),
      {timeout: 2000}
    );
  });

  it('disables restore button when initial version is latest', async () => {
    mockedProjectManager = {
      getVersionList: jest.fn(() => Promise.resolve([])),
      loadSources: jest.fn(() => Promise.resolve({source: 'loaded'})),
      flushSave: jest.fn(),
    } as unknown as jest.Mocked<ProjectManager>;
    Lab2Registry.getInstance().setProjectManager(mockedProjectManager);

    renderDefault({selectedVersion: INITIAL_VERSION_ID});

    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 2000}
    );

    // When viewing the latest version, the restore button should not be shown
    expect(
      screen.queryByRole('button', {name: 'Restore'})
    ).not.toBeInTheDocument();
  });

  it('disables restore button when selected version is latest', async () => {
    renderDefault({selectedVersion: '3'});

    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 2000}
    );

    // When viewing the latest version (3), the restore button should not be shown
    expect(
      screen.queryByRole('button', {name: 'Restore'})
    ).not.toBeInTheDocument();
  });

  it('enables restore button when selected version is not latest', async () => {
    renderDefault({selectedVersion: '0'});

    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 2000}
    );

    const restoreButton = screen.getByRole('button', {name: 'Restore'});
    expect(restoreButton).not.toBeDisabled();
  });

  it('selects selected version on load if viewing an old version', async () => {
    store.dispatch(setViewingOldVersion(true));

    renderDefault({selectedVersion: '2'});

    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 2000}
    );

    const versionInput = screen.getByDisplayValue('2') as HTMLInputElement;
    expect(versionInput.checked).toBe(true);
  });

  it('hides restore button when viewing as another user', async () => {
    // Set viewAsUserId to simulate a teacher viewing a student's project
    store = getStore();
    store.dispatch({type: 'progress/setViewAsUserId', payload: 456});

    renderDefault({selectedVersion: '0'});

    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 2000}
    );

    // Restore button should not be shown for teachers viewing student projects
    expect(
      screen.queryByRole('button', {name: 'Restore'})
    ).not.toBeInTheDocument();
    // Cancel button should still be available
    expect(screen.getByRole('button', {name: 'Cancel'})).toBeInTheDocument();
  });

  it('shows loading state while loading version list', () => {
    mockedProjectManager = {
      getVersionList: jest.fn(() => new Promise(() => {})), // Never resolves
    } as unknown as jest.Mocked<ProjectManager>;
    Lab2Registry.getInstance().setProjectManager(mockedProjectManager);

    renderDefault();

    // While loading, the version list should not be visible yet
    expect(screen.queryByText('Initial version')).not.toBeInTheDocument();
    // And there should be no error alert
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('disables interactions when disabled prop is true', async () => {
    renderDefault({selectedVersion: '0', disabled: true});

    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 2000}
    );

    const restoreButton = screen.getByRole('button', {name: 'Restore'});
    const cancelButton = screen.getByRole('button', {name: 'Cancel'});

    expect(restoreButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });
});
