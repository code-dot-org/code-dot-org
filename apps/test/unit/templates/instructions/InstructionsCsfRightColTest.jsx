import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import CollapserButton from '@cdo/apps/templates/instructions/CollapserButton';
import {UnconnectedInstructionsCsfRightCol as InstructionsCsfRightCol} from '@cdo/apps/templates/instructions/InstructionsCsfRightCol';
import ScrollButtons from '@cdo/apps/templates/instructions/ScrollButtons';

const DEFAULT_PROPS = {
  shouldDisplayHintPrompt: () => {},
  hasShortAndLongInstructions: false,
  promptForHint: false,
  displayScrollButtons: false,
  getScrollTarget: () => {},
  handleClickCollapser: () => {},
  setColWidth: () => {},
  setColHeight: () => {},
  collapsed: false,
  hints: [],
  feedback: undefined,
  height: 225,
  isMinecraft: false,
  isRtl: false,
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<InstructionsCsfRightCol {...props} />);
};

describe('InstructionsCsfRightCol', () => {
  it('sets col width and height on mount', () => {
    const setColWidthSpy = jest.fn();
    const setColHeightSpy = jest.fn();
    setUp({setColHeight: setColHeightSpy, setColWidth: setColWidthSpy});

    // should be called after mount:
    expect(setColWidthSpy).toHaveBeenCalledTimes(1);
    expect(setColHeightSpy).toHaveBeenCalledTimes(1);
  });

  it('only recalculates col width and height if height or collapsed props change', () => {
    const setColWidthSpy = jest.fn();
    const setColHeightSpy = jest.fn();
    const wrapper = setUp({
      setColHeight: setColHeightSpy,
      setColWidth: setColWidthSpy,
      height: 50,
      collapsed: false,
      isRtl: false,
    });

    // Should be called after mount
    expect(setColWidthSpy).toHaveBeenCalledTimes(1);
    expect(setColHeightSpy).toHaveBeenCalledTimes(1);

    // Should not be called when unrelated prop changes
    wrapper.setProps({isRtl: true});
    expect(setColWidthSpy).toHaveBeenCalledTimes(1);
    expect(setColHeightSpy).toHaveBeenCalledTimes(1);

    // Should be called when height changes
    wrapper.setProps({height: 100});
    expect(setColWidthSpy).toHaveBeenCalledTimes(2);
    expect(setColHeightSpy).toHaveBeenCalledTimes(2);

    // Should be called when collapsed changes
    wrapper.setProps({collapsed: true});
    expect(setColWidthSpy).toHaveBeenCalledTimes(3);
    expect(setColHeightSpy).toHaveBeenCalledTimes(3);
  });

  it('displays collapser button if there is feedback', () => {
    const wrapper = setUp({feedback: {message: 'feedback', isFailure: false}});
    expect(wrapper.find(CollapserButton)).toHaveLength(1);
  });

  it('displays collapser button if there are hints', () => {
    const hint = {
      hintId: 'hint-id',
      markdown: 'hint markdown',
    };
    const wrapper = setUp({hints: [hint]});
    expect(wrapper.find(CollapserButton)).toHaveLength(1);
  });

  it('displays collapser button if there are long and short instructions', () => {
    const wrapper = setUp({
      hasShortAndLongInstructions: true,
    });
    expect(wrapper.find(CollapserButton)).toHaveLength(1);
  });

  it('displays scroll buttons if displayScrollButtons prop is true', () => {
    const wrapper = setUp({
      displayScrollButtons: true,
    });
    expect(wrapper.find(ScrollButtons)).toHaveLength(1);
  });

  it('hides scroll buttons if displayScrollButtons prop is false', () => {
    const wrapper = setUp({
      displayScrollButtons: false,
    });
    expect(wrapper.find(ScrollButtons)).toHaveLength(0);
  });

  it('calls handleClickCollapser when CollapserButton is clicked', () => {
    // set up with short and long instructions so collapser is displayed
    const handleClickCollapserSpy = jest.fn();
    const wrapper = setUp({
      hasShortAndLongInstructions: true,
      handleClickCollapser: handleClickCollapserSpy,
    });
    wrapper.find(CollapserButton).simulate('click');
    expect(handleClickCollapserSpy).toHaveBeenCalledTimes(1);
  });
});
