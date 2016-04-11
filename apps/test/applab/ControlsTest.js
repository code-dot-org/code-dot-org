'use strict';

var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
testUtils.setupLocales();
testUtils.setExternalGlobals();
var Controls = require('@cdo/apps/applab/Controls');
var ReactTestUtils = require('react-addons-test-utils');

describe('Controls', function () {
  it('non-project level, can submit, havent', function () {
    var component = ReactTestUtils.renderIntoDocument(
      <Controls
        imgUrl="foo"
        projectLevel={false}
        submittable={true}
        submitted={false}
      />
    );
    var buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(component, 'button');
    assert.equal(buttons.length, 1);
    assert.equal(buttons[0].getAttribute('id'), 'submitButton');
    assert.equal(buttons[0].textContent, 'Submit');
  });

  it('non-project level, can submit, have', function () {
    var component = ReactTestUtils.renderIntoDocument(
      <Controls
        imgUrl="foo"
        projectLevel={false}
        submittable={true}
        submitted={true}
      />
    );
    var buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(component, 'button');
    assert.equal(buttons.length, 1);
    assert.equal(buttons[0].getAttribute('id'), 'unsubmitButton');
    assert.equal(buttons[0].textContent, 'Unsubmit');
  });

  it('non-project level, cant submit', function () {
    var component = ReactTestUtils.renderIntoDocument(
      <Controls
        imgUrl="foo"
        projectLevel={false}
        submittable={false}
        submitted={false}
      />
    );
    var buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(component, 'button');
    assert.equal(buttons.length, 1);
    assert.equal(buttons[0].getAttribute('id'), 'finishButton');
    assert.equal(buttons[0].textContent, 'Finish');
  });


  it('project level (cant submit)', function () {
    var component = ReactTestUtils.renderIntoDocument(
      <Controls
        imgUrl="foo"
        projectLevel={true}
        submittable={false}
        submitted={false}
      />
    );
    var buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(component, 'button');
    assert.equal(buttons.length, 0);
  });
});
