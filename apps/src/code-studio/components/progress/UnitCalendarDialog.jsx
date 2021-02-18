import React, {Component} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import UnitCalendar from './UnitCalendar';
import {unitCalendarLesson} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';

const styles = {
  dialog: {
    textAlign: 'left',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  button: {
    float: 'right',
    marginTop: 30
  }
};

export default class UnitCalendarDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    lessons: PropTypes.arrayOf(unitCalendarLesson).isRequired,
    weeklyInstructionalMinutes: PropTypes.number.isRequired
  };

  render() {
    const {
      weeklyInstructionalMinutes,
      isOpen,
      handleClose,
      lessons
    } = this.props;
    return (
      <BaseDialog
        isOpen={isOpen}
        handleClose={handleClose}
        style={styles.dialog}
        useUpdatedStyles
        hideCloseButton
      >
        <h2>{i18n.weeklyLessonLayout()}</h2>
        <div>
          {i18n.weeklyLessonLayoutDescription({
            minutes: weeklyInstructionalMinutes
          })}
        </div>
        <UnitCalendar
          lessons={lessons}
          weeklyInstructionalMinutes={weeklyInstructionalMinutes}
        />
        <Button
          style={styles.button}
          text={i18n.closeDialog()}
          onClick={handleClose}
          color={Button.ButtonColor.orange}
        />
      </BaseDialog>
    );
  }
}
