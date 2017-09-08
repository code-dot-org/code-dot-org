/**
 * Individual Session input for creating and editing workshops.
 * Sets date, startTime, and endTime for the session.
 */

import _ from 'lodash';
import React, {PropTypes} from 'react';
import moment from 'moment';
import {
  Row,
  Col,
  Button,
  FormGroup,
  HelpBlock
} from 'react-bootstrap';
import TimeSelect from './time_select';
import DatePicker from './date_picker';
import {
  DATE_FORMAT,
  TIME_FORMAT
} from '../workshopConstants';

const MIN_TIME = moment('7:00am', TIME_FORMAT);
const MAX_TIME = moment('7:00pm', TIME_FORMAT);

export default class SessionFormPart extends React.Component {
  static propTypes = {
    session: PropTypes.shape({
      date: PropTypes.string,
      startTime: PropTypes.string,
      endTime: PropTypes.string
    }).isRequired,
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    shouldValidate: PropTypes.bool,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
  };

  handleDateChange = (date) => {
    // Don't allow null. If the date is cleared, default again to today.
    date = date || moment();
    this.handleChange('date', date.format(DATE_FORMAT));
  };
  handleStartTimeChange = (time) => {
    this.handleChange('startTime', time);
  };
  handleEndTimeChange = (time) => {
    this.handleChange('endTime', time);
  };
  handleChange = (fieldName, value) => {
    const updatedSession = _.set(
      _.cloneDeep(this.props.session),
      fieldName,
      value
    );

    this.props.onChange(updatedSession);
  };
  handleRemoveClick = () => {
    this.props.onRemove();
  };
  handleAddClick = () => {
    this.props.onAdd();
  };

  renderAddButton() {
    if (this.props.onAdd && !this.props.readOnly) {
      return (
        <Button onClick={this.handleAddClick} >
          <i className="fa fa-plus" />
        </Button>
      );
    }
    return null;
  }
  renderRemoveButton() {
    if (this.props.onRemove && !this.props.readOnly) {
      return (
        <Button onClick={this.handleRemoveClick}>
          <i className="fa fa-minus"/>
        </Button>
      );
    }
    return null;
  }

  // Return the time 1 minute before specified maxTime, bounded by MAX_TIME
  getBoundedMaxTime(maxTime) {
    const m = moment(maxTime, TIME_FORMAT);
    if (!m.isValid()) {
      return MAX_TIME;
    }
    return moment.min(MAX_TIME, m.subtract({minutes: 1}));
  }

  // Return the time 1 minute after specified minTime, bounded by MIN_TIME
  getBoundedMinTime(minTime) {
    const m = moment(minTime, TIME_FORMAT);
    if (!m.isValid()) {
      return MIN_TIME;
    }
    return moment.max(MIN_TIME, m.add({minutes: 1}));
  }

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
            <DatePicker
              date={date}
              minDate={moment()}
              onChange={this.handleDateChange}
              readOnly={this.props.readOnly}
            />
            <HelpBlock>{help.date}</HelpBlock>
          </FormGroup>
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
  }
}
