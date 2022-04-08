import React from 'react';
import {expect} from '../../util/reconfiguredChai';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import i18n from '@cdo/javalab/locale';
import BackpackClientApi from '@cdo/apps/code-studio/components/backpack/BackpackClientApi';
import {UnconnectedCommitDialog as CommitDialog} from '@cdo/apps/javalab/CommitDialog';
import CommitDialogFileRow from '@cdo/apps/javalab/CommitDialogFileRow';

describe('CommitDialog test', () => {
  let defaultProps,
    handleCommitSpy,
    backpackSaveFilesSpy,
    backpackGetFileListStub,
    hasBackpackStub;

  beforeEach(() => {
    handleCommitSpy = sinon.spy();
    backpackSaveFilesSpy = sinon.spy();
    backpackGetFileListStub = sinon
      .stub(BackpackClientApi.prototype, 'getFileList')
      .callsArgWith(1, ['backpackFile.java']);
    hasBackpackStub = sinon.stub().returns(true);

    defaultProps = {
      isOpen: true,
      files: [],
      handleClose: () => {},
      handleCommit: handleCommitSpy,
      sources: {},
      backpackApi: {
        saveFiles: backpackSaveFilesSpy,
        getFileList: backpackGetFileListStub,
        hasBackpack: hasBackpackStub
      }
    };
  });

  afterEach(() => {
    BackpackClientApi.prototype.getFileList.restore();
  });

  it('cannot commit with message', () => {
    const wrapper = mount(<CommitDialog {...defaultProps} />);
    expect(
      wrapper
        .find('#confirmationButton')
        .find('FooterButton')
        .props().disabled
    ).to.be.true;
    wrapper.instance().updateNotes('commit notes');
    wrapper.update();
    expect(
      wrapper
        .find('#confirmationButton')
        .find('FooterButton')
        .props().disabled
    ).to.be.false;
  });

  it('shows warning when file already in backpack included in commit', () => {
    const wrapper = mount(
      <CommitDialog {...defaultProps} files={['backpackFile.java']} />
    );
    const file = wrapper.find(CommitDialogFileRow).first();

    expect(file.text()).to.not.contain(i18n.backpackFileNameConflictWarning());
    file
      .find('input[type="checkbox"]')
      .first()
      .simulate('change');
    expect(file.text()).to.contain(i18n.backpackFileNameConflictWarning());
  });

  it('does not show warning when file not already in backpack included in commit', () => {
    const wrapper = mount(
      <CommitDialog {...defaultProps} files={['fileNotInBackpack.java']} />
    );
    const file = wrapper.find(CommitDialogFileRow).first();

    file
      .find('input[type="checkbox"]')
      .first()
      .simulate('change');
    expect(file.text()).to.not.contain(i18n.backpackFileNameConflictWarning());
  });

  it('can commit and save', () => {
    const wrapper = shallow(<CommitDialog {...defaultProps} />);
    wrapper.instance().updateNotes('commit notes');
    wrapper.update();
    wrapper.instance().commitAndSaveToBackpack();
    expect(handleCommitSpy).to.be.called.once;
    expect(backpackSaveFilesSpy).to.be.called.once;

    expect(wrapper.instance().state.backpackSaveInProgress).to.be.true;
    expect(wrapper.instance().state.commitSaveInProgress).to.be.true;
  });

  it('dialog closes after save then commit succeeds', () => {
    const handleCloseSpy = sinon.spy();
    const wrapper = shallow(
      <CommitDialog {...defaultProps} handleClose={handleCloseSpy} />
    );
    wrapper.instance().updateNotes('commit notes');
    wrapper.update();
    wrapper.instance().commitAndSaveToBackpack();
    expect(handleCommitSpy).to.be.called.once;
    expect(backpackSaveFilesSpy).to.be.called.once;

    expect(wrapper.instance().state.backpackSaveInProgress).to.be.true;
    expect(wrapper.instance().state.commitSaveInProgress).to.be.true;
    expect(handleCloseSpy.callCount).to.equal(0);

    wrapper.instance().handleBackpackSaveSuccess();
    expect(handleCloseSpy.callCount).to.equal(0);

    wrapper.instance().handleCommitSaveSuccess();
    expect(handleCloseSpy.callCount).to.equal(1);
  });

  it('dialog closes after commit then save succeeds', () => {
    const handleCloseSpy = sinon.spy();
    const wrapper = shallow(
      <CommitDialog {...defaultProps} handleClose={handleCloseSpy} />
    );
    wrapper.instance().updateNotes('commit notes');
    wrapper.update();
    wrapper.instance().commitAndSaveToBackpack();
    expect(handleCommitSpy).to.be.called.once;
    expect(backpackSaveFilesSpy).to.be.called.once;

    expect(wrapper.instance().state.backpackSaveInProgress).to.be.true;
    expect(wrapper.instance().state.commitSaveInProgress).to.be.true;
    expect(handleCloseSpy.callCount).to.equal(0);

    wrapper.instance().handleCommitSaveSuccess();
    expect(handleCloseSpy.callCount).to.equal(0);

    wrapper.instance().handleBackpackSaveSuccess();
    expect(handleCloseSpy.callCount).to.equal(1);
  });
});
