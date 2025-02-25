import {render, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import progress from '@cdo/apps/code-studio/progressRedux';
import lab from '@cdo/apps/lab2/lab2Redux';
import lab2Project, {
  setViewingOldVersion,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {ProjectVersion} from '@cdo/apps/lab2/types';
import VersionHistoryDropdown from '@cdo/apps/lab2/views/components/versionHistory/VersionHistoryDropdown';
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

describe('VersionHistoryButton', () => {
  let store: Store;
  const closeDropdown = jest.fn();
  const setSelectedVersion = jest.fn();

  beforeEach(() => {
    stubRedux();
    registerReducers({
      lab2Project,
      progress,
      lab,
    });

    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
    jest.resetAllMocks();
  });

  function renderDefault() {
    return render(
      <Provider store={store}>
        <VersionHistoryDropdown
          versionList={SAMPLE_VERSION_LIST}
          startSources={{source: ''}}
          closeDropdown={closeDropdown}
          listLoaded={true}
          buttonRef={{} as jest.Mocked<React.RefObject<HTMLDivElement>>}
          listLoading={false}
          listLoadError={false}
          selectedVersion={''}
          setSelectedVersion={setSelectedVersion}
        />
      </Provider>
    );
  }

  it('loads selected version when version is clicked', async () => {
    const {getByDisplayValue} = renderDefault();

    const versionInput = getByDisplayValue('2') as HTMLInputElement;
    expect(versionInput.checked).toBe(false);

    const user = userEvent.setup();
    await user.click(versionInput);

    await waitFor(() => {
      expect(setSelectedVersion).toHaveBeenCalledWith('2');
    });
  });

  it('selects selected version on load if viewing an old version', async () => {
    store.dispatch(setViewingOldVersion(true));

    const {getByDisplayValue} = render(
      <Provider store={store}>
        <VersionHistoryDropdown
          versionList={SAMPLE_VERSION_LIST}
          startSources={{source: ''}}
          closeDropdown={closeDropdown}
          listLoaded={true}
          buttonRef={{} as jest.Mocked<React.RefObject<HTMLDivElement>>}
          listLoading={false}
          listLoadError={false}
          selectedVersion={'2'}
          setSelectedVersion={setSelectedVersion}
        />
      </Provider>
    );

    const versionInput = getByDisplayValue('2') as HTMLInputElement;
    expect(versionInput.checked).toBe(true);
  });
});
