import React, { Component, PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';

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
export default class AssignCourseConfirm extends Component {
  static propTypes = {
    sectionName: PropTypes.string.isRequired,
    courseName: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
  };

  render() {
    const { sectionName, courseName, onClose, onConfirm } = this.props;

    return (
      <BaseDialog isOpen={true} handleClose={onClose}>
        <div style={styles.header}>
          {i18n.assignCourse()}
        </div>
        <div style={styles.content}>
          {i18n.assignCourseConfirm({courseName, sectionName})}
        </div>
        <div style={{textAlign: 'right'}}>
          <ProgressButton
            text={i18n.dialogCancel()}
            onClick={onClose}
            color={ProgressButton.ButtonColor.gray}
          />
          <ProgressButton
            text={i18n.assign()}
            style={{marginLeft: 5}}
            onClick={onConfirm}
            color={ProgressButton.ButtonColor.orange}
          />
        </div>
      </BaseDialog>
    );
  }
}
