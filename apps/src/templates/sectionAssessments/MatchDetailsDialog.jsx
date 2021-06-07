import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import Button from '@cdo/apps/templates/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import i18n from '@cdo/locale';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import {getCurrentQuestion, QuestionType} from './sectionAssessmentsRedux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {matchDetailsQuestionPropType} from './assessmentDataShapes';

class MatchDetailsDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    questionAndAnswers: matchDetailsQuestionPropType
  };

  render() {
    const {questionAndAnswers} = this.props;

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.props.isDialogOpen}
        style={styles.dialog}
        handleClose={this.props.closeDialog}
      >
        {questionAndAnswers.questionType === QuestionType.MATCH && (
          <div>
            <h2>{i18n.questionDetails()}</h2>
            <div style={styles.instructions}>
              <SafeMarkdown markdown={questionAndAnswers.question} />
            </div>
            {questionAndAnswers.answers &&
              questionAndAnswers.options &&
              questionAndAnswers.answers.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>{i18n.option()}</th>
                      <th>{i18n.answer()}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionAndAnswers.answers.map((answer, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            <div style={styles.answers}>
                              <SafeMarkdown
                                markdown={questionAndAnswers.options[index]}
                              />
                            </div>
                          </td>
                          <td>
                            <div style={styles.answers}>
                              <SafeMarkdown markdown={answer} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
    width: 250
  }
};

export const UnconnectedMatchDetailsDialog = MatchDetailsDialog;

export default connect(state => ({
  questionAndAnswers: getCurrentQuestion(state)
}))(MatchDetailsDialog);
