import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';
import LessonGroupInfo from '@cdo/apps/templates/progress/LessonGroupInfo';

// Dialog with information about a lesson group
export default class LessonGroupInfoDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    displayName: PropTypes.string.isRequired,
    description: PropTypes.string,
    closeDialog: PropTypes.func,
    bigQuestions: PropTypes.string
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.closeDialog}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2 style={styles.lessonGroupName}>{this.props.displayName}</h2>
        <LessonGroupInfo
          description={this.props.description}
          bigQuestions={this.props.bigQuestions}
        />
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
    fontWeight: 'bolder',
    fontFamily: '"Gotham 7r", sans-serif'
  },
  lessonGroupName: {
    color: color.purple
  },
  subTitle: {
    color: color.teal
  }
};
