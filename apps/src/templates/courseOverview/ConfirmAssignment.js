import React, { Component, PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';

const styles = {
  header: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 14,
    marginBottom: 10,
    marginTop: 10,
    paddingBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderStyle: 'solid',
    borderColor: color.lighter_gray
  }
};

/**
 * Confirmation dialog for when assigning a course from the course overview page
 */
export default class ConfirmAssignment extends Component {
  static propTypes = {
    sectionName: PropTypes.string.isRequired,
    assignmentName: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    isHiddenFromSection: PropTypes.bool,
  };

  render() {
    const { sectionName, assignmentName, onClose, onConfirm, isHiddenFromSection } = this.props;
    const header = isHiddenFromSection ? i18n.unhideAndAssignHeader() : i18n.assignCourse();
    const content = isHiddenFromSection ?
      i18n.assignHiddenUnitConfirm({assignmentName, sectionName}) :
      i18n.assignConfirm({assignmentName, sectionName});
    const buttonText = isHiddenFromSection ? i18n.unhideUnitAndAssign() : i18n.assign();

    return (
      <BaseDialog isOpen={true} handleClose={onClose}>
        <div style={styles.header}>
          {header}
        </div>
        <div style={styles.content}>
          {content}
        </div>
        <div style={{textAlign: 'right'}}>
          <Button
            text={i18n.dialogCancel()}
            onClick={onClose}
            color={Button.ButtonColor.gray}
          />
          <Button
            id="confirm-assign"
            text={buttonText}
            style={{marginLeft: 5}}
            onClick={onConfirm}
            color={Button.ButtonColor.orange}
          />
        </div>
      </BaseDialog>
    );
  }
}
