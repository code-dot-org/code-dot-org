import PropTypes from 'prop-types';
import React from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import color from '../../util/color';

export default class NameFailureDialog extends React.Component {
  static propTypes = {
    flaggedText: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired
  };

  render() {
    return (
      <BaseDialog
        title="Unable to rename project"
        isOpen={this.props.isOpen}
        handleClose={this.props.handleClose}
      >
        <h1 style={styles.title}>{i18n.nameFailureDialogTitle()}</h1>
        <div style={styles.body}>
          <p>{i18n.nameFailureDialogBody({text: this.props.flaggedText})}</p>
        </div>
        <DialogFooter rightAlign>
          <Button
            __useDeprecatedTag
            text={i18n.ok()}
            onClick={this.props.handleClose}
            color={Button.ButtonColor.orange}
            className="no-mc ui-confirm-project-delete-button"
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

const styles = {
  title: {
    textAlign: 'left',
    fontSize: '32px'
  },
  body: {
    textAlign: 'left',
    color: color.black
  }
};
