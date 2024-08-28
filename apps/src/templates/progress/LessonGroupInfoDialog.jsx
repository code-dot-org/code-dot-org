import PropTypes from 'prop-types';
import React, {Component} from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import LessonGroupInfo from '@cdo/apps/templates/progress/LessonGroupInfo';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

// Dialog with information about a lesson group
export default class LessonGroupInfoDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    displayName: PropTypes.string.isRequired,
    description: PropTypes.string,
    closeDialog: PropTypes.func,
    bigQuestions: PropTypes.string,
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
            text={i18n.closeDialog()}
            onClick={this.props.closeDialog}
            color={Button.ButtonColor.brandSecondaryDefault}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

const styles = {
  description: {
    color: color.dark_charcoal,
    ...fontConstants['main-font-regular'],
  },
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  bigQuestion: {
    ...fontConstants['main-font-bold'],
  },
  lessonGroupName: {
    color: color.purple,
  },
  subTitle: {
    color: color.teal,
  },
};
