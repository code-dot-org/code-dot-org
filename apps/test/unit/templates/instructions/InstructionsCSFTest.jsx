import React from 'react';
import {mount} from 'enzyme';
import {assert} from 'chai';
import InstructionsCSF from '@cdo/apps/templates/instructions/InstructionsCSF';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  __testing_stubRedux,
  __testing_restoreRedux,
} from '@cdo/apps/redux';
import instructions, {
  setFeedback,
  setInstructionsConstants,
} from '@cdo/apps/redux/instructions';
import authoredHints from '@cdo/apps/redux/authoredHints';
import pageConstants, {setPageConstants} from '@cdo/apps/redux/pageConstants';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

describe('InstructionsCSF', () => {
  beforeEach(() => {
    __testing_stubRedux();
    registerReducers({authoredHints, instructions, isRtl, pageConstants});
    getStore().dispatch(
      setPageConstants({
        showNextHint: function () {},
        skinId: 'dance',
      })
    );
    getStore().dispatch(
      setInstructionsConstants({
        longInstructions: 'Use this new block.',
      })
    );
  });

  afterEach(() => {
    __testing_restoreRedux();
  });

  it('can change feedback when rendering different blockly blocks', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <InstructionsCSF {...DEFAULT_PROPS} />
      </Provider>,
      {attachTo: document.getElementById('container')} // needed for getScrollTarget
    );

    failWithMessage('Repeat block: <xml><block type="controls_repeat"/></xml>');
    wrapper.update();
    assertFeedbackContainsText(wrapper, '>repeat</text>');

    failWithMessage('If block: <xml><block type="controls_if"/></xml>');
    wrapper.update();
    assertFeedbackContainsText(wrapper, '>if</text>');
  });

  function failWithMessage(message) {
    getStore().dispatch(setFeedback({message, isFailure: true}));
  }

  function assertFeedbackContainsText(wrapper, text) {
    const html = wrapper
      .find('.uitest-topInstructions-inline-feedback')
      .first()
      .html();
    assert.include(html, text);
  }
});

const DEFAULT_PROPS = {
  adjustMaxNeededHeight: function () {},
  handleClickCollapser: function () {},
};
