/* eslint-disable react/no-danger */
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Button from '@cdo/apps/templates/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import i18n from "@cdo/locale";
import DialogFooter from "@cdo/apps/templates/teacherDashboard/DialogFooter";
import processMarkdown from 'marked';
import renderer from "@cdo/apps/util/StylelessRenderer";
import {getCurrentQuestion} from "./sectionAssessmentsRedux";
import color from "@cdo/apps/util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  instructions: {
    marginTop: 20
  },
  icon: {
    color: color.level_perfect,
  },
};

class MultipleChoiceDetailsDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    question: PropTypes.object,
  };

  render() {
    const {question} = this.props;

    // Questions are in markdown format and should not display as plain text in the dialog.
    const renderedMarkdown = processMarkdown(question.question, { renderer });

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.props.isDialogOpen}
        style={styles.dialog}
        handleClose={this.props.closeDialog}
      >
        <h2>{i18n.questionDetails()}</h2>
        <div
          style={styles.instructions}
          dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
        />
        {(question.answers && question.answers.length > 0) &&
          <div>
            {question.answers.map((answer, index) => {
              return (
                <div key={index}>
                  {answer.correct &&
                    <FontAwesome icon="check-circle" style={styles.icon}/>
                  }
                  <b>{answer.letter + ' '}</b>
                  <span>{answer.text}</span>
                </div>
              );
            })}
          </div>
        }
        <DialogFooter>
          <Button
            text={i18n.done()}
            onClick={this.props.closeDialog}
            color={Button.ButtonColor.gray}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

export const UnconnectedMultipleChoiceDetailsDialog = MultipleChoiceDetailsDialog;

export default connect(state => ({
  question: getCurrentQuestion(state),
}))(MultipleChoiceDetailsDialog);
