import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import BaseDialog from '../BaseDialog';
import Button from "../Button";
import DialogFooter from "../teacherDashboard/DialogFooter";

export default class ConfirmRemoveStudentDialog extends React.Component {
  static propTypes = {
    isOpen: BaseDialog.propTypes.isOpen,
    disabled: PropTypes.bool,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  render() {
    const {isOpen, disabled, onConfirm, onCancel} = this.props;
    return (
      <BaseDialog
        useUpdatedStyles
        uncloseable
        isOpen={isOpen}
        style={{paddingLeft: 20, paddingRight: 20, paddingBottom: 20}}
      >
        <h2>{i18n.removeStudentHeader()}</h2>
        <div>
          {i18n.removeStudentConfirm1() + ' '}
          <a target="_blank" href="https://support.code.org/hc/en-us/articles/115001475131-Adding-a-personal-login-to-a-teacher-created-account">
            {i18n.removeStudentConfirm2()}
          </a>
          {' ' + i18n.removeStudentConfirm3()}
        </div>
        <DialogFooter>
          <Button
            text={i18n.dialogCancel()}
            onClick={onCancel}
            color={Button.ButtonColor.gray}
            disabled={disabled}
          />
          <Button
            text={i18n.removeStudent()}
            onClick={onConfirm}
            color={Button.ButtonColor.red}
            disabled={disabled}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
