import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import fontConstants from '@cdo/apps/fontConstants';
import BaseDialog from '../../BaseDialog';
import DialogFooter from '../../teacherDashboard/DialogFooter';
import Button from '../../Button';
import LessonStatusList from './LessonStatusList';

export default class LessonStatusDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleConfirm}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2>{i18n.updateUnpluggedLessonProgress()}</h2>
        <p>{i18n.updateUnpluggedLessonProgressSubHeading()}</p>
        <h3>{i18n.completedUnpluggedLessons()}</h3>
        <LessonStatusList dialog={'LessonStatusDialog'} />
        <p>{i18n.pluggedLessonsNote()}</p>
        <DialogFooter rightAlign>
          <Button
            __useDeprecatedTag
            text={i18n.closeAndSave()}
            onClick={this.props.handleConfirm}
            color={Button.ButtonColor.brandSecondaryDefault}
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
    paddingBottom: 20,
    ...fontConstants['main-font-regular'],
  },
};
