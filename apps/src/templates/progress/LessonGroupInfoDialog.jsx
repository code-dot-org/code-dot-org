import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';

const styles = {
  description: {
    color: color.dark_charcoal,
    fontFamily: '"Gotham 4r", sans-serif'
  },
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  bigQuestion: {
    fontWeight: 'bolder'
  }
};

// Dialog with information about a lesson group
export default class LessonGroupInfoDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    displayName: PropTypes.string.isRequired,
    description: PropTypes.string,
    closeDialog: PropTypes.func,
    bigQuestions: PropTypes.array
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.closeDialog}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2>{this.props.displayName}</h2>
        {this.props.description && (
          <div style={styles.description}>
            <SafeMarkdown
              openExternalLinksInNewTab={true}
              markdown={this.props.description}
            />
          </div>
        )}
        {this.props.bigQuestions && this.props.bigQuestions.length > 0 && (
          <div style={styles.description}>
            <h5 style={styles.bigQuestion}>{i18n.bigQuestions()}</h5>
            <ul>
              {this.props.bigQuestions.map(question => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </div>
        )}
        <DialogFooter rightAlign>
          <Button
            __useDeprecatedTag
            text={i18n.closeDialog()}
            onClick={this.props.closeDialog}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
