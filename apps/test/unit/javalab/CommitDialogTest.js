import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {UnconnectedCommitDialog as CommitDialog} from '@cdo/apps/javalab/CommitDialog';
import {BackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import i18n from '@cdo/javalab/locale';

describe('CommitDialog test', () => {
  let defaultProps, handleCommitSpy, setCommitSaveStatusSpy, backpackApiStub;

  beforeEach(() => {
    handleCommitSpy = jest.fn();

    backpackApiStub = {
      getFileList: jest.fn((_, cb) => cb(['backpackFile.java'])),
      hasBackpack: jest.fn(() => true),
      saveFiles: jest.fn(),
    };

    setCommitSaveStatusSpy = jest.fn();

    defaultProps = {
      isOpen: true,
      files: [],
      handleClose: () => {},
      handleCommit: handleCommitSpy,
      sources: {},
      backpackEnabled: true,
      isCommitSaveInProgress: false,
      hasCommitSaveError: false,
      setCommitSaveStatus: setCommitSaveStatusSpy,
    };
  });

  const renderWithProps = props => {
    return render(
      <BackpackAPIContext.Provider value={backpackApiStub}>
        <CommitDialog {...{...defaultProps, ...props}} />
      </BackpackAPIContext.Provider>
    );
  };

  it('cannot commit with message', async () => {
    renderWithProps({});
    const user = userEvent.setup();

    const commitButton = screen.getByRole('button', {name: i18n.commit()});
    expect(commitButton).toBeDisabled();

    const notesInput = screen.getByRole('textbox');
    await user.type(notesInput, 'commit notes');

    expect(commitButton).toBeEnabled();
  });

  it('shows warning when file already in backpack included in commit', async () => {
    renderWithProps({files: ['backpackFile.java']});
    const user = userEvent.setup();

    expect(
      screen.queryByText(i18n.backpackFileNameConflictWarning())
    ).not.toBeInTheDocument();

    const checkbox = screen.getAllByRole('checkbox')[0];
    await user.click(checkbox);

    expect(
      screen.getByText(i18n.backpackFileNameConflictWarning())
    ).toBeInTheDocument();
  });

  it('does not show warning when file not already in backpack included in commit', async () => {
    renderWithProps({files: ['fileNotInBackpack.java']});
    const user = userEvent.setup();

    const checkbox = screen.getAllByRole('checkbox')[0];
    await user.click(checkbox);

    expect(
      screen.queryByText(i18n.backpackFileNameConflictWarning())
    ).not.toBeInTheDocument();
  });

  it('hides the backpack section in the dialog body if backpack disabled', () => {
    renderWithProps({backpackEnabled: false});
    expect(screen.queryByText(i18n.saveToBackpack())).not.toBeInTheDocument();
  });

  it('commits and saves to backpack when a file is selected', async () => {
    renderWithProps({files: ['MyClass.java'], sources: {}});

    const user = userEvent.setup();
    const notesInput = screen.getByRole('textbox');
    await user.type(notesInput, 'commit notes');

    const checkbox = screen.getAllByRole('checkbox')[0];
    await user.click(checkbox);

    const commitAndSaveButton = screen.getByRole('button', {
      name: i18n.commitAndSave(),
    });
    await user.click(commitAndSaveButton);

    expect(handleCommitSpy).toHaveBeenCalledWith(
      'commit notes',
      expect.any(Function)
    );
    expect(backpackApiStub.saveFiles).toHaveBeenCalledWith(
      {},
      ['MyClass.java'],
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('does not save to backpack when backpack is disabled', async () => {
    renderWithProps({backpackEnabled: false, files: ['MyClass.java']});

    const user = userEvent.setup();
    const notesInput = screen.getByRole('textbox');
    await user.type(notesInput, 'commit notes');

    const commitButton = screen.getByRole('button', {name: i18n.commit()});
    await user.click(commitButton);

    expect(handleCommitSpy).toHaveBeenCalledWith(
      'commit notes',
      expect.any(Function)
    );
    expect(backpackApiStub.saveFiles).not.toHaveBeenCalled();
  });
});
