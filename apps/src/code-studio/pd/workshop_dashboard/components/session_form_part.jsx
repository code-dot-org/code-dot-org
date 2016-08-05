/**
 * Individual Session input for creating and editing workshops.
 * Sets date, startTime, and endTime for the session.
 */

import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import {
  Row,
  Col,
  Button,
  FormGroup,
  FormControl,
  InputGroup,
  HelpBlock
} from 'react-bootstrap';
import TimeSelect from './time_select';
import {
  DATE_FORMAT,
  TIME_FORMAT,
  DATEPICKER_FORMAT
} from '../workshopConstants';

const MIN_TIME = moment('7:00am', TIME_FORMAT);
const MAX_TIME = moment('7:00pm', TIME_FORMAT);

const styles = {
  readOnlyInput: {
    backgroundColor: 'inherit',
    cursor: 'default',
    border: 'none'
  }
};

const SessionFormPart = React.createClass({
  propTypes: {
    session: React.PropTypes.shape({
      date: React.PropTypes.string,
      startTime: React.PropTypes.string,
      endTime: React.PropTypes.string
    }).isRequired,
    onAdd: React.PropTypes.func,
    onRemove: React.PropTypes.func,
    shouldValidate: React.PropTypes.bool,
    readOnly: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
  },

  handleDateChange(event) {
    this.handleChange('date', event.target.value);
  },
  handleStartTimeChange(time) {
    this.handleChange('startTime', time);
  },
  handleEndTimeChange(time) {
    this.handleChange('endTime', time);
  },
  handleChange(fieldName, value) {
    const updatedSession = _.set(
      _.cloneDeep(this.props.session),
      fieldName,
      value
    );

    this.props.onChange(updatedSession);
  },
  handleRemoveClick() {
    this.props.onRemove();
  },
  handleAddClick() {
    this.props.onAdd();
  },

  renderAddButton() {
    if (this.props.onAdd && !this.props.readOnly) {
      return (
        <Button onClick={this.handleAddClick} >
          <i className="fa fa-plus" />
        </Button>
      );
    }
    return null;
  },
  renderRemoveButton() {
    if (this.props.onRemove && !this.props.readOnly) {
      return (
        <Button onClick={this.handleRemoveClick}>
          <i className="fa fa-minus"/>
        </Button>
      );
    }
    return null;
  },

  // Return the time 1 minute before specified maxTime, bounded by MAX_TIME
  getBoundedMaxTime(maxTime) {
    const m = moment(maxTime, TIME_FORMAT);
    if (!m.isValid()) {
      return MAX_TIME;
    }
    return moment.min(MAX_TIME, m.subtract({minutes: 1}));
  },

  // Return the time 1 minute after specified minTime, bounded by MIN_TIME
  getBoundedMinTime(minTime) {
    const m = moment(minTime, TIME_FORMAT);
    if (!m.isValid()) {
      return MIN_TIME;
    }
    return moment.max(MIN_TIME, m.add({minutes: 1}));
  },

  render() {
    const style = {};
    const help = {};
    const date = moment(this.props.session.date, DATE_FORMAT);
    if (this.props.shouldValidate) {
      if (!this.props.session.date) {
        style.date = "error";
        help.date = "Required.";
      } else if (!date.isValid()) {
        style.date = "error";
        help.date = `Must be a valid date in ${DATE_FORMAT} format.`;
      }
    }

    // Start and end times have default values and should always be validated.
    const startTime = moment(this.props.session.startTime, TIME_FORMAT);
    const endTime = moment(this.props.session.endTime, TIME_FORMAT);
    if (!this.props.session.startTime) {
      style.startTime = "error";
      help.startTime = "Required.";
    } else if (!startTime.isValid()) {
      style.startTime = "error";
      help.startTime = "Invalid format.";
    }
    if (!this.props.session.endTime) {
      style.endTime = "error";
      help.endTime = "Required.";
    } else if (!endTime.isValid()) {
      style.endTime = "error";
      help.endTime = "Invalid format.";
    }
    if (startTime.isValid() && endTime.isValid() && !endTime.isAfter(startTime)) {
      style.endTime = "error";
      help.endTime = "Must end after it starts.";
    }

    return (
      <Row>
        <Col sm={4}>
          <FormGroup validationState={style.date}>
            <InputGroup>
              <FormControl
                type="text"
                ref={ref => this.dateControl = ReactDOM.findDOMNode(ref)}
                value={this.props.session.date || ''}
                onChange={this.handleDateChange}
                style={this.props.readOnly && styles.readOnlyInput}
                disabled={this.props.readOnly}
              />
              <InputGroup.Addon>
                {!this.props.readOnly && <i className="fa fa-calendar" />}
              </InputGroup.Addon>
            </InputGroup>
          </FormGroup>
          <HelpBlock>{help.date}</HelpBlock>
        </Col>
        <Col sm={3}>
          <FormGroup validationState={style.startTime}>
            <TimeSelect
              id="startTime-select"
              onChange={this.handleStartTimeChange}
              value={this.props.session.startTime}
              readOnly={this.props.readOnly}
              minTime={MIN_TIME}
              maxTime={this.getBoundedMaxTime(this.props.session.endTime)}
            />
            <HelpBlock>{help.startTime}</HelpBlock>
          </FormGroup>
        </Col>
        <Col sm={3}>
          <FormGroup validationState={style.endTime}>
            <TimeSelect
              id="endTime-select"
              onChange={this.handleEndTimeChange}
              value={this.props.session.endTime}
              readOnly={this.props.readOnly}
              minTime={this.getBoundedMinTime(this.props.session.startTime)}
              maxTime={MAX_TIME}
            />
            <HelpBlock>{help.endTime}</HelpBlock>
          </FormGroup>
        </Col>
        <Col sm={2}>
          {this.renderAddButton()}
          {this.renderRemoveButton()}
        </Col>
      </Row>
    );
  },

  componentDidMount: function () {
    if (this.props.readOnly) {
      return;
    }

    this.applyDatePicker();
  },

  componentDidUpdate(prevProps) {
    if (prevProps.readOnly && !this.props.readOnly) {
      this.applyDatePicker();
    }
  },

  applyDatePicker() {
    // Add date picker to date input.
    if (this.dateControl) {
      $(this.dateControl).datepicker({
        minDate: 0,
        dateFormat: DATEPICKER_FORMAT,
        onSelect: (dateText) => {
          this.props.session.date = dateText;
          this.props.onChange(this.props.session);
        }
      });

      // Show the date picker also when the calender icon to the right of the input is clicked.
      $(this.dateControl).next().on("click", () => {
        $(this.dateControl).datepicker("show");
      });
    }
  }
});
export default SessionFormPart;
