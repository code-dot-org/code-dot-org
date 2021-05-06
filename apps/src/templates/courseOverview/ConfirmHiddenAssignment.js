import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';

/**
 * Confirmation dialog for when assigning a script or course from the course or script overview page
 */
export default class ConfirmHiddenAssignment extends Component {
  static propTypes = {
    sectionName: PropTypes.string.isRequired,
    assignmentName: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired
  };

  render() {
    const {sectionName, assignmentName, onClose, onConfirm} = this.props;

    return (
      <BaseDialog isOpen={true} handleClose={onClose}>
        <div style={styles.header} className="uitest-confirm-assignment-dialog">
          {i18n.unhideAndAssignHeader()}
        </div>
        <div style={styles.content}>
          {i18n.assignHiddenUnitConfirm({assignmentName, sectionName})}
        </div>
        <div style={{textAlign: 'right'}}>
          <Button
            __useDeprecatedTag
            text={i18n.dialogCancel()}
            onClick={onClose}
            color={Button.ButtonColor.gray}
          />
          <Button
            __useDeprecatedTag
            id="confirm-assign"
            text={i18n.unhideUnitAndAssign()}
            style={{marginLeft: 5}}
            onClick={onConfirm}
            color={Button.ButtonColor.orange}
          />
        </div>
      </BaseDialog>
    );
  }
}

const styles = {
  header: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold'
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
