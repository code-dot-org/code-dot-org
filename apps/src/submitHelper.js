import commonMsg from '@cdo/locale';
import dom from './dom';
import React from 'react';
import ReactDOM from 'react-dom';
import DialogButtons from './templates/DialogButtons';

const Submit = module.exports = function (options) {
  this.studioApp = options.studioApp;
  this.onPuzzleComplete = options.onPuzzleComplete.bind(this);
  this.unsubmitUrl = options.unsubmitUrl;
};

// The DOM should have submitButton and unsubmitButton.  Set up handlers for them.
Submit.prototype.setupButtons = function () {
  const submitButton = document.getElementById('submitButton');
  if (submitButton) {
    dom.addClickTouchEvent(submitButton, this.onPuzzleSubmit.bind(this));
  }

  const unsubmitButton = document.getElementById('unsubmitButton');
  if (unsubmitButton) {
    dom.addClickTouchEvent(unsubmitButton, this.onPuzzleUnsubmit.bind(this));
  }
};

// If submit succeeds, then redirect appropriately.
Submit.prototype.onSubmitComplete = function (response) {
  window.location.href = response.redirect;
};

// When submit button is pressed, confirm, and then do it.
Submit.prototype.onPuzzleSubmit = function () {
  this.showConfirmationDialog({
    title: commonMsg.submitYourProject(),
    text: commonMsg.submitYourProjectConfirm(),
    onConfirm: () => this.onPuzzleComplete(true)
  });
};

// When unsubmit button is pressed, confirm, and then do it.
Submit.prototype.onPuzzleUnsubmit = function () {
  this.showConfirmationDialog({
    title: commonMsg.unsubmitYourProject(),
    text: commonMsg.unsubmitYourProjectConfirm(),
    onConfirm: () => this.unsubmit()
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

  const contentDiv = document.createElement('div');
  contentDiv.innerHTML = '<p class="dialog-title">' + config.title + '</p>' +
      '<p>' + config.text + '</p>';

  const buttons = document.createElement('div');
  ReactDOM.render(
    <DialogButtons
      confirmText={commonMsg.dialogOK()}
      cancelText={commonMsg.dialogCancel()}
    />, buttons);
  contentDiv.appendChild(buttons);

  const dialog = this.studioApp.createModalDialog({
    contentDiv: contentDiv,
    defaultBtnSelector: '#confirm-button'
  });

  const cancelButton = buttons.querySelector('#again-button');
  if (cancelButton) {
    dom.addClickTouchEvent(cancelButton, function () {
      dialog.hide();
    });
  }

  const confirmButton = buttons.querySelector('#confirm-button');
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

