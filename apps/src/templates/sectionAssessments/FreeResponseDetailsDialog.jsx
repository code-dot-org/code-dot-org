/* eslint-disable react/no-danger */
import PropTypes from 'prop-types';

import React, {Component} from 'react';
import {connect} from 'react-redux';
import Button from '@cdo/apps/templates/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import i18n from '@cdo/locale';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import {getCurrentQuestion} from './sectionAssessmentsRedux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

class FreeResponseDetailsDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    questionAndAnswers: PropTypes.object
  };

  render() {
    // Questions are in markdown format and should not display as plain text in the dialog.

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.props.isDialogOpen}
        style={styles.dialog}
        handleClose={this.props.closeDialog}
      >
        <h2>{i18n.questionText()}</h2>
        <div style={styles.instructions}>
          <SafeMarkdown markdown={this.props.questionAndAnswers.question} />
        </div>
        <DialogFooter>
          <Button
            __useDeprecatedTag
            text={i18n.done()}
            onClick={this.props.closeDialog}
            color={Button.ButtonColor.gray}
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
  },
  instructions: {
    marginTop: 20
  }
};

export const UnconnectedFreeResponseDetailsDialog = FreeResponseDetailsDialog;

export default connect(state => ({
  questionAndAnswers: getCurrentQuestion(state)
}))(FreeResponseDetailsDialog);
