import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import {UnconnectedInstructionsCsfMiddleCol as InstructionsCsfMiddleCol} from '@cdo/apps/templates/instructions/InstructionsCsfMiddleCol';
import Instructions from '@cdo/apps/templates/instructions/Instructions';
import LegacyButton from '@cdo/apps/templates/LegacyButton';
import InlineHint from '@cdo/apps/templates/instructions/InlineHint';
import InlineFeedback from '@cdo/apps/templates/instructions/InlineFeedback';
import HintPrompt from '@cdo/apps/templates/instructions/HintPrompt';

const DEFAULT_PROPS = {
  dismissHintPrompt: () => {},
  shouldDisplayHintPrompt: () => {},
  hasShortAndLongInstructions: true,
  adjustMaxNeededHeight: () => {},
  promptForHint: false,
  setColHeight: () => {},
  getMinInstructionsHeight: () => {},
  overlayVisible: false,
  skinId: 'skin-id',
  isMinecraft: false,
  isBlockly: true,
  aniGifURL: undefined,
  inputOutputTable: undefined,
  isRtl: false,
  feedback: undefined,
  collapsed: false,
  hints: [],
  showNextHint: () => {},
  ttsShortInstructionsUrl: 'tts short instructions',
  ttsLongInstructionsUrl: 'tts long instructions',
  textToSpeechEnabled: true,
  shortInstructions: 'short instructions',
  shortInstructions2: undefined,
  longInstructions: 'long instructions',
  clearFeedback: () => {},
  hideOverlay: () => {},
  setInstructionsRenderedHeight: () => {}
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<InstructionsCsfMiddleCol {...props} />);
};

describe('InstructionsCsfMiddleCol', () => {
  it('passes short instructions to Instructions component if in a collapsed state with both short and long instructions', () => {
    const shortInstructions = 'test short instructions';
    const wrapper = setUp({
      hasShortAndLongInstructions: true,
      collapsed: true,
      shortInstructions
    });
    expect(wrapper.find(Instructions).props().longInstructions).to.equal(
      shortInstructions
    );
  });

  it('passes short instructions to Instructions component if not in a collapsed state with no long instructions', () => {
    const shortInstructions = 'test short instructions';
    const longInstructions = undefined;
    const wrapper = setUp({
      hasShortAndLongInstructions: false,
      collapsed: false,
      shortInstructions,
      longInstructions
    });
    expect(wrapper.find(Instructions).props().longInstructions).to.equal(
      shortInstructions
    );
  });

  it('passes long instructions to Instructions component if not in a collapsed state with both short and long instructions', () => {
    const longInstructions = 'test long instructions';
    const wrapper = setUp({
      hasShortAndLongInstructions: true,
      collapsed: false,
      longInstructions
    });
    expect(wrapper.find(Instructions).props().longInstructions).to.equal(
      longInstructions
    );
  });

  it('passes inputOutputTable to Instructions when not collapsed', () => {
    const inputOutputTable = [[1, 2, 3, 4]];
    const wrapper = setUp({collapsed: false, inputOutputTable});
    expect(wrapper.find(Instructions).props().inputOutputTable).to.equal(
      inputOutputTable
    );
  });

  it('passes undefined for inputOutputTable to Instructions when collapsed', () => {
    const inputOutputTable = [[1, 2, 3, 4]];
    const wrapper = setUp({collapsed: true, inputOutputTable});
    expect(wrapper.find(Instructions).props().inputOutputTable).to.equal(
      undefined
    );
  });

  it('display secondary instructions when shortInstructions2 exists', () => {
    const wrapper = setUp({shortInstructions2: 'short instructions 2'});
    expect(wrapper.find('.secondary-instructions')).to.have.length(1);
  });

  it('display LegacyButton when overlayVisible', () => {
    const wrapper = setUp({overlayVisible: true});
    expect(wrapper.find(LegacyButton)).to.have.length(1);
  });

  it('calls hideOverlay when overlayVisible and LegacyButton is clicked', () => {
    const hideOverlaySpy = sinon.spy();
    const wrapper = setUp({overlayVisible: true, hideOverlay: hideOverlaySpy});
    wrapper.find(LegacyButton).simulate('click');
    expect(hideOverlaySpy.calledOnce).to.be.true;
  });

  it('display InlineHint when hints and not collapsed', () => {
    const hint = {
      hintId: 'hint-id',
      markdown: 'hint markdown'
    };
    const wrapper = setUp({hints: [hint], collapsed: false});
    expect(wrapper.find(InlineHint)).to.have.length(1);
  });

  it('hide InlineHints when hints exist and collapsed', () => {
    const hint = {
      hintId: 'hint-id',
      markdown: 'hint markdown'
    };
    const wrapper = setUp({hints: [hint], collapsed: true});
    expect(wrapper.find(InlineHint)).to.have.length(0);
  });

  it('displays InlineFeedback when feedback and not collapsed', () => {
    const feedback = {
      message: 'some feedback',
      isFailure: false
    };
    const wrapper = setUp({feedback, collapsed: false});
    expect(wrapper.find(InlineFeedback)).to.have.length(1);
  });

  it('hides InlineFeedback when feedback exists and collapsed', () => {
    const feedback = {
      message: 'some feedback',
      isFailure: false
    };
    const wrapper = setUp({feedback, collapsed: true});
    expect(wrapper.find(InlineFeedback)).to.have.length(0);
  });

  it('displays HintPrompt when shouldDisplayHintPrompt returns true', () => {
    const wrapper = setUp({shouldDisplayHintPrompt: () => true});
    expect(wrapper.find(HintPrompt)).to.have.length(1);
  });
});
