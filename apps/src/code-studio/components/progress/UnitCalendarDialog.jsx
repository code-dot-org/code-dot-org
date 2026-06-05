import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import Modal from '@code-dot-org/component-library/modal';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {unitCalendarLesson} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';
import i18n from '@cdo/locale';

import UnitCalendarGrid from './UnitCalendarGrid';

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

  generateDropdownItems = () => {
    const current = this.props.weeklyInstructionalMinutes;
    const options = WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS.includes(current)
      ? [...WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS]
      : [...WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS, current];
    options.sort((a, b) => a - b);
    return options.map(val => ({
      value: String(val),
      text: i18n.minutesLabel({number: val}),
    }));
  };

  changeMinutes = e => {
    const newTime = e.target.value;
    this.setState({instructionalMinutes: Number(newTime)});
  };

  render() {
    const {isOpen, handleClose, lessons} = this.props;
    if (!isOpen) {
      return null;
    }
    return (
      <Modal
        onClose={handleClose}
        title={i18n.weeklyLessonLayout()}
        customContent={
          <>
            <div
              id="dsco-dialog-description"
              style={styles.minutesPerWeekWrapper}
            >
              <SimpleDropdown
                name="instructionalMinutes"
                labelText={i18n.instructionalMinutesPerWeek()}
                selectedValue={String(this.state.instructionalMinutes)}
                onChange={this.changeMinutes}
                items={this.generateDropdownItems()}
                size="s"
              />
            </div>
            <UnitCalendarGrid
              lessons={lessons}
              weeklyInstructionalMinutes={this.state.instructionalMinutes}
              weekWidth={WEEK_WIDTH}
            />
          </>
        }
        primaryButtonProps={{
          onClick: handleClose,
          children: i18n.closeDialog(),
        }}
      />
    );
  }
}

const styles = {
  minutesPerWeekWrapper: {
    marginInline: '5px',
  },
};
