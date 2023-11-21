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
import {useSelector} from 'react-redux';
import color from '@cdo/apps/util/color';

export default function ModalFunctionEditor() {
  const isRtl = useSelector(state => state.isRtl);
  const buttonSize = Button.ButtonSize.narrow;
  // functionEditor.js handles setting the click handlers on these buttons.
  const emptyOnClick = () => {};
  const toolbarStyles = classNames(
    'toolbar',
    moduleStyles.toolbar,
    isRtl && moduleStyles.toolbarRtl
  );

  return (
    <div
      id={MODAL_EDITOR_ID}
      className={classNames(
        'modalFunctionEditorContainer',
        moduleStyles.container
      )}
    >
      <div className={toolbarStyles}>
        <div className={isRtl ? moduleStyles.buttonsRtl : moduleStyles.buttons}>
          <Button
            type="button"
            id={MODAL_EDITOR_DELETE_ID}
            onClick={emptyOnClick}
            color={Button.ButtonColor.white}
            style={buttonStyles}
            size={buttonSize}
            text={msg.delete()}
          />
          <Button
            type="button"
            id={MODAL_EDITOR_CLOSE_ID}
            onClick={emptyOnClick}
            color={Button.ButtonColor.white}
            style={buttonStyles}
            size={buttonSize}
            text={msg.closeDialog()}
          />
        </div>
      </div>
    </div>
  );
}

// In-line styles are used to avoid conflicting with classes applied by the Button class.
const buttonStyles = {
  border: `2px solid ${color.neutral_dark}`,
  fontWeight: 'bolder',
};
