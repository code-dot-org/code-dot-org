import Dialog from '@code-dot-org/component-library/dialog';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import {getCurrentQuestion} from './sectionAssessmentsRedux';

class FreeResponseDetailsDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    questionAndAnswers: PropTypes.object,
  };

  render() {
    const {isDialogOpen, closeDialog, questionAndAnswers} = this.props;

    if (!isDialogOpen) return null;

    return (
      <Dialog
        title={i18n.questionText()}
        customContent={<SafeMarkdown markdown={questionAndAnswers.question} />}
        onClose={closeDialog}
        primaryButtonProps={{
          onClick: closeDialog,
          variant: 'contained',
          color: 'primary',
          children: i18n.done(),
        }}
      />
    );
  }
}

export const UnconnectedFreeResponseDetailsDialog = FreeResponseDetailsDialog;

export default connect(state => ({
  questionAndAnswers: getCurrentQuestion(state),
}))(FreeResponseDetailsDialog);
