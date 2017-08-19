import {assert} from '../../util/configuredChai';
var testUtils = require('../../util/testUtils');
var CompletionButton = require('@cdo/apps/templates/CompletionButton').__TestInterface__.UnconnectedCompletionButton;
import React from 'react';
var ReactTestUtils = require('react-addons-test-utils');

describe('CompletionButton', function () {
  testUtils.setExternalGlobals();

  it('non-project level, can submit, havent', function () {
    var component = ReactTestUtils.renderIntoDocument(
      <CompletionButton
        isProjectLevel={false}
        isSubmittable={true}
        isSubmitted={false}
      />
    );
    var buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(component, 'button');
    assert.equal(buttons.length, 1);
    assert.equal(buttons[0].getAttribute('id'), 'submitButton');
    assert.equal(buttons[0].textContent, 'Submit');
  });

  it('non-project level, can submit, have', function () {
    var component = ReactTestUtils.renderIntoDocument(
      <CompletionButton
        isProjectLevel={false}
        isSubmittable={true}
        isSubmitted={true}
      />
    );
    var buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(component, 'button');
    assert.equal(buttons.length, 1);
    assert.equal(buttons[0].getAttribute('id'), 'unsubmitButton');
    assert.equal(buttons[0].textContent, 'Unsubmit');
  });

  it('non-project level, cant submit', function () {
    var component = ReactTestUtils.renderIntoDocument(
      <CompletionButton
        isProjectLevel={false}
        isSubmittable={false}
        isSubmitted={false}
      />
    );
    var buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(component, 'button');
    assert.equal(buttons.length, 1);
    assert.equal(buttons[0].getAttribute('id'), 'finishButton');
    assert.equal(buttons[0].textContent, 'Finish');
  });


  it('project level (cant submit)', function () {
    var component = ReactTestUtils.renderIntoDocument(
      <CompletionButton
        isProjectLevel={true}
        isSubmittable={false}
        isSubmitted={false}
      />
    );
    var buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(component, 'button');
    assert.equal(buttons.length, 0);
  });
});
