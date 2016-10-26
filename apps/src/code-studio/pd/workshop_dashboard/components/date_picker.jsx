/**
 * DatePicker control.
 * It's basically a wrapper around react-datepicker (with limited props) that displays
 * as a React-Bootstrap select with a calendar icon Addon.
 */

import React from 'react';
import ReactDatePicker from 'react-datepicker';
import {DATE_FORMAT} from '../workshopConstants';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  InputGroup,
  FormControl
} from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';

const DateInputWithIcon = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func,
    onClick: React.PropTypes.func,
    value: React.PropTypes.string
  },

  render() {
    return (
      <InputGroup onClick={this.props.onClick}>
        <FormControl
          type="text"
          value={this.props.value}
          onChange={this.props.onChange}
        />
        <InputGroup.Addon>
          {<FontAwesome icon="calendar" />}
        </InputGroup.Addon>
      </InputGroup>
    );
  }
});

const DatePicker = React.createClass({
  propTypes: {
    date: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    selectsStart: React.PropTypes.bool,
    selectsEnd: React.PropTypes.bool,
    startDate: React.PropTypes.object,
    endDate: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      selectsStart: false,
      selectsEnd: false,
      startDate: null,
      endDate: null
    };
  },

  handleChange(date) {
    this.props.onChange(date);
  },

  render() {
    return (
      <ReactDatePicker
        customInput={<DateInputWithIcon/>}
        selected={this.props.date}
        onChange={this.handleChange}
        dateFormat={DATE_FORMAT}
        selectsStart={this.props.selectsStart}
        selectsEnd={this.props.selectsEnd}
        startDate={this.props.startDate}
        endDate={this.props.endDate}
      />
    );
  }
});
export default DatePicker;
