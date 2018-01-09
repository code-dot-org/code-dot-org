import {assert} from '../util/configuredChai';
var testUtils = require('./../util/testUtils');
var React = require('react');
var ReactTestUtils = require('react-addons-test-utils');
var ShareWarningsDialog = require('@cdo/apps/templates/ShareWarningsDialog');
var ShareWarnings = require('@cdo/apps/templates/ShareWarnings');
import AgeDropdown from '@cdo/apps/templates/AgeDropdown';

var msg = require('@cdo/locale');

describe('ShareWarningsDialog', function () {

  testUtils.setExternalGlobals();

  function isTagWithText(childComponent, tagName, text) {
    if (!ReactTestUtils.isDOMComponent(childComponent)) {
      return false;
    }
    var dom = childComponent;
    return dom.tagName === tagName && dom.innerHTML === text;
  }

  function isDataPromptDiv(childComponent) {
    return isTagWithText(childComponent, 'DIV', msg.shareWarningsStoreData());
  }

  function isAgeDiv(childComponent) {
    return isTagWithText(childComponent, 'DIV', msg.shareWarningsAge());
  }

  it('only shows age prompt if promptForAge and app doesnt store data', function () {
    var reactElement = React.createElement(ShareWarningsDialog, {
      showStoreDataAlert: false,
      promptForAge: true,
      handleClose: function () {},
      handleTooYoung: function () {}
    });
    var componentInstance = ReactTestUtils.renderIntoDocument(reactElement);

    // Get the inner ShareWarnings component
    var shareWarnings = ReactTestUtils.scryRenderedComponentsWithType(
      componentInstance, ShareWarnings)[0];

    var dataPromptDivs = ReactTestUtils.findAllInRenderedTree(shareWarnings,
      isDataPromptDiv);
    var ageDivs = ReactTestUtils.findAllInRenderedTree(shareWarnings, isAgeDiv);
    var ageDropdowns = ReactTestUtils.scryRenderedComponentsWithType(shareWarnings,
      AgeDropdown);

    assert.strictEqual(dataPromptDivs.length, 0, 'zero data prompt divs');
    assert.strictEqual(ageDivs.length, 1, 'one age div');
    assert.strictEqual(ageDropdowns.length, 1, 'one age dropdown div');
  });

  it('only shows data prompt if not promptForAge and app stores data', function () {
    var reactElement = React.createElement(ShareWarningsDialog, {
      showStoreDataAlert: true,
      promptForAge: false,
      handleClose: function () {},
      handleTooYoung: function () {}
    });
    var componentInstance = ReactTestUtils.renderIntoDocument(reactElement);

    // Get the inner ShareWarnings component
    var shareWarnings = ReactTestUtils.scryRenderedComponentsWithType(
      componentInstance, ShareWarnings)[0];

    var dataPromptDivs = ReactTestUtils.findAllInRenderedTree(shareWarnings,
      isDataPromptDiv);
    var ageDivs = ReactTestUtils.findAllInRenderedTree(shareWarnings, isAgeDiv);
    var ageDropdowns = ReactTestUtils.scryRenderedComponentsWithType(shareWarnings,
      AgeDropdown);

    assert.strictEqual(dataPromptDivs.length, 1);
    assert.strictEqual(ageDivs.length, 0);
    assert.strictEqual(ageDropdowns.length, 0);
  });

  it('shows both age and data if promptForAge and app stores data', function () {
    var reactElement = React.createElement(ShareWarningsDialog, {
      showStoreDataAlert: true,
      promptForAge: true,
      handleClose: function () {},
      handleTooYoung: function () {}
    });
    var componentInstance = ReactTestUtils.renderIntoDocument(reactElement);

    // Get the inner ShareWarnings component
    var shareWarnings = ReactTestUtils.scryRenderedComponentsWithType(
      componentInstance, ShareWarnings)[0];

    var dataPromptDivs = ReactTestUtils.findAllInRenderedTree(shareWarnings,
      isDataPromptDiv);
    var ageDivs = ReactTestUtils.findAllInRenderedTree(shareWarnings, isAgeDiv);
    var ageDropdowns = ReactTestUtils.scryRenderedComponentsWithType(shareWarnings,
      AgeDropdown);

    assert.strictEqual(dataPromptDivs.length, 1);
    assert.strictEqual(ageDivs.length, 1);
    assert.strictEqual(ageDropdowns.length, 1);
  });

  it('doesnt show a dialog when not promptForAge and app doesnt store data', function () {
    var reactElement = React.createElement(ShareWarningsDialog, {
      showStoreDataAlert: false,
      promptForAge: false,
      handleClose: function () {},
      handleTooYoung: function () {}
    });
    var componentInstance = ReactTestUtils.renderIntoDocument(reactElement);
    assert.equal(componentInstance.state.modalIsOpen, false);
  });

  it('calls handleClose if we click OK when signed in', function () {
    var handleCloseCalled = false;
    var reactElement = React.createElement(ShareWarningsDialog, {
      showStoreDataAlert: true,
      promptForAge: false,
      handleClose: function () {
        handleCloseCalled = true;
      },
      handleTooYoung: function () {}
    });
    var componentInstance = ReactTestUtils.renderIntoDocument(reactElement);
    assert.equal(!!componentInstance.isMounted(), true, 'component is mounted');

    var shareWarnings = ReactTestUtils.scryRenderedComponentsWithType(
      componentInstance, ShareWarnings)[0];

    var okButton = ReactTestUtils.scryRenderedDOMComponentsWithTag(shareWarnings,
      'button')[0];
    assert(okButton, 'have an ok button');

    ReactTestUtils.Simulate.click(okButton);
    assert(handleCloseCalled, 'closed dialog');

    assert.equal(componentInstance.state.modalIsOpen, false);
  });

  it('does not close if we click OK when signed out and didnt specify age', function () {
    var handleCloseCalled = false;
    var reactElement = React.createElement(ShareWarningsDialog, {
      showStoreDataAlert: true,
      promptForAge: true,
      handleClose: function () {
        handleCloseCalled = true;
      },
      handleTooYoung: function () {}
    });
    var componentInstance = ReactTestUtils.renderIntoDocument(reactElement);
    assert.equal(!!componentInstance.isMounted(), true, 'component is mounted');

    var shareWarnings = ReactTestUtils.scryRenderedComponentsWithType(
      componentInstance, ShareWarnings)[0];

    var okButton = ReactTestUtils.scryRenderedDOMComponentsWithTag(shareWarnings,
      'button')[0];
    assert(okButton, 'have an ok button');

    ReactTestUtils.Simulate.click(okButton);
    assert(!handleCloseCalled, 'closed dialog');

    assert.equal(componentInstance.state.modalIsOpen, true);
  });

  it('calls handleClose if we click OK when signed out and specified an age', function () {
    var handleCloseCalled = false;
    var reactElement = React.createElement(ShareWarningsDialog, {
      showStoreDataAlert: true,
      promptForAge: true,
      handleClose: function () {
        handleCloseCalled = true;
      },
      handleTooYoung: function () {}
    });
    var componentInstance = ReactTestUtils.renderIntoDocument(reactElement);
    assert.equal(!!componentInstance.isMounted(), true, 'component is mounted');

    var shareWarnings = ReactTestUtils.scryRenderedComponentsWithType(
      componentInstance, ShareWarnings)[0];

    var select = ReactTestUtils.scryRenderedDOMComponentsWithTag(shareWarnings,
      'select')[0];
    select.value = "13";

    var okButton = ReactTestUtils.scryRenderedDOMComponentsWithTag(shareWarnings,
      'button')[0];
    assert(okButton, 'have an ok button');

    ReactTestUtils.Simulate.click(okButton);
    assert(handleCloseCalled, 'closed dialog');

    assert.equal(componentInstance.state.modalIsOpen, false);
  });

  it('calls handleTooYoung if we enter an age < 13', function () {
    var handleTooYoungCalled = false;
    var reactElement = React.createElement(ShareWarningsDialog, {
      showStoreDataAlert: true,
      promptForAge: true,
      handleClose: function () { },
      handleTooYoung: function () {
        handleTooYoungCalled = true;
      }
    });
    var componentInstance = ReactTestUtils.renderIntoDocument(reactElement);
    assert.equal(!!componentInstance.isMounted(), true, 'component is mounted');

    var shareWarnings = ReactTestUtils.scryRenderedComponentsWithType(
      componentInstance, ShareWarnings)[0];

    var select = ReactTestUtils.scryRenderedDOMComponentsWithTag(shareWarnings,
      'select')[0];
    select.value = "12";

    var okButton = ReactTestUtils.scryRenderedDOMComponentsWithTag(shareWarnings,
      'button')[0];
    assert(okButton, 'have an ok button');

    ReactTestUtils.Simulate.click(okButton);
    assert(handleTooYoungCalled, 'closed dialog');
  });
});
