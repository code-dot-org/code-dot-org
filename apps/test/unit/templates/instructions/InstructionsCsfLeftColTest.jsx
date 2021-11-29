import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import {UnconnectedInstructionsCsfLeftCol as InstructionsCsfLeftCol} from '@cdo/apps/templates/instructions/InstructionsCsfLeftCol';
import PromptIcon from '@cdo/apps/templates/instructions/PromptIcon';
import HintDisplayLightbulb from '@cdo/apps/templates/HintDisplayLightbulb';

const DEFAULT_PROPS = {
  requestHint: () => {},
  setColWidth: () => {},
  setColHeight: () => {},
  hasUnseenHint: true,
  hasAuthoredHints: true,
  smallStaticAvatar: 'small-avatar',
  failureAvatar: 'failure-avatar',
  feedback: null
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<InstructionsCsfLeftCol {...props} />);
};

describe('InstructionsCsfLeftCol', () => {
  it('sets col width and height on mount', () => {
    const setColWidthSpy = sinon.spy();
    const setColHeightSpy = sinon.spy();
    setUp({setColHeight: setColHeightSpy, setColWidth: setColWidthSpy});

    // should be called after mount:
    expect(setColWidthSpy.calledOnce).to.be.true;
    expect(setColHeightSpy.calledOnce).to.be.true;
  });

  it('calls requestHint on clicking .prompt-icon-cell when hasAuthoredHints and hasUnseenHint', () => {
    const requestHintSpy = sinon.spy();
    const wrapper = setUp({
      hasAuthoredHints: true,
      hasUnseenHint: true,
      requestHint: requestHintSpy
    });
    wrapper.find('.prompt-icon-cell').simulate('click');
    expect(requestHintSpy.calledOnce).to.be.true;
  });

  it('does not call requestHint on clicking .prompt-icon-cell when not hasAuthoredHints', () => {
    const requestHintSpy = sinon.spy();
    const wrapper = setUp({
      hasAuthoredHints: false,
      hasUnseenHint: true,
      requestHint: requestHintSpy
    });
    wrapper.find('.prompt-icon-cell').simulate('click');
    expect(requestHintSpy.calledOnce).to.be.false;
  });

  it('displays failureAvatar when there is failure feedback', () => {
    const failureAvatarSrc = 'failure-avatar-src';
    const wrapper = setUp({
      failureAvatar: failureAvatarSrc,
      feedback: {message: 'failure', isFailure: true}
    });
    expect(wrapper.find(PromptIcon).props().src).to.equal(failureAvatarSrc);
  });

  it('displays smallStaticAvatar when feedback is not failure', () => {
    const smallAvatarSrc = 'small-avatar-src';
    const wrapper = setUp({
      smallStaticAvatar: smallAvatarSrc,
      feedback: {message: 'feedback', isFailure: false}
    });
    expect(wrapper.find(PromptIcon).props().src).to.equal(smallAvatarSrc);
  });

  it('displays hint lightbulb when hasAuthoredHints', () => {
    const wrapper = setUp({
      hasAuthoredHints: true
    });
    expect(wrapper.find(HintDisplayLightbulb)).to.have.length(1);
  });
});
