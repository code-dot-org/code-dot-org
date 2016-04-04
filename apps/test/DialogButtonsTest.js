var testUtils = require('./util/testUtils');
testUtils.setupLocales();
testUtils.setExternalGlobals();
var assert = testUtils.assert;
var ReactTestUtils = require('react-addons-test-utils');

var DialogButtons = require('@cdo/apps/templates/DialogButtons.jsx');
var msg = require('@cdo/apps/locale');

describe('DialogButtons', function () {
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

  it('displays A/B testing strings for non-signed-in users', function () {
    testDialogButtonsWithUserId(undefined, msg.hintRequest());
  });

  it('displays A/B testing strings for signed-in users', function () {
    testDialogButtonsWithUserId(1, msg.showBlock());
    testDialogButtonsWithUserId(2, msg.hintRequest());
    testDialogButtonsWithUserId(3, msg.showBlock());
    testDialogButtonsWithUserId(4, msg.hintRequest());
  });
});
