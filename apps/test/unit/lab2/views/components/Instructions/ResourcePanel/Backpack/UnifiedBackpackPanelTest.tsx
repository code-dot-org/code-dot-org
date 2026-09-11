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

const SAVE_BUTTON_TEXT = 'Save Sketch to Backpack';

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

// The chip fetches on its own behalf; this suite only cares about the save button.
jest.mock(
  '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/BackpackFileChip',
  () => ({
    __esModule: true,
    default: ({fileName}: {fileName: string}) => <div>{fileName}</div>,
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
    mockBackpackApi.getFileLists.mockReset();
    mockBackpackApi.getFileLists.mockResolvedValue({});
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
