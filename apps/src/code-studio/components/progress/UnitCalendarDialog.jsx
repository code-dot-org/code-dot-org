import PropTypes from 'prop-types';
import React, {Component} from 'react';

import firehoseClient from '@cdo/apps/lib/util/firehose';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import {unitCalendarLesson} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';
import i18n from '@cdo/locale';

import UnitCalendar from './UnitCalendar';

const WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS = [
  45, 90, 135, 180, 225, 270, 315, 360, 405, 450,
];
export const WEEK_WIDTH = 585;

export default class UnitCalendarDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    lessons: PropTypes.arrayOf(unitCalendarLesson).isRequired,
    weeklyInstructionalMinutes: PropTypes.number.isRequired,
    scriptId: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      instructionalMinutes: this.props.weeklyInstructionalMinutes,
    };
  }

  generateDropdownOptions = () => {
    let options = WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS;
    if (!options.includes(this.props.weeklyInstructionalMinutes)) {
      options.push(this.props.weeklyInstructionalMinutes);
    }
    options.sort((a, b) => a - b);
    return options.map(val => (
      <option value={parseInt(val)} key={`minutes-${val}`}>
        {i18n.minutesLabel({number: val})}
      </option>
    ));
  };

  logMinutesChange = (originalTime, newTime) => {
    const record = {
      study: 'script_overview_actions',
      study_group: 'unit_calendar',
      event: 'update_instructional_minutes',
      data_json: JSON.stringify({
        original_time: originalTime,
        new_time: newTime,
        script_id: this.props.scriptId,
      }),
    };
    firehoseClient.putRecord(record, {includeUserId: true});
  };

  changeMinutes = e => {
    const newTime = e.target.value;
    this.logMinutesChange(this.state.instructionalMinutes, newTime);
    this.setState({instructionalMinutes: Number(newTime)});
  };

  render() {
    const {isOpen, handleClose, lessons} = this.props;
    return (
      <BaseDialog
        isOpen={isOpen}
        handleClose={handleClose}
        style={styles.dialog}
        useUpdatedStyles
        hideCloseButton
      >
        <h2>{i18n.weeklyLessonLayout()}</h2>
        <div style={styles.minutesPerWeekWrapper}>
          <div style={styles.minutesPerWeekDescription}>
            {i18n.instructionalMinutesPerWeek()}
          </div>
          <select
            onChange={e => this.changeMinutes(e)}
            value={this.state.instructionalMinutes}
            style={styles.dropdown}
          >
            {this.generateDropdownOptions()}
          </select>
        </div>
        <UnitCalendar
          lessons={lessons}
          weeklyInstructionalMinutes={this.state.instructionalMinutes}
          weekWidth={WEEK_WIDTH}
        />
        <Button
          style={styles.button}
          text={i18n.closeDialog()}
          onClick={handleClose}
          color={Button.ButtonColor.brandSecondaryDefault}
        />
      </BaseDialog>
    );
  }
}

const styles = {
  dialog: {
    textAlign: 'left',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  button: {
    float: 'right',
    marginTop: 30,
  },
  dropdown: {
    width: 'fit-content',
    marginBottom: 0,
  },
  minutesPerWeekWrapper: {
    display: 'flex',
    marginBottom: 10,
    alignItems: 'center',
  },
  minutesPerWeekDescription: {
    fontWeight: 'bold',
    marginRight: 10,
  },
};
