import {act, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import UnifiedBackpackPanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/UnifiedBackpackPanel';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import {BackpackEvent} from '@cdo/apps/sharedComponents/backpack/types';

const SAVE_BUTTON_TEXT = 'Save Sketch to Backpack';

const mockShowToast = jest.fn();
jest.mock('@code-dot-org/component-library/toast', () => ({
  useToast: () => mockShowToast,
}));

const mockBackpackApi = {
  getFileLists: jest.fn(),
  addEventListener: jest.fn().mockReturnValue('listener-id'),
  removeEventListener: jest.fn(),
  getClientForAppType: jest.fn().mockReturnValue({}),
};

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getUnifiedBackpackApi: () => mockBackpackApi,
      getMetricsReporter: () => ({logError: jest.fn()}),
    }),
  },
}));

// The chip fetches on its own behalf; this suite only cares about what the panel
// hands it, so the stand-in renders the name and the recently-saved flag.
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/BackpackFileChip',
  () => ({
    __esModule: true,
    // The panel reads this to time the flag; without it the timer fires at once.
    SHOW_RECENTLY_ADDED_DURATION_MS: 4000,
    default: ({
      fileName,
      isRecentlyAdded,
      addAlert,
    }: {
      fileName: string;
      isRecentlyAdded?: boolean;
      addAlert: (type: string, message: string) => void;
    }) => (
      <div>
        {isRecentlyAdded ? `${fileName} (added)` : fileName}
        <button type="button" onClick={() => addAlert('success', 'in project')}>
          {`add ${fileName} to project`}
        </button>
      </div>
    ),
  })
);

describe('UnifiedBackpackPanel', () => {
  let store: Store;
  let onClick: jest.Mock;

  const renderPanel = ({
    withSaveButton = true,
    viewingOldVersion = false,
  } = {}) => {
    registerReducers({
      currentUser: () => ({userId: 1}),
      lab2Project: () => ({viewingOldVersion}),
    });
    store = getStore();
    return render(
      <Provider store={store}>
        <UnifiedBackpackPanel
          validateFileName={() => ({isSupportFileName: false, newFileName: ''})}
          saveFileToProject={jest.fn()}
          createNewProjectFile={jest.fn()}
          findIdForFileName={() => undefined}
          openPanelCallback={jest.fn()}
          supportedFileTypes={['png']}
          backpackRefreshKey={0}
          saveToBackpackButton={
            withSaveButton ? {text: SAVE_BUTTON_TEXT, onClick} : undefined
          }
        />
      </Provider>
    );
  };

  const saveButton = () => screen.getByRole('button', {name: SAVE_BUTTON_TEXT});

  beforeEach(() => {
    onClick = jest.fn();
    mockShowToast.mockReset();
    mockBackpackApi.getFileLists.mockReset();
    mockBackpackApi.getFileLists.mockResolvedValue({});
    mockBackpackApi.addEventListener.mockClear();
    stubRedux();
  });

  afterEach(() => {
    restoreRedux();
  });

  it('hands the save button every backpack file name', async () => {
    const user = userEvent.setup();
    mockBackpackApi.getFileLists.mockResolvedValue({
      universal: ['tree.png'],
      sketchlab: ['house.png'],
    });
    renderPanel();

    await waitFor(() => expect(saveButton()).toBeEnabled());
    await user.click(saveButton());

    expect(onClick).toHaveBeenCalledWith(
      ['tree.png', 'house.png'],
      expect.any(Function)
    );
  });

  it('toasts what the save reports back', async () => {
    const user = userEvent.setup();
    renderPanel();

    await waitFor(() => expect(saveButton()).toBeEnabled());
    await user.click(saveButton());

    const notify = onClick.mock.calls[0][1];
    notify('info', 'Saving sketch.png to your Backpack...');
    notify('success', 'sketch.png saved to your Backpack.');

    expect(mockShowToast.mock.calls).toEqual([
      [
        'Saving sketch.png to your Backpack...',
        {type: 'info', autoHideDuration: null},
      ],
      [
        'sketch.png saved to your Backpack.',
        {type: 'success', autoHideDuration: 4000},
      ],
    ]);
  });

  it('marks a file the backpack just accepted, not one added to the project', async () => {
    const user = userEvent.setup();
    mockBackpackApi.getFileLists.mockResolvedValue({universal: ['tree.png']});
    renderPanel();

    await screen.findByText('tree.png');
    // Adding to the project says nothing about what the backpack holds.
    await user.click(
      screen.getByRole('button', {name: 'add tree.png to project'})
    );
    expect(screen.getByText('tree.png')).toBeInTheDocument();

    const listener = mockBackpackApi.addEventListener.mock.calls.at(-1)?.[0];
    act(() => listener(BackpackEvent.FileAdded, 'tree.png', 'universal'));

    await screen.findByText('tree.png (added)');
  });

  it('marks only the backpack the file was saved to', async () => {
    mockBackpackApi.getFileLists.mockResolvedValue({
      universal: ['tree.png'],
      sketchlab: ['tree.png'],
    });
    renderPanel();

    await waitFor(() => expect(screen.getAllByText('tree.png')).toHaveLength(2));

    const listener = mockBackpackApi.addEventListener.mock.calls.at(-1)?.[0];
    act(() => listener(BackpackEvent.FileAdded, 'tree.png', 'universal'));

    await screen.findByText('tree.png (added)');
    // The copy in the other backpack is untouched, so it keeps its add button.
    expect(screen.getByText('tree.png')).toBeInTheDocument();
  });

  it('keeps the save button when the file list fails to load', async () => {
    mockBackpackApi.getFileLists.mockRejectedValue(new Error('network down'));
    renderPanel();

    await screen.findByText('An error occurred');
    expect(saveButton()).toBeInTheDocument();
  });

  it('disables the save button while an old version is open', async () => {
    renderPanel({viewingOldVersion: true});

    await screen.findByText('Your Backpack is empty');
    expect(saveButton()).toBeDisabled();
  });

  it('disables the save button until the save finishes', async () => {
    const user = userEvent.setup();
    let finishSave = () => {};
    onClick.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          finishSave = resolve;
        })
    );
    renderPanel();

    await waitFor(() => expect(saveButton()).toBeEnabled());
    await user.click(saveButton());
    expect(saveButton()).toBeDisabled();

    await act(async () => {
      finishSave();
    });
    expect(saveButton()).toBeEnabled();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders no save button when the lab supplies none', async () => {
    renderPanel({withSaveButton: false});

    await screen.findByText('Your Backpack is empty');
    expect(screen.queryByRole('button', {name: SAVE_BUTTON_TEXT})).toBeNull();
  });
});
