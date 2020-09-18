import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import i18n from '@cdo/locale';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import color from '@cdo/apps/util/color';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {multipleChoiceDataPropType} from './assessmentDataShapes';

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

class MultipleChoiceSurveyQuestionDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    questionData: multipleChoiceDataPropType.isRequired
  };

  render() {
    const {questionData} = this.props;

    // Questions are in markdown format and should not display as plain text in the dialog.

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.props.isDialogOpen}
        style={styles.dialog}
        handleClose={this.props.closeDialog}
      >
        <div>
          <h2>{i18n.questionDetails()}</h2>
          <div style={styles.instructions}>
            <SafeMarkdown markdown={questionData.question} />
          </div>
          {questionData.answers && questionData.answers.length > 0 && (
            <div>
              {questionData.answers.map((answer, index) => {
                return (
                  <div key={index} style={styles.answerBlock}>
                    <div style={styles.answerLetter}>
                      {answer.multipleChoiceOption}
                    </div>
                    <div style={styles.answers} />
                    <SafeMarkdown
                      markdown={
                        answer.text + ' (' + answer.percentAnswered + '%)'
                      }
                    />
                    <div style={{clear: 'both'}} />
                  </div>
                );
              })}
            </div>
          )}
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

export default MultipleChoiceSurveyQuestionDialog;
