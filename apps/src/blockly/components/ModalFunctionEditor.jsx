import React from 'react';
import {
  MODAL_EDITOR_ID,
  MODAL_EDITOR_DELETE_ID,
  MODAL_EDITOR_CLOSE_ID,
} from '@cdo/apps/blockly/addons/functionEditorConstants';
import moduleStyles from './modal-function-editor.module.scss';
import classNames from 'classnames';
import Button from '@cdo/apps/templates/Button';
import msg from '@cdo/locale';

export default function ModalFunctionEditor() {
  function renderButton(id, text, color) {
    /** functionEditor.js handles setting the click handlers on these buttons. */
    return (
      <Button
        type="button"
        id={id}
        onClick={() => {}}
        color={color}
        size={Button.ButtonSize.narrow}
      >
        {text}
      </Button>
    );
  }

  return (
    <div
      id={MODAL_EDITOR_ID}
      className={classNames(
        'modalFunctionEditorContainer',
        moduleStyles.container
      )}
    >
      <div className={classNames('toolbar', moduleStyles.toolbar)}>
        <div className={moduleStyles.buttons}>
          {renderButton(
            MODAL_EDITOR_DELETE_ID,
            msg.delete(),
            Button.ButtonColor.neutralDark
          )}
          {renderButton(
            MODAL_EDITOR_CLOSE_ID,
            msg.closeDialog(),
            Button.ButtonColor.brandSecondaryDefault
          )}
        </div>
      </div>
    </div>
  );
}
