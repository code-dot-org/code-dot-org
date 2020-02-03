import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/deprecatedChai';
import {UnwrappedInstructionsDialogWrapper as InstructionsDialogWrapper} from '@cdo/apps/templates/instructions/InstructionsDialogWrapper';

describe('InstructionsDialogWrapper', () => {
  let spy, wrapper;

  beforeEach(() => {
    spy = sinon.spy();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('renders nothing', () => {
    wrapper = mount(
      <InstructionsDialogWrapper isOpen={true} showInstructionsDialog={spy} />
    );
    expect(wrapper).to.be.empty;
  });

  it('does not call showInstructionsDialog on first render', () => {
    wrapper = mount(
      <InstructionsDialogWrapper isOpen={true} showInstructionsDialog={spy} />
    );
    expect(spy).not.to.have.been.called;
  });

  it('calls showInstructionsDialog every time props change to open', () => {
    wrapper = mount(
      <InstructionsDialogWrapper isOpen={false} showInstructionsDialog={spy} />
    );
    expect(spy).not.to.have.been.called;
    wrapper.setProps({isOpen: true});
    expect(spy).to.have.been.calledOnce;
    wrapper.setProps({isOpen: true});
    expect(spy).to.have.been.calledOnce;
    wrapper.setProps({isOpen: false});
    expect(spy).to.have.been.calledOnce;
    wrapper.setProps({isOpen: false});
    expect(spy).to.have.been.calledOnce;
    wrapper.setProps({isOpen: true});
    expect(spy).to.have.been.calledTwice;
  });

  it('passes optional autoClose prop to showInstructionsDialog', () => {
    wrapper = mount(
      <InstructionsDialogWrapper isOpen={false} showInstructionsDialog={spy} />
    );
    expect(spy).not.to.have.been.called;
    wrapper.setProps({isOpen: true, autoClose: true});
    expect(spy).to.have.been.calledOnce.and.calledWith(true);
    wrapper.setProps({isOpen: false});
    expect(spy).to.have.been.calledOnce;
    wrapper.setProps({isOpen: true, autoClose: false});
    expect(spy).to.have.been.calledTwice.and.calledWith(false);
  });
});
