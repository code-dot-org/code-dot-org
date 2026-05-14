import Dialog from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import MultipleChoiceByQuestionTable from './MultipleChoiceByQuestionTable';
import {
  getCurrentQuestion,
  getStudentAnswersForCurrentQuestion,
  QuestionType,
} from './sectionAssessmentsRedux';

import moduleStyles from './details-dialog.module.scss';

class MultipleChoiceDetailsDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    questionAndAnswers: PropTypes.object,
    studentAnswers: PropTypes.array,
  };

  renderContent() {
    const {questionAndAnswers, studentAnswers} = this.props;

    if (questionAndAnswers.questionType !== QuestionType.MULTI) {
      return null;
    }

    return (
      <div>
        <SafeMarkdown
          className={moduleStyles.multipleChoiceDetailsQuestion}
          markdown={questionAndAnswers.question}
        />
        {questionAndAnswers.answers &&
          questionAndAnswers.answers.length > 0 && (
            <div>
              {questionAndAnswers.answers.map((answer, index) => (
                <div key={index} className={moduleStyles.answerBlock}>
                  <div className={moduleStyles.iconColumn}>
                    {answer.correct && (
                      <FontAwesomeV6Icon
                        iconName="check-circle"
                        className={moduleStyles.correctIcon}
                      />
                    )}
                  </div>
                  <div className={moduleStyles.answerLetter}>
                    {answer.letter}
                  </div>
                  <div className={moduleStyles.answerBody}>
                    <SafeMarkdown markdown={answer.text} />
                  </div>
                </div>
              ))}
            </div>
          )}
        {studentAnswers && studentAnswers.length > 0 && (
          <MultipleChoiceByQuestionTable studentAnswers={studentAnswers} />
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

export const UnconnectedMultipleChoiceDetailsDialog =
  MultipleChoiceDetailsDialog;

export default connect(state => ({
  questionAndAnswers: getCurrentQuestion(state),
  studentAnswers: getStudentAnswersForCurrentQuestion(state),
}))(MultipleChoiceDetailsDialog);
