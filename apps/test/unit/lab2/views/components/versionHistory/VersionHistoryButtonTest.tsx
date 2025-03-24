import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import progress from '@cdo/apps/code-studio/progressRedux';
import lab, {setChannel} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import lab2Project from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import lab2System from '@cdo/apps/lab2/redux/systemRedux';
import {Channel, ProjectVersion} from '@cdo/apps/lab2/types';
import VersionHistoryButton from '@cdo/apps/lab2/views/components/versionHistory/VersionHistoryButton';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

const SAMPLE_VERSION_LIST: ProjectVersion[] = [
  {versionId: '0', lastModified: '2024-11-25T18:11:10.000Z', isLatest: false},
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

// Mock this component to speed up tests.
jest.mock('@code-dot-org/component-library/tooltip', () => {
  return {
    WithTooltip: function MockWithTooltip(props: {children: React.ReactNode}) {
      return <div>{props.children}</div>;
    },
    TooltipProps: {},
  };
});

describe('VersionHistoryButton', () => {
  let store: Store;
  let mockedProjectManager: jest.Mocked<ProjectManager>;

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
      restoreSources: jest.fn(() => Promise.resolve('')),
    } as unknown as jest.Mocked<ProjectManager>;
    Lab2Registry.getInstance().setProjectManager(mockedProjectManager);
    // Set up the channel so we are not in read only mode (isOwner = true)
    store.dispatch(setChannel(ownedChannel));
  });

  afterEach(() => {
    restoreRedux();
    jest.resetAllMocks();
  });

  function renderDefault() {
    return render(
      <Provider store={store}>
        <VersionHistoryButton startSources={{source: ''}} />
      </Provider>
    );
  }

  it('renders version list on click', async () => {
    const {getByRole, getByText} = renderDefault();
    const button = await screen.findByRole('button', {name: 'Version History'});

    const user = userEvent.setup();
    await act(async () => {
      user.click(button);
    });
    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 3000}
    );

    // We use the functions returned from render because the dialog is rendered to document.body,
    // so we can't use screen.getByRole, etc.
    getByRole('dialog', {name: 'Version History List'});
    // Initial version should always be the bottom option in the list.
    // We look for initial version rather than one of the dated versions to avoid issues with time zones.
    getByText('Initial version');
    getByRole('button', {name: 'Restore'});
    getByRole('button', {name: 'Cancel'});
  });

  it('renders alert if getVersionList fails', async () => {
    mockedProjectManager = {
      getVersionList: jest.fn().mockRejectedValue(new Error()),
    } as unknown as jest.Mocked<ProjectManager>;
    Lab2Registry.getInstance().setProjectManager(mockedProjectManager);

    const {getByRole} = renderDefault();
    const button = await screen.findByRole('button', {name: 'Version History'});

    const user = userEvent.setup();
    await act(async () => {
      user.click(button);
    });
    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 2000}
    );

    // We use the functions returned from render because the dialog is rendered to document.body,
    // so we can't use screen.getByRole, etc.
    getByRole('dialog', {name: 'Version History List'});
    getByRole('alert');
  });

  it('selects latest version on load', async () => {
    const {getByDisplayValue} = renderDefault();
    const button = await screen.findByRole('button', {name: 'Version History'});

    const user = userEvent.setup();
    await act(async () => {
      user.click(button);
    });
    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 2000}
    );

    // 3 is the latest version in the sample version list.
    const latestVersion = getByDisplayValue('3') as HTMLInputElement;
    expect(latestVersion.checked).toBe(true);
  });

  it('selects initial version if there is no version list', async () => {
    mockedProjectManager = {
      getVersionList: jest.fn(() => Promise.resolve([])),
    } as unknown as jest.Mocked<ProjectManager>;
    Lab2Registry.getInstance().setProjectManager(mockedProjectManager);

    const {getByDisplayValue} = renderDefault();
    const button = await screen.findByRole('button', {name: 'Version History'});

    const user = userEvent.setup();
    await act(async () => {
      user.click(button);
    });
    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 2000}
    );

    const initialVersion = getByDisplayValue(
      'initial-version'
    ) as HTMLInputElement;
    expect(initialVersion.checked).toBe(true);
  });

  it('restores selected version on restore', async () => {
    const {getByDisplayValue, getByRole, queryByRole} = renderDefault();

    const button = await screen.findByRole('button', {name: 'Version History'});

    const user = userEvent.setup();
    await act(async () => {
      user.click(button);
    });
    await waitFor(
      () => expect(mockedProjectManager.getVersionList).toHaveBeenCalled(),
      {timeout: 2000}
    );

    const versionInput = getByDisplayValue('0') as HTMLInputElement;
    await user.click(versionInput);

    const restoreButton = getByRole('button', {name: 'Restore'});
    await act(async () => {
      user.click(restoreButton);
    });
    await waitFor(
      () =>
        expect(mockedProjectManager.restoreSources).toHaveBeenCalledWith('0'),
      {timeout: 2000}
    );
    expect(queryByRole('dialog', {name: 'Version History List'})).toBeNull();
  });
});
