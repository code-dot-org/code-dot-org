import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import {UnconnectedInstructionsCsfRightCol as InstructionsCsfRightCol} from '@cdo/apps/templates/instructions/InstructionsCsfRightCol';
import CollapserButton from '@cdo/apps/templates/instructions/CollapserButton';
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
  isRtl: false
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<InstructionsCsfRightCol {...props} />);
};

describe('InstructionsCsfRightCol', () => {
  it('sets col width and height on mount', () => {
    const setColWidthSpy = sinon.spy();
    const setColHeightSpy = sinon.spy();
    setUp({setColHeight: setColHeightSpy, setColWidth: setColWidthSpy});

    // should be called after mount:
    expect(setColWidthSpy.calledOnce).to.be.true;
    expect(setColHeightSpy.calledOnce).to.be.true;
  });

  it('displays collapser button if there is feedback', () => {
    const wrapper = setUp({feedback: {message: 'feedback', isFailure: false}});
    expect(wrapper.find(CollapserButton)).to.have.length(1);
  });

  it('displays collapser button if there are hints', () => {
    const hint = {
      hintId: 'hint-id',
      markdown: 'hint markdown'
    };
    const wrapper = setUp({hints: [hint]});
    expect(wrapper.find(CollapserButton)).to.have.length(1);
  });

  it('displays collapser button if there are long and short instructions', () => {
    const wrapper = setUp({
      hasShortAndLongInstructions: true
    });
    expect(wrapper.find(CollapserButton)).to.have.length(1);
  });

  it('displays scroll buttons if displayScrollButtons prop is true', () => {
    const wrapper = setUp({
      displayScrollButtons: true
    });
    expect(wrapper.find(ScrollButtons)).to.have.length(1);
  });

  it('hides scroll buttons if displayScrollButtons prop is false', () => {
    const wrapper = setUp({
      displayScrollButtons: false
    });
    expect(wrapper.find(ScrollButtons)).to.have.length(0);
  });

  it('calls handleClickCollapser when CollapserButton is clicked', () => {
    // set up with short and long instructions so collapser is displayed
    const handleClickCollapserSpy = sinon.spy();
    const wrapper = setUp({
      hasShortAndLongInstructions: true,
      handleClickCollapser: handleClickCollapserSpy
    });
    wrapper.find(CollapserButton).simulate('click');
    expect(handleClickCollapserSpy.calledOnce).to.be.true;
  });
});
