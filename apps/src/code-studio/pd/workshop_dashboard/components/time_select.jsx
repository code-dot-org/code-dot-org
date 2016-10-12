/**
 * TimeSelect control.
 * Displays a text box with a clock icon. When clicked, it displays a popup
 * with a list of suggested times between a specified min and max at half hour
 * intervals. The text box can also be edited directly.
 */

import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import {
  FormControl,
  InputGroup,
  Dropdown,
  MenuItem
} from 'react-bootstrap';
import {TIME_FORMAT} from '../workshopConstants';

const styles = {
  dropdown: {
    width: '100%'
  },
  toggle: {
    padding: 0,
    border: 0,
    margin: 0,
    width: '100%'
  },
  menu: {
    height: 'auto',
    maxHeight: 300,
    overflowX: 'hidden',
    width: '100%'
  },
  input: {
    fontFamily: '"Gotham 4r"'
  },
  readOnlyInput: {
    backgroundColor: 'inherit',
    cursor: 'default',
    border: 'none'
  }
};

const INTERVAL = {minutes: 30};

const TimeSelect = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    value: React.PropTypes.string,
    readOnly: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
    minTime: React.PropTypes.object, // moment
    maxTime: React.PropTypes.object // moment
  },

  handleChange(e) {
    this.props.onChange(e.target.value);
  },

  handleBlur(e) {
    let time = moment(e.target.value, TIME_FORMAT);
    if (!time.isValid()) {
      // When time is not in the expected format, attempt to parse generically.
      time = moment(e.target.value);
    }
    // Normalize the format if it's a valid string.
    if (time.isValid() && time.format(TIME_FORMAT) !== e.target.value) {
      this.props.onChange(time.format(TIME_FORMAT));
    }
  },

  handleSelect(time) {
    this.props.onChange(time);
  },

  render() {
    const times = [];
    const minTime = moment(this.props.minTime, TIME_FORMAT);
    const maxTime = moment(this.props.maxTime, TIME_FORMAT);
    const intervalDuration = moment.duration(INTERVAL);

    // Show times every INTERVAL (i.e. 30 minutes) starting from the next full INTERVAL
    // on or after minTime and ending on or before maxTime.
    const startTime = moment(Math.ceil((+minTime)/(+intervalDuration)) * (+intervalDuration));
    const endTime = moment(Math.floor((+maxTime)/(+intervalDuration)) * (+intervalDuration));
    for (let time = startTime; time.isSameOrBefore(endTime); time = time.add(INTERVAL)) {
      times.push(time.format(TIME_FORMAT));
    }
    const menuItems = times.map((time, i) => {
      return (
        <MenuItem
          key={i}
          eventKey={time}
          active={time === this.props.value}
          onSelect={this.handleSelect}
        >
          {time}
        </MenuItem>
      );
    });

    return (
      <Dropdown
        id={this.props.id}
        disabled={!!this.props.readOnly}
        style={styles.dropdown}
      >
        <Dropdown.Toggle
          noCaret
          useAnchor={true}
          style={styles.toggle}
        >
          <InputGroup>
            <FormControl
              type="text"
              value={this.props.value || ''}
              placeholder="hh:mm"
              onChange={this.handleChange}
              onBlur={this.handleBlur}
              style={_.merge(styles.input, (this.props.readOnly && styles.readOnlyInput))}
              disabled={this.props.readOnly}
            />
            <InputGroup.Addon>
              {!this.props.readOnly && <i className="fa fa-clock-o" />}
            </InputGroup.Addon>
          </InputGroup>
        </Dropdown.Toggle>
        <Dropdown.Menu style={styles.menu}>
          {menuItems}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
});
export default TimeSelect;
