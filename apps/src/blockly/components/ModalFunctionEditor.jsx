import React from 'react';
import {
  MODAL_EDITOR_ID,
  MODAL_EDITOR_NAME_INPUT_ID,
  MODAL_EDITOR_DELETE_ID,
  MODAL_EDITOR_CLOSE_ID,
  MODAL_EDITOR_DESCRIPTION_INPUT_ID,
} from '@cdo/apps/blockly/addons/functionEditorConstants';
import moduleStyles from './modal-function-editor.module.scss';

export default function ModalFunctionEditor() {
  return (
    <div id={MODAL_EDITOR_ID} className={moduleStyles.modalEditor}>
      <div
        className="toolbar"
        style={{
          zIndex: 1,
          position: 'absolute',
          left: '142px',
          top: '10px',
          width: '800px',
        }}
      >
        <div style={{float: 'right'}}>
          <button type="button" id={MODAL_EDITOR_DELETE_ID}>
            delete
          </button>
          <button type="button" id={MODAL_EDITOR_CLOSE_ID}>
            close
          </button>
        </div>
        <div
          id={`${MODAL_EDITOR_NAME_INPUT_ID}Container`}
          style={{padding: '10px', width: '100%'}}
        >
          <div style={{width: '100%'}}>Name your function: </div>
          <div>
            <input
              id={MODAL_EDITOR_NAME_INPUT_ID}
              style={{width: '100%'}}
              type="text"
            />
          </div>
        </div>
        <div style={{padding: '10px', width: '100%'}}>
          <div style={{width: '100%'}}>
            What is your function supposed to do?
          </div>
          <div>
            <textarea
              style={{width: '100%'}}
              id={MODAL_EDITOR_DESCRIPTION_INPUT_ID}
              rows="2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
