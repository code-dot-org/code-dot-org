/**
 * This helper can be used by an app (e.g. GameLab) to handle the pressing of
 * submit/unsubmit buttons if the level is submittable.
 */

import commonMsg from '@cdo/locale';
import dom from './dom';
import React from 'react';
import ReactDOM from 'react-dom';
import DialogButtons from './templates/DialogButtons';
import {getLastServerResponse} from './code-studio/reporting';

// Parameters provided by the calling app.
let studioApp, onPuzzleComplete, unsubmitUrl;

/**
 * Set up the handlers for the submit and unsubmit buttons.
 * The DOM should have submitButton and unsubmitButton by now.
 * Also store some parameters to be used in these handlers.
 *
 * @param {Object} params
 * @param {Object} params.studioApp - The studioApp itself.
 * @param {function} params.onPuzzleComplete - Function to call when submitting.
 * @param {string} params.unsubmitUrl - URL to post to when unsubmitting.
 */
export function initializeSubmitHelper(params) {
  studioApp = params.studioApp;
  onPuzzleComplete = params.onPuzzleComplete;
  unsubmitUrl = params.unsubmitUrl;

  const submitButton = document.getElementById('submitButton');
  if (submitButton) {
    dom.addClickTouchEvent(submitButton, onPuzzleSubmit);
  }

  const unsubmitButton = document.getElementById('unsubmitButton');
  if (unsubmitButton) {
    dom.addClickTouchEvent(unsubmitButton, onPuzzleUnsubmit);
  }
}

/**
 * If submit succeeds, then redirect appropriately.  Called by the app.
 *
 * @param {string} [response.redirect] - URL to go to.  When not provided, we'll use the
 *   last server response from reporting.js to pick a redirect.  This sometimes happens on
 *   contained levels where the milestone post and submit are two separate operations.
 */
export function onSubmitComplete(response) {
  const redirect = response
    ? response.redirect
    : getLastServerResponse().nextRedirect;
  window.location.href = redirect;
}

/**
 * When submit button is pressed, confirm, and then do it.
 */
function onPuzzleSubmit() {
  showConfirmationDialog({
    title: commonMsg.submitYourProject(),
    text: commonMsg.submitYourProjectConfirm(),
    onConfirm: () => onPuzzleComplete(true)
  });
}

/**
 * When unsubmit button is pressed, confirm, and then do it.
 */
function onPuzzleUnsubmit() {
  showConfirmationDialog({
    title: commonMsg.unsubmitYourProject(),
    text: commonMsg.unsubmitYourProjectConfirm(),
    onConfirm: unsubmit
  });
}

/**
 * Tell the server we're unsubmitting the solution.
 */
function unsubmit() {
  $.post(
    unsubmitUrl,
    {_method: 'PUT', user_level: {submitted: false}},
    function() {
      location.reload();
    }
  );
}

/**
 * Show a modal dialog with a title, text, and OK and Cancel buttons
 * @param {title}
 * @param {text}
 * @param {callback} [onConfirm] what to do when the user clicks OK
 * @param {string} [filterSelector] Optional selector to filter for.
 */
function showConfirmationDialog(config) {
  config.text = config.text || '';
  config.title = config.title || '';

  const contentDiv = document.createElement('div');
  contentDiv.innerHTML =
    '<p class="dialog-title">' +
    config.title +
    '</p>' +
    '<p>' +
    config.text +
    '</p>';

  const buttons = document.createElement('div');
  ReactDOM.render(
    <DialogButtons
      confirmText={commonMsg.dialogOK()}
      cancelText={commonMsg.dialogCancel()}
    />,
    buttons
  );
  contentDiv.appendChild(buttons);

  const dialog = studioApp.createModalDialog({
    contentDiv: contentDiv,
    defaultBtnSelector: '#confirm-button'
  });

  const cancelButton = buttons.querySelector('#again-button');
  if (cancelButton) {
    dom.addClickTouchEvent(cancelButton, function() {
      dialog.hide();
    });
  }

  const confirmButton = buttons.querySelector('#confirm-button');
  if (confirmButton) {
    dom.addClickTouchEvent(confirmButton, function() {
      if (config.onConfirm) {
        config.onConfirm();
      }
      dialog.hide();
    });
  }

  dialog.show();
}
