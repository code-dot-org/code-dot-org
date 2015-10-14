window.React = require('react');
require('react/addons');
var ReactTestUtils = React.addons.TestUtils;

var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
testUtils.setupLocales('Applab');
var ShareWarningsDialog = require('@cdo/apps/templates/ShareWarningsDialog.jsx');
var ShareWarnings = require('@cdo/apps/templates/ShareWarnings.jsx');
var AgeDropdown = require('@cdo/apps/templates/AgeDropdown.jsx');

var msg = require('@cdo/apps/locale');

describe('ShareWarningsDialog', function () {
  // function isDataDiv(childComponent) {
  //   if(!ReactTestUtils.
  // }

  function isDivWithText(childComponent, text) {
    if (!ReactTestUtils.isDOMComponent(childComponent)) {
      return false;
    }
    var dom = childComponent.getDOMNode();
    return dom.tagName === 'DIV' && dom.innerHTML === text;
  }

  function isDataPromptDiv(childComponent) {
    return isDivWithText(childComponent, msg.shareWarningsStoreData());
  }

  function isAgeDiv(childComponent) {
    return isDivWithText(childComponent, msg.shareWarningsAge());
  }

  it('only shows age prompt if not signedIn and we dont storeData', function () {
    var reactElement = React.createElement(ShareWarningsDialog, {
      storesData: false,
      signedIn: false,
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

    assert.strictEqual(dataPromptDivs.length, 0);
    assert.strictEqual(ageDivs.length, 1);
    assert.strictEqual(ageDropdowns.length, 1);
  });

  it('only shows data prompt if signedIn and we storeData', function () {
    var reactElement = React.createElement(ShareWarningsDialog, {
      storesData: true,
      signedIn: true,
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

  it('shows both age and data if not signedIn and we storeData', function () {
    var reactElement = React.createElement(ShareWarningsDialog, {
      storesData: true,
      signedIn: false,
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

  it('doesnt show a dialog when signedIn and we dont storeData', function () {
    var reactElement = React.createElement(ShareWarningsDialog, {
      storesData: false,
      signedIn: true,
      handleClose: function () {},
      handleTooYoung: function () {}
    });
    var componentInstance = ReactTestUtils.renderIntoDocument(reactElement);
    // isMounted returns undefined instead of false. this is allegedly fixed
    // in future versions of React
    assert.equal(!!componentInstance.isMounted(), false, 'component unmounted');
  });
});
