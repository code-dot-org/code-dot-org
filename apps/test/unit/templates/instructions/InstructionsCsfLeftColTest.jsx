import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import HintDisplayLightbulb from '@cdo/apps/templates/HintDisplayLightbulb';
import {UnconnectedInstructionsCsfLeftCol as InstructionsCsfLeftCol} from '@cdo/apps/templates/instructions/InstructionsCsfLeftCol';
import PromptIcon from '@cdo/apps/templates/instructions/PromptIcon';

const DEFAULT_PROPS = {
  requestHint: () => {},
  setColWidth: () => {},
  setColHeight: () => {},
  hasUnseenHint: true,
  hasAuthoredHints: true,
  smallStaticAvatar: 'small-avatar',
  failureAvatar: 'failure-avatar',
  feedback: null,
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<InstructionsCsfLeftCol {...props} />);
};

describe('InstructionsCsfLeftCol', () => {
  it('sets col width and height on mount', () => {
    const setColWidthSpy = jest.fn();
    const setColHeightSpy = jest.fn();
    setUp({setColHeight: setColHeightSpy, setColWidth: setColWidthSpy});

    // should be called after mount:
    expect(setColWidthSpy).toHaveBeenCalledTimes(1);
    expect(setColHeightSpy).toHaveBeenCalledTimes(1);
  });

  it('calls requestHint on clicking .prompt-icon-cell when hasAuthoredHints and hasUnseenHint', () => {
    const requestHintSpy = jest.fn();
    const wrapper = setUp({
      hasAuthoredHints: true,
      hasUnseenHint: true,
      requestHint: requestHintSpy,
    });
    wrapper.find('.prompt-icon-cell').simulate('click');
    expect(requestHintSpy).toHaveBeenCalledTimes(1);
  });

  it('does not call requestHint on clicking .prompt-icon-cell when not hasAuthoredHints', () => {
    const requestHintSpy = jest.fn();
    const wrapper = setUp({
      hasAuthoredHints: false,
      hasUnseenHint: true,
      requestHint: requestHintSpy,
    });
    wrapper.find('.prompt-icon-cell').simulate('click');
    expect(requestHintSpy).not.toHaveBeenCalledTimes(1);
  });

  it('displays failureAvatar when there is failure feedback', () => {
    const failureAvatarSrc = 'failure-avatar-src';
    const wrapper = setUp({
      failureAvatar: failureAvatarSrc,
      feedback: {message: 'failure', isFailure: true},
    });
    expect(wrapper.find(PromptIcon).props().src).toBe(failureAvatarSrc);
  });

  it('displays smallStaticAvatar when feedback is not failure', () => {
    const smallAvatarSrc = 'small-avatar-src';
    const wrapper = setUp({
      smallStaticAvatar: smallAvatarSrc,
      feedback: {message: 'feedback', isFailure: false},
    });
    expect(wrapper.find(PromptIcon).props().src).toBe(smallAvatarSrc);
  });

  it('displays hint lightbulb when hasAuthoredHints', () => {
    const wrapper = setUp({
      hasAuthoredHints: true,
    });
    expect(wrapper.find(HintDisplayLightbulb)).toHaveLength(1);
  });
});
