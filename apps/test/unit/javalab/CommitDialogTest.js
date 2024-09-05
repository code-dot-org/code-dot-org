import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import BackpackClientApi from '@cdo/apps/code-studio/components/backpack/BackpackClientApi';
import {UnconnectedCommitDialog as CommitDialog} from '@cdo/apps/javalab/CommitDialog';
import CommitDialogBody from '@cdo/apps/javalab/CommitDialogBody';
import CommitDialogFileRow from '@cdo/apps/javalab/CommitDialogFileRow';
import i18n from '@cdo/javalab/locale';

import {BackpackAPIContext} from '../../../src/javalab/BackpackAPIContext';
import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('CommitDialog test', () => {
  let defaultProps, handleCommitSpy, setCommitSaveStatusSpy, backpackApiStub;

  beforeEach(() => {
    handleCommitSpy = sinon.spy();

    backpackApiStub = sinon.createStubInstance(BackpackClientApi);
    backpackApiStub.getFileList.callsArgWith(1, ['backpackFile.java']);
    backpackApiStub.hasBackpack.returns(true);
    setCommitSaveStatusSpy = sinon.spy();

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
    ).to.be.true;
    wrapper.instance().updateNotes('commit notes');
    wrapper.update();
    expect(
      wrapper.find('#confirmationButton').find('FooterButton').props().disabled
    ).to.be.false;
  });

  it('shows warning when file already in backpack included in commit', () => {
    const wrapper = renderWithProps({files: ['backpackFile.java']});
    const file = wrapper.find(CommitDialogFileRow).first();

    expect(file.text()).to.not.contain(i18n.backpackFileNameConflictWarning());
    file.find('input[type="checkbox"]').first().simulate('change');
    expect(file.text()).to.contain(i18n.backpackFileNameConflictWarning());
  });

  it('does not show warning when file not already in backpack included in commit', () => {
    const wrapper = renderWithProps({files: ['fileNotInBackpack.java']});
    const file = wrapper.find(CommitDialogFileRow).first();

    file.find('input[type="checkbox"]').first().simulate('change');
    expect(file.text()).to.not.contain(i18n.backpackFileNameConflictWarning());
  });

  it('can commit and save', () => {
    const wrapper = renderWithProps({});
    wrapper.instance().updateNotes('commit notes');
    wrapper.update();
    wrapper.instance().commitAndSaveToBackpack();
    expect(handleCommitSpy).to.be.called.once;
    expect(backpackApiStub.saveFiles).to.be.called.once;
    expect(setCommitSaveStatusSpy).to.be.calledWith({
      isCommitSaveInProgress: true,
      hasCommitSaveError: false,
    });

    expect(wrapper.instance().state.backpackSaveInProgress).to.be.true;
  });

  it('dialog closes after save then commit succeeds', () => {
    const handleCloseSpy = sinon.spy();
    const wrapper = renderWithProps({
      handleClose: handleCloseSpy,
      isCommitSaveInProgress: true,
      hasCommitSaveError: false,
    });
    wrapper.instance().updateNotes('commit notes');
    wrapper.update();
    wrapper.instance().commitAndSaveToBackpack();
    expect(handleCommitSpy).to.be.called.once;
    expect(backpackApiStub.saveFiles).to.be.called.once;
    expect(setCommitSaveStatusSpy).to.be.calledWith({
      isCommitSaveInProgress: true,
      hasCommitSaveError: false,
    });

    expect(wrapper.instance().state.backpackSaveInProgress).to.be.true;
    expect(handleCloseSpy.callCount).to.equal(0);

    wrapper.instance().handleBackpackSaveSuccess();
    expect(handleCloseSpy.callCount).to.equal(0);

    // Close dialog once both backpack save and commit save have finished
    wrapper.instance().handleCommitSaveSuccess();
    expect(handleCloseSpy.callCount).to.equal(1);
  });

  it('dialog closes after commit then save succeeds', () => {
    const handleCloseSpy = sinon.spy();
    const wrapper = renderWithProps({handleClose: handleCloseSpy});
    wrapper.instance().updateNotes('commit notes');
    wrapper.update();
    wrapper.instance().commitAndSaveToBackpack();
    expect(handleCommitSpy).to.be.called.once;
    expect(backpackApiStub.saveFiles).to.be.called.once;
    expect(setCommitSaveStatusSpy).to.be.calledWith({
      isCommitSaveInProgress: true,
      hasCommitSaveError: false,
    });

    expect(wrapper.instance().state.backpackSaveInProgress).to.be.true;
    expect(handleCloseSpy.callCount).to.equal(0);

    wrapper.instance().handleCommitSaveSuccess();
    expect(handleCloseSpy.callCount).to.equal(0);

    wrapper.instance().handleBackpackSaveSuccess();
    expect(handleCloseSpy.callCount).to.equal(1);
  });

  it('hides the backpack sesion in the dialog body if backpack disabled', () => {
    const wrapper = renderWithProps({backpackEnabled: false});
    expect(
      wrapper.find(CommitDialogBody).first().props().showSaveToBackpackSection
    ).to.be.false;
  });
});
