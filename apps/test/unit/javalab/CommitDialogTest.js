import React from 'react';
import {expect} from '../../util/reconfiguredChai';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import {UnconnectedCommitDialog as CommitDialog} from '@cdo/apps/javalab/CommitDialog';

describe('CommitDialog test', () => {
  let defaultProps, handleCommitSpy, backpackSaveFilesSpy;

  beforeEach(() => {
    handleCommitSpy = sinon.spy();
    backpackSaveFilesSpy = sinon.spy();
    defaultProps = {
      isOpen: true,
      files: [],
      handleClose: () => {},
      handleCommit: handleCommitSpy,
      sources: {},
      backpackApi: {saveFiles: backpackSaveFilesSpy}
    };
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
