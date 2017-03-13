import commonMsg from '@cdo/locale';
import dom from './dom';
import React from 'react';
import ReactDOM from 'react-dom';
import DialogButtons from './templates/DialogButtons';

var Submit = module.exports = function (options) {
  this.studioApp = options.studioApp;
  this.onPuzzleComplete = options.onPuzzleComplete.bind(this);
  this.unsubmitUrl = options.unsubmitUrl;
};

// The DOM should have submitButton and unsubmitButton.  Set up handlers for them.
Submit.prototype.setupButtons = function () {
  var submitButton = document.getElementById('submitButton');
  if (submitButton) {
    dom.addClickTouchEvent(submitButton, this.onPuzzleSubmit.bind(this));
  }

  var unsubmitButton = document.getElementById('unsubmitButton');
  if (unsubmitButton) {
    dom.addClickTouchEvent(unsubmitButton, this.onPuzzleUnsubmit.bind(this));
  }
};

// If submit succeeds, then redirect appropriately.
Submit.prototype.onSubmitComplete = function (response) {
  window.location.href = response.redirect;
};

// Called when the user confirms they want to submit this solution.
Submit.prototype.onPuzzleSubmitConfirm = function () {
  this.onPuzzleComplete(true);
};

// When submit button is pressed, confirm, and then do it.
Submit.prototype.onPuzzleSubmit = function () {
  this.showConfirmationDialog({
    title: commonMsg.submitYourProject(),
    text: commonMsg.submitYourProjectConfirm(),
    onConfirm: this.onPuzzleSubmitConfirm.bind(this)
  });
};

// Called when the user confirms they want to unsubmit their solution.
Submit.prototype.onPuzzleUnsubmitConfirm = function () {
  this.unsubmit();
};

// When unsubmit button is pressed, confirm, and then do it.
Submit.prototype.onPuzzleUnsubmit = function () {
  this.showConfirmationDialog({
    title: commonMsg.unsubmitYourProject(),
    text: commonMsg.unsubmitYourProjectConfirm(),
    onConfirm: this.onPuzzleUnsubmitConfirm.bind(this)
  });
};

// Tell the server we're unsubmitting the solution.
Submit.prototype.unsubmit = function () {
  $.post(
    this.unsubmitUrl,
    {"_method": 'PUT', user_level: {submitted: false}},
    function () {
      location.reload();
    });
};

/**
 * Show a modal dialog with a title, text, and OK and Cancel buttons
 * @param {title}
 * @param {text}
 * @param {callback} [onConfirm] what to do when the user clicks OK
 * @param {string} [filterSelector] Optional selector to filter for.
 */
Submit.prototype.showConfirmationDialog = function (config) {
  config.text = config.text || "";
  config.title = config.title || "";

  var contentDiv = document.createElement('div');
  contentDiv.innerHTML = '<p class="dialog-title">' + config.title + '</p>' +
      '<p>' + config.text + '</p>';

  var buttons = document.createElement('div');
  ReactDOM.render(React.createElement(DialogButtons, {
    confirmText: commonMsg.dialogOK(),
    cancelText: commonMsg.dialogCancel()
  }), buttons);
  contentDiv.appendChild(buttons);

  var dialog = this.studioApp.createModalDialog({
    contentDiv: contentDiv,
    defaultBtnSelector: '#confirm-button'
  });

  var cancelButton = buttons.querySelector('#again-button');
  if (cancelButton) {
    dom.addClickTouchEvent(cancelButton, function () {
      dialog.hide();
    });
  }

  var confirmButton = buttons.querySelector('#confirm-button');
  if (confirmButton) {
    dom.addClickTouchEvent(confirmButton, function () {
      if (config.onConfirm) {
        config.onConfirm();
      }
      dialog.hide();
    });
  }

  dialog.show();
};

