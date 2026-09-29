import Dialog from '@code-dot-org/component-library/dialog';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import experiments from '@cdo/apps/util/experiments';
import i18n from '@cdo/locale';

/**
 * Confirmation shown when a student presses Submit on a level group, i.e. an
 * assessment or an anonymous survey. OK is the primary action, Cancel is
 * secondary.
 *
 * The button ids are hooks for the UI tests under
 * dashboard/test/ui/features/teacher_tools/level_types/level_group*.feature.
 * They deliberately differ from the legacy `#ok-button` / `#cancel-button`,
 * which apps/style/code-studio/legacy.scss still paints orange and green for
 * the remaining LegacyDialog callers.
 */
const LevelGroupSubmitDialog = ({id, title, body, onConfirm, onCancel}) => (
  <Dialog
    id={id}
    title={title}
    description={body}
    onClose={onCancel}
    primaryButtonProps={{
      id: 'levelgroup-submit-ok-button',
      children: i18n.okay(),
      onClick: onConfirm,
      type: 'button',
    }}
    secondaryButtonProps={{
      id: 'levelgroup-submit-cancel-button',
      children: i18n.cancel(),
      onClick: onCancel,
      type: 'button',
    }}
  />
);

LevelGroupSubmitDialog.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default LevelGroupSubmitDialog;

/**
 * Mounts the dialog in its own container under <body> and tears it down when
 * the user picks either button, presses Escape, or clicks the close button.
 *
 * @param {{id: string, title: string, body: string}} dialogProps
 * @param {function} onConfirm Called after the dialog closes on OK.
 */
export function showLevelGroupSubmitDialog(dialogProps, onConfirm) {
  // Same guard as dialogHelper's showDialog: the experiment suppresses every
  // level dialog, and with it the submit that OK would have triggered.
  if (experiments.isEnabled(experiments.BYPASS_DIALOG_POPUP)) {
    return;
  }

  const container = document.createElement('div');
  document.body.appendChild(container);

  const close = () => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  };

  createReactRoot(
    <LevelGroupSubmitDialog
      {...dialogProps}
      onCancel={close}
      onConfirm={() => {
        close();
        onConfirm();
      }}
    />,
    container,
    {legacyReactDomRender: true}
  );
}
