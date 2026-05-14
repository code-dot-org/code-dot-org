import Dialog from '@code-dot-org/component-library/dialog';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import {matchDetailsQuestionPropType} from './assessmentDataShapes';
import {getCurrentQuestion, QuestionType} from './sectionAssessmentsRedux';

import moduleStyles from './details-dialog.module.scss';

class MatchDetailsDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    questionAndAnswers: matchDetailsQuestionPropType,
  };

  renderContent() {
    const {questionAndAnswers} = this.props;

    if (questionAndAnswers.questionType !== QuestionType.MATCH) {
      return null;
    }

    return (
      <div>
        <SafeMarkdown markdown={questionAndAnswers.question} />
        {questionAndAnswers.answers &&
          questionAndAnswers.options &&
          questionAndAnswers.answers.length > 0 && (
            <table className={moduleStyles.matchTable}>
              <thead>
                <tr>
                  <th>{i18n.option()}</th>
                  <th>{i18n.answer()}</th>
                </tr>
              </thead>
              <tbody>
                {questionAndAnswers.answers.map((answer, index) => (
                  <tr key={index}>
                    <td>
                      <SafeMarkdown
                        markdown={questionAndAnswers.options[index]}
                      />
                    </td>
                    <td>
                      <SafeMarkdown markdown={answer} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    );
  }

  render() {
    const {isDialogOpen, closeDialog} = this.props;

    if (!isDialogOpen) return null;

    return (
      <Dialog
        title={i18n.questionDetails()}
        customContent={this.renderContent()}
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

export const UnconnectedMatchDetailsDialog = MatchDetailsDialog;

export default connect(state => ({
  questionAndAnswers: getCurrentQuestion(state),
}))(MatchDetailsDialog);
