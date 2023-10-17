import React from 'react';
import {
  MODAL_EDITOR_ID,
  MODAL_EDITOR_DELETE_ID,
  MODAL_EDITOR_CLOSE_ID,
} from '@cdo/apps/blockly/addons/functionEditorConstants';
import moduleStyles from './modal-function-editor.module.scss';
import classNames from 'classnames';

export default function ModalFunctionEditor() {
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
          <button type="button" id={MODAL_EDITOR_DELETE_ID}>
            delete
          </button>
          <button type="button" id={MODAL_EDITOR_CLOSE_ID}>
            close
          </button>
        </div>
      </div>
    </div>
  );
}
