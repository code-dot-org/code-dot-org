import PropTypes from 'prop-types';
import React, {Component} from 'react';
import BaseDialog from '../../BaseDialog';
import DialogFooter from '../../teacherDashboard/DialogFooter';
import Button from '../../Button';
import i18n from '@cdo/locale';

class UnassignSectionDialog extends Component {
  static propTypes = {
    sectionName: PropTypes.string.isRequired,
    courseName: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    sectionId: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    isUnassignPending: PropTypes.bool.isRequired,
    unassignSection: PropTypes.func.isRequired
  };

  close = () => this.props.onClose();

  unassign = () => this.props.unassignSection(this.props.sectionId);

  render() {
    const {isOpen, courseName, sectionName} = this.props;
    return (
      <BaseDialog
        isOpen={isOpen}
        handleClose={this.close}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2 className="unassign-dialog-title">
          {i18n.unassignSection({
            courseName: courseName
          })}
        </h2>
        <div style={{marginBottom: 10}}>
          {i18n.unassignSectionConfirm({
            sectionName: sectionName,
            courseName: courseName
          })}
        </div>
        <DialogFooter>
          <Button
            __useDeprecatedTag
            text={i18n.dialogCancel()}
            onClick={this.close}
            color={Button.ButtonColor.gray}
            className="no-mc"
          />
          <Button
            __useDeprecatedTag
            text={i18n.unassignConfirm()}
            onClick={this.unassign}
            color={Button.ButtonColor.orange}
            className="no-mc ui-confirm-unassign-section-button"
            isPending={this.props.isUnassignPending}
            pendingText={i18n.unassigning()}
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
    paddingBottom: 20
  }
};

export const UnconnectedUnassignSectionDialog = UnassignSectionDialog;
