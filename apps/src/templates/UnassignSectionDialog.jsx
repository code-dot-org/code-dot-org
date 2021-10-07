import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import {sectionName} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

class UnassignSectionDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    sectionId: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
    unassignSection: PropTypes.func.isRequired,
    courseName: PropTypes.string.isRequired,
    // Redux
    sectionName: PropTypes.string
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
            courseName: courseName || 'this unit'
          })}
        </h2>
        <div style={{marginBottom: 10}}>
          {i18n.unassignSectionConfirm({
            sectionName: sectionName,
            courseName: courseName || 'this unit'
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

export default connect((state, props) => ({
  sectionName: sectionName(state, props.sectionId)
}))(UnassignSectionDialog);
