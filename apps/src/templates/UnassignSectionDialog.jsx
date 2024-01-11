import PropTypes from 'prop-types';
import React, {Component} from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

class UnassignSectionDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    sectionId: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
    cancelUnassign: PropTypes.func.isRequired,
    unassignSection: PropTypes.func.isRequired,
    courseName: PropTypes.string,
    sectionName: PropTypes.string,
  };

  unassign = () => {
    this.props.unassignSection();
    this.props.onClose();
  };

  render() {
    const {isOpen, courseName, sectionName, cancelUnassign} = this.props;
    return (
      <BaseDialog
        isOpen={isOpen}
        handleClose={cancelUnassign}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2 className="unassign-dialog-title">
          {i18n.unassignSection({
            courseName: courseName || i18n.thisUnit(),
          })}
        </h2>
        <div id="unassign-dialog-body" style={styles.confirm}>
          {i18n.unassignSectionConfirm({
            sectionName: sectionName,
            courseName: courseName || i18n.thisUnit(),
          })}
        </div>
        <DialogFooter>
          <Button
            text={i18n.dialogCancel()}
            onClick={cancelUnassign}
            color={Button.ButtonColor.gray}
            className="ui-unassign-cancel-button"
          />
          <Button
            text={i18n.unassignConfirm()}
            onClick={this.unassign}
            color={Button.ButtonColor.brandSecondaryDefault}
            className="ui-confirm-unassign-section-button"
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  confirm: {
    marginBottom: 10,
  },
};

export default UnassignSectionDialog;
