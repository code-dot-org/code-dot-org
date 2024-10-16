import classNames from 'classnames';
import React from 'react';
import {useSelector} from 'react-redux';

import {
  MODAL_EDITOR_ID,
  MODAL_EDITOR_DELETE_ID,
  MODAL_EDITOR_CLOSE_ID,
} from '@cdo/apps/blockly/addons/functionEditorConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {commonI18n} from '@cdo/apps/types/locale';
import color from '@cdo/apps/util/color';

import moduleStyles from './modal-function-editor.module.scss';

export default function ModalFunctionEditor() {
  const isRtl = useSelector((state: {isRtl: boolean}) => state.isRtl);
  const buttonSize = Button.ButtonSize.narrow;
  // functionEditor.js handles setting the click handlers on these buttons.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
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
            text={commonI18n.delete()}
          />
          <Button
            type="button"
            id={MODAL_EDITOR_CLOSE_ID}
            onClick={emptyOnClick}
            color={Button.ButtonColor.white}
            style={buttonStyles}
            size={buttonSize}
            text={commonI18n.closeDialog()}
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
