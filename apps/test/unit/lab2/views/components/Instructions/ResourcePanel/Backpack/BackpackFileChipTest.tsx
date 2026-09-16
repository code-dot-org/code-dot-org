import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {Provider} from 'react-redux';

import progress from '@cdo/apps/code-studio/progressRedux';
import lab from '@cdo/apps/lab2/lab2Redux';
import lab2Project from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import BackpackFileChip from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/BackpackFileChip';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';

const FILE_NAME = 'sunset.png';

// The chip opens a confirmation dialog before deleting; answer it with `result`.
const dialogControlMock = {showDialog: jest.fn()};
jest.mock('@cdo/apps/lab2/views/dialogs', () => ({
  ...jest.requireActual('@cdo/apps/lab2/views/dialogs'),
  useDialogControl: () => dialogControlMock,
}));

describe('BackpackFileChip', () => {
  let showToast: jest.Mock;
  let addAlert: jest.Mock;
  let backpackApi: BackpackClientApi;

  beforeEach(() => {
    stubRedux();
    registerReducers({lab, lab2Project, progress});
    showToast = jest.fn();
    addAlert = jest.fn();
    dialogControlMock.showDialog.mockResolvedValue({type: 'confirm'});
    backpackApi = {
      getFileFetchUrl: () => undefined,
      deleteFiles: jest.fn((filenames, onError, onSuccess) => onSuccess()),
    } as unknown as BackpackClientApi;
  });

  afterEach(() => {
    restoreRedux();
    jest.clearAllMocks();
  });

  const renderChip = (props = {}) =>
    render(
      <Provider store={getStore()}>
        <ThemeProvider>
          <BackpackFileChip
            fileName={FILE_NAME}
            backpackApi={backpackApi}
            addAlert={addAlert}
            showToast={showToast}
            validateFileName={jest.fn()}
            saveFileToProject={jest.fn()}
            createNewProjectFile={jest.fn()}
            findIdForFileName={jest.fn()}
            supportedFileTypes={['png']}
            disableActions={false}
            setActionInProgress={jest.fn()}
            {...props}
          />
        </ThemeProvider>
      </Provider>
    );

  const clickDelete = async () => {
    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', {name: `${FILE_NAME} options`})
    );
    await user.click(
      screen.getByRole('button', {name: 'Delete from Backpack'})
    );
  };

  it('toasts only the outcome when a delete succeeds', async () => {
    renderChip();

    await clickDelete();

    await waitFor(() => expect(showToast).toHaveBeenCalledTimes(1));
    // The disabled row buttons already show a delete is running, so the only
    // toast is the result.
    expect(showToast).toHaveBeenCalledWith(
      `${FILE_NAME} deleted from your Backpack.`,
      expect.objectContaining({type: 'success', autoHideDuration: 4000})
    );
    // The panel's alert stack is gone; nothing should route back to it.
    expect(addAlert).not.toHaveBeenCalled();
  });

  it('toasts an error when a delete fails', async () => {
    (backpackApi.deleteFiles as jest.Mock).mockImplementation(
      (filenames, onError) => onError(new Error('delete boom'))
    );
    renderChip();

    await clickDelete();

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        `Couldn't delete ${FILE_NAME} from your Backpack. Please try again.`,
        expect.objectContaining({type: 'danger', autoHideDuration: 8000})
      )
    );
    expect(addAlert).not.toHaveBeenCalled();
  });

  it('falls back to the in-panel alert without showToast (legacy panel)', async () => {
    (backpackApi.deleteFiles as jest.Mock).mockImplementation(
      (filenames, onError) => onError(new Error('delete boom'))
    );
    renderChip({showToast: undefined});

    await clickDelete();

    await waitFor(() =>
      expect(addAlert).toHaveBeenCalledWith(
        'danger',
        `Failed to delete ${FILE_NAME} from your Backpack.`
      )
    );
    expect(showToast).not.toHaveBeenCalled();
  });

  it('shows the Added confirmation in place of the add button', () => {
    renderChip({isRecentlyAdded: true});

    expect(screen.getByText('Added')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Add to project'})
    ).not.toBeInTheDocument();
  });
});
