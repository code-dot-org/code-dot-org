import Dialog from '@code-dot-org/component-library/dialog';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import {multipleChoiceDataPropType} from './assessmentDataShapes';

import moduleStyles from './details-dialog.module.scss';

class MultipleChoiceSurveyQuestionDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    questionData: multipleChoiceDataPropType.isRequired,
  };

  renderContent() {
    const {questionData} = this.props;

    return (
      <div>
        <SafeMarkdown
          className={moduleStyles.multipleChoiceDetailsQuestion}
          markdown={questionData.question}
        />
        {questionData.answers && questionData.answers.length > 0 && (
          <div>
            {questionData.answers.map((answer, index) => (
              <div key={index} className={moduleStyles.answerBlock}>
                <div className={moduleStyles.answerLetter}>
                  {answer.multipleChoiceOption}
                </div>
                <div className={moduleStyles.answerBody}>
                  <SafeMarkdown
                    markdown={`${answer.text} (${answer.percentAnswered}%)`}
                  />
                </div>
              </div>
            ))}
          </div>
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

export default MultipleChoiceSurveyQuestionDialog;
