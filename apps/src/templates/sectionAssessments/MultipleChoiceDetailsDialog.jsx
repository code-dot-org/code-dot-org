import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import Button from '@cdo/apps/templates/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import i18n from '@cdo/locale';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import {
  getCurrentQuestion,
  getStudentAnswersForCurrentQuestion,
  QuestionType
} from './sectionAssessmentsRedux';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import MultipleChoiceByQuestionTable from './MultipleChoiceByQuestionTable';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

class MultipleChoiceDetailsDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    questionAndAnswers: PropTypes.object,
    studentAnswers: PropTypes.array
  };

  render() {
    const {questionAndAnswers, studentAnswers} = this.props;

    // Questions are in markdown format and should not display as plain text in the dialog.

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.props.isDialogOpen}
        style={styles.dialog}
        handleClose={this.props.closeDialog}
      >
        {questionAndAnswers.questionType === QuestionType.MULTI && (
          <div>
            <h2>{i18n.questionDetails()}</h2>
            <div style={styles.instructions}>
              <SafeMarkdown markdown={questionAndAnswers.question} />
            </div>
            {questionAndAnswers.answers &&
              questionAndAnswers.answers.length > 0 && (
                <div>
                  {questionAndAnswers.answers.map((answer, index) => {
                    return (
                      <div key={index} style={styles.answerBlock}>
                        <div style={styles.iconSpace}>
                          {answer.correct && (
                            <FontAwesome
                              icon="check-circle"
                              style={styles.icon}
                            />
                          )}
                          {!answer.correct && <span>&nbsp;</span>}
                        </div>
                        <div style={styles.answerLetter}>{answer.letter}</div>
                        <div style={styles.answers} />
                        <SafeMarkdown markdown={answer.text} />
                        <div style={{clear: 'both'}} />
                      </div>
                    );
                  })}
                </div>
              )}
            {studentAnswers && studentAnswers.length > 0 && (
              <MultipleChoiceByQuestionTable studentAnswers={studentAnswers} />
            )}
          </div>
        )}
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
  },
  answers: {
    float: 'left',
    width: 550
  },
  icon: {
    color: color.level_perfect
  },
  iconSpace: {
    width: 40,
    float: 'left'
  },
  answerBlock: {
    width: '100%'
  },
  answerLetter: {
    width: 30,
    float: 'left',
    fontWeight: 'bold'
  }
};

export const UnconnectedMultipleChoiceDetailsDialog = MultipleChoiceDetailsDialog;

export default connect(state => ({
  questionAndAnswers: getCurrentQuestion(state),
  studentAnswers: getStudentAnswersForCurrentQuestion(state)
}))(MultipleChoiceDetailsDialog);
