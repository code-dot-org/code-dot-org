import React from 'react';
import ReactDOM from 'react-dom';

import LegacyDialog from '@cdo/apps/code-studio/LegacyDialog';
import {KeyCodes} from '@cdo/apps/constants';
import DialogButtons from '@cdo/apps/legacySharedComponents/DialogButtons';
import color from '@cdo/apps/util/color';

import dom from '../../dom';
/**
 * Shows a simple dialog that has a header, body, continue button, and cancel
 * button
 * @param {object} options Configurable options.
 * @param {string} [options.bodyText] Text for body portion
 * @param {boolean} [options.prompt=false] Whether to prompt for a string value
 * @param {string} [options.promptPrefill] If prompting, textbox prefill value
 * @param {string} options.cancelText Text for cancel button
 * @param {string} options.confirmText Text for confirm button
 * @param {boolean} [options.hideIcon=false] Whether to hide the icon
 * @param {onConfirmCallback} [options.onConfirm] Function to be called after clicking confirm
 * @param {onCancelCallback} [options.onCancel] Function to be called after clicking cancel
 */
export default function prompt(options) {
  console.log(options);
  const bodyTextStyle = {
    color: color.neutral_dark,
    fontSize: '14px',
  };

  var textBoxStyle = {
    marginBottom: 10,
  };
  var contentDiv = ReactDOM.render(
    <div>
      {options.bodyText && <p style={bodyTextStyle}>{options.bodyText}</p>}

      <input style={textBoxStyle} defaultValue={options.promptPrefill} />

      <DialogButtons
        confirmText={options.confirmText}
        cancelText={options.cancelText}
      />
    </div>,
    document.createElement('div')
  );

  var dialog = createModalDialog({
    contentDiv: contentDiv,
    icon: null,
    defaultBtnSelector: '#again-button',
  });

  var cancelButton = contentDiv.querySelector('#again-button');
  var textBox = contentDiv.querySelector('input');
  if (cancelButton) {
    dom.addClickTouchEvent(cancelButton, function () {
      if (options.onCancel) {
        if (textBox) {
          options.onCancel(textBox.value);
        } else {
          options.onCancel();
        }
      }
      dialog.hide();
    });
  }

  var confirmButton = contentDiv.querySelector('#confirm-button');
  if (confirmButton) {
    dom.addClickTouchEvent(confirmButton, function () {
      if (options.onConfirm) {
        options.onConfirm();
      }
      dialog.hide();
    });
  }

  dialog.show();
  if (textBox) {
    textBox.focus();
    textBox.select();
  }
}

function createModalDialog(options) {
  var modalBody = document.createElement('div');
  if (options.icon) {
    var imageDiv;
    imageDiv = document.createElement('img');
    imageDiv.className = 'modal-image';
    imageDiv.src = options.icon;
    modalBody.appendChild(imageDiv);
  } else {
    options.contentDiv.className += ' no-modal-icon';
  }

  if (options.markdownMode) {
    modalBody.className += ' markdown';
  }

  options.contentDiv.className += ' modal-content';
  modalBody.appendChild(options.contentDiv);

  var btn = options.contentDiv.querySelector(options.defaultBtnSelector);
  var keydownHandler = function (e) {
    if (e.keyCode === KeyCodes.ENTER) {
      simulateClick(btn);

      e.stopPropagation();
      e.preventDefault();
    }
  };

  var scrollableSelector = options.scrollableSelector || '.modal-content';
  var elementToScroll = options.scrollContent ? scrollableSelector : null;
  return new LegacyDialog({
    body: modalBody,
    onHidden: options.onHidden,
    onKeydown: btn ? keydownHandler : undefined,
    autoResizeScrollableElement: elementToScroll,
    id: options.id,
    header: options.header,
    close: options.showXButton,
  });
}

/**
 * Fire off a click event in a cross-browser supported manner. This code is
 * similar to Blockly.fireUIEvent (without taking a Blockly dependency).
 */
function simulateClick(element) {
  if (document.createEvent) {
    // W3
    const evt = document.createEvent('UIEvents');
    evt.initEvent('click', true, true); // event type, bubbling, cancelable
    element.dispatchEvent(evt);
  } else if (document.createEventObject) {
    // MSIE
    element.fireEvent('onClick', document.createEventObject());
  } else {
    throw 'FireEvent: No event creation mechanism.';
  }
}
