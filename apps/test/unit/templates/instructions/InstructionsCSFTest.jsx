import React from 'react';
import {mount} from 'enzyme';
import {assert} from 'chai';
import InstructionsCSF from '@cdo/apps/templates/instructions/InstructionsCSF';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import instructions, {
  setFeedback,
  setInstructionsConstants
} from '@cdo/apps/redux/instructions';
import authoredHints from '@cdo/apps/redux/authoredHints';
import pageConstants, {setPageConstants} from '@cdo/apps/redux/pageConstants';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

describe.skip('InstructionsCSF', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers({authoredHints, instructions, isRtl, pageConstants});
    getStore().dispatch(
      setPageConstants({
        showNextHint: function() {},
        skinId: 'dance'
      })
    );
    getStore().dispatch(
      setInstructionsConstants({
        longInstructions: 'Use this new block.'
      })
    );
  });

  afterEach(() => {
    restoreRedux();
  });

  it('can change feedback when rendering different blockly blocks', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <InstructionsCSF {...DEFAULT_PROPS} />
      </Provider>,
      {attachTo: document.getElementById('container')} // needed for getScrollTarget
    );

    failWithMessage('Repeat block: <xml><block type="controls_repeat"/></xml>');
    assertFeedbackContainsText(wrapper, '>repeat</text>');

    failWithMessage('If block: <xml><block type="controls_if"/></xml>');
    assertFeedbackContainsText(wrapper, '>if</text>');
  });

  function failWithMessage(message) {
    getStore().dispatch(setFeedback({message, isFailure: true}));
  }

  function assertFeedbackContainsText(wrapper, text) {
    assert.include(
      wrapper
        .getDOMNode()
        .querySelector('.uitest-topInstructions-inline-feedback').innerHTML,
      text
    );
  }
});

const DEFAULT_PROPS = {
  adjustMaxNeededHeight: function() {},
  handleClickCollapser: function() {}
};
