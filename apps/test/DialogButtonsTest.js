window.React = require('react');
window.ReactDOM = require('react-dom');
var ReactTestUtils = require('react-addons-test-utils');

var testUtils = require('./util/testUtils');
var assert = testUtils.assert;

var DialogButtons = require('@cdo/apps/templates/DialogButtons.jsx');
var msg = require('@cdo/apps/locale');

describe('DialogButtons', function () {
  it('displays the range of A/B testing strings', function () {

    var isAgainButton = function (childComponent) {
      return childComponent.id === 'hint-request-button';
    };

    var testDialogButtonsWithUserId = function (userId, expectedString) {
      var dialogButtons = <DialogButtons tryAgain={msg.tryAgain()} shouldPromptForHint={true} userId={userId} />;
      var componentInstance = ReactTestUtils.renderIntoDocument(dialogButtons);
      var buttons = ReactTestUtils.findAllInRenderedTree(componentInstance, isAgainButton);

      assert.equal(buttons.length, 1);
      assert.equal(buttons[0].innerText, expectedString);
    };

    // Undefined or even means "See hint"; odd means "Get a block"
    testDialogButtonsWithUserId(undefined, msg.hintRequest());
    testDialogButtonsWithUserId(1, msg.showBlock());
    testDialogButtonsWithUserId(2, msg.hintRequest());
    testDialogButtonsWithUserId(3, msg.showBlock());
    testDialogButtonsWithUserId(4, msg.hintRequest());

  });
});
