import {assert} from 'chai'; // eslint-disable-line no-restricted-imports
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import authoredHints from '@cdo/apps/redux/authoredHints';
import instructions, {
  setFeedback,
  setInstructionsConstants,
} from '@cdo/apps/redux/instructions';
import pageConstants, {setPageConstants} from '@cdo/apps/redux/pageConstants';
import InstructionsCSF from '@cdo/apps/templates/instructions/InstructionsCSF';

describe('InstructionsCSF', () => {
  beforeEach(() => {
    stubRedux();
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
