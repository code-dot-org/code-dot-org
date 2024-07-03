import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import BackpackClientApi from '@cdo/apps/code-studio/components/backpack/BackpackClientApi';
import {UnconnectedCommitDialog as CommitDialog} from '@cdo/apps/javalab/CommitDialog';
import CommitDialogBody from '@cdo/apps/javalab/CommitDialogBody';
import CommitDialogFileRow from '@cdo/apps/javalab/CommitDialogFileRow';
import i18n from '@cdo/javalab/locale';

import {BackpackAPIContext} from '../../../src/javalab/BackpackAPIContext';


describe('CommitDialog test', () => {
  let defaultProps, handleCommitSpy, setCommitSaveStatusSpy, backpackApiStub;

  beforeEach(() => {
    handleCommitSpy = jest.fn();

    backpackApiStub = sinon.createStubInstance(BackpackClientApi);
    backpackApiStub.getFileList.mockImplementation((...args) => args[1](['backpackFile.java']));
    backpackApiStub.hasBackpack.mockReturnValue(true);
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
    return mount(
      <BackpackAPIContext.Provider value={backpackApiStub}>
        <CommitDialog {...{...defaultProps, ...props}} />
      </BackpackAPIContext.Provider>
    );
  };

  it('cannot commit with message', () => {
    const wrapper = renderWithProps({});
    expect(
      wrapper.find('#confirmationButton').find('FooterButton').props().disabled
    ).toBe(true);
    wrapper.instance().updateNotes('commit notes');
    wrapper.update();
    expect(
      wrapper.find('#confirmationButton').find('FooterButton').props().disabled
    ).toBe(false);
  });

  it('shows warning when file already in backpack included in commit', () => {
    const wrapper = renderWithProps({files: ['backpackFile.java']});
    const file = wrapper.find(CommitDialogFileRow).first();

    expect(file.text()).not.toContain(i18n.backpackFileNameConflictWarning());
    file.find('input[type="checkbox"]').first().simulate('change');
    expect(file.text()).toContain(i18n.backpackFileNameConflictWarning());
  });

  it('does not show warning when file not already in backpack included in commit', () => {
    const wrapper = renderWithProps({files: ['fileNotInBackpack.java']});
    const file = wrapper.find(CommitDialogFileRow).first();

    file.find('input[type="checkbox"]').first().simulate('change');
    expect(file.text()).not.toContain(i18n.backpackFileNameConflictWarning());
  });

  it('can commit and save', () => {
    const wrapper = renderWithProps({});
    wrapper.instance().updateNotes('commit notes');
    wrapper.update();
    wrapper.instance().commitAndSaveToBackpack();
    expect(handleCommitSpy).toHaveBeenCalled().once;
    expect(backpackApiStub.saveFiles).toHaveBeenCalled().once;
    expect(setCommitSaveStatusSpy).toHaveBeenCalledWith({
      isCommitSaveInProgress: true,
      hasCommitSaveError: false,
    });

    expect(wrapper.instance().state.backpackSaveInProgress).toBe(true);
  });

  it('dialog closes after save then commit succeeds', () => {
    const handleCloseSpy = jest.fn();
    const wrapper = renderWithProps({
      handleClose: handleCloseSpy,
      isCommitSaveInProgress: true,
      hasCommitSaveError: false,
    });
    wrapper.instance().updateNotes('commit notes');
    wrapper.update();
    wrapper.instance().commitAndSaveToBackpack();
    expect(handleCommitSpy).toHaveBeenCalled().once;
    expect(backpackApiStub.saveFiles).toHaveBeenCalled().once;
    expect(setCommitSaveStatusSpy).toHaveBeenCalledWith({
      isCommitSaveInProgress: true,
      hasCommitSaveError: false,
    });

    expect(wrapper.instance().state.backpackSaveInProgress).toBe(true);
    expect(handleCloseSpy).toHaveBeenCalledTimes(0);

    wrapper.instance().handleBackpackSaveSuccess();
    expect(handleCloseSpy).toHaveBeenCalledTimes(0);

    // Close dialog once both backpack save and commit save have finished
    wrapper.instance().handleCommitSaveSuccess();
    expect(handleCloseSpy).toHaveBeenCalledTimes(1);
  });

  it('dialog closes after commit then save succeeds', () => {
    const handleCloseSpy = jest.fn();
    const wrapper = renderWithProps({handleClose: handleCloseSpy});
    wrapper.instance().updateNotes('commit notes');
    wrapper.update();
    wrapper.instance().commitAndSaveToBackpack();
    expect(handleCommitSpy).toHaveBeenCalled().once;
    expect(backpackApiStub.saveFiles).toHaveBeenCalled().once;
    expect(setCommitSaveStatusSpy).toHaveBeenCalledWith({
      isCommitSaveInProgress: true,
      hasCommitSaveError: false,
    });

    expect(wrapper.instance().state.backpackSaveInProgress).toBe(true);
    expect(handleCloseSpy).toHaveBeenCalledTimes(0);

    wrapper.instance().handleCommitSaveSuccess();
    expect(handleCloseSpy).toHaveBeenCalledTimes(0);

    wrapper.instance().handleBackpackSaveSuccess();
    expect(handleCloseSpy).toHaveBeenCalledTimes(1);
  });

  it('hides the backpack sesion in the dialog body if backpack disabled', () => {
    const wrapper = renderWithProps({backpackEnabled: false});
    expect(
      wrapper.find(CommitDialogBody).first().props().showSaveToBackpackSection
    ).toBe(false);
  });
});
