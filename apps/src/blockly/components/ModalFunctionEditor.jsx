import React from 'react';
import {
  MODAL_EDITOR_ID,
  MODAL_EDITOR_NAME_INPUT_ID,
  MODAL_EDITOR_DELETE_ID,
  MODAL_EDITOR_CLOSE_ID,
} from '@cdo/apps/blockly/addons/functionEditorConstants';
import moduleStyles from './modal-function-editor.module.scss';
import classNames from 'classnames';

export default function ModalFunctionEditor() {
  return (
    <div id={MODAL_EDITOR_ID} className={moduleStyles.container}>
      <div className={classNames('toolbar', moduleStyles.toolbar)}>
        <div className={moduleStyles.buttons}>
          <button type="button" id={MODAL_EDITOR_DELETE_ID}>
            delete
          </button>
          <button type="button" id={MODAL_EDITOR_CLOSE_ID}>
            close
          </button>
        </div>
        <div className={moduleStyles.inputs}>
          <div
            id={`${MODAL_EDITOR_NAME_INPUT_ID}Container`}
            className={moduleStyles.inputTitleContainer}
          >
            <div className={moduleStyles.wideInput}>Name your function: </div>
            <div>
              <input
                id={MODAL_EDITOR_NAME_INPUT_ID}
                className={moduleStyles.wideInput}
                type="text"
              />
            </div>
          </div>
          <div className={moduleStyles.inputTitleContainer}>
            <div className={moduleStyles.wideInput}>
              What is your function supposed to do?
            </div>
            <div>
              <textarea
                id="functionDescriptionText"
                className={moduleStyles.wideInput}
                rows="2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
