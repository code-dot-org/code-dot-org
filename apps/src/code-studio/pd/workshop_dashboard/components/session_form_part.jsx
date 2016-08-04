/**
 * Individual Session input for creating and editing workshops.
 * Sets date, startTime, and endTime for the session.
 */

import $ from 'jquery';
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

var styles = {
  readOnlyInput: {
    backgroundColor: 'inherit',
    cursor: 'default',
    border: 'none'
  }
};

var SessionFormPart = React.createClass({
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

  handleDateChange(e) {
    this.props.session.date = e.target.value;
    this.props.onChange(this.props.session);
  },
  handleStartTimeChange(e) {
    this.props.session.startTime = e.target.value;
    this.props.onChange(this.props.session);
  },
  handleEndTimeChange(e) {
    this.props.session.endTime = e.target.value;
    this.props.onChange(this.props.session);
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

  render() {
    var style = {};
    var help = {};
    if (this.props.shouldValidate) {
      if (!this.props.session.date) {
        style.date = "error";
        help.date = "Required.";
      } else if (!moment(this.props.session.date, 'MM/DD/YY').isValid()) {
        style.date = "error";
        help.date = "Must be a valid date in MM/DD/YY format.";
      }
      if (!this.props.session.startTime) {
        style.startTime = "error";
        help.startTime = "Required.";
      }
      if (!this.props.session.endTime) {
        style.endTime = "error";
        help.endTime = "Required.";
      } else if (this.props.session.endTime <= this.props.session.startTime) {
        style.endTime = "error";
        help.endTime = "Must end after it starts.";
      }
    }

    return (
      <Row>
        <Col sm={4}>
          <FormGroup validationState={style.date}>
            <InputGroup>
              <FormControl
                type="text"
                ref={(ref) => this.dateControl = ReactDOM.findDOMNode(ref)}
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
            <InputGroup>
              <FormControl
                type="time"
                placeholder="hh:mm"
                value={this.props.session.startTime || ''}
                onChange={this.handleStartTimeChange}
                style={this.props.readOnly && styles.readOnlyInput}
                disabled={this.props.readOnly}
              />
              <InputGroup.Addon>
                {!this.props.readOnly && <i className="fa fa-clock-o" />}
              </InputGroup.Addon>
            </InputGroup>
            <HelpBlock>{help.startTime}</HelpBlock>
          </FormGroup>
        </Col>
        <Col sm={3}>
          <FormGroup validationState={style.endTime}>
            <InputGroup>
              <FormControl
                type="time"
                placeholder="hh:mm"
                value={this.props.session.endTime || ''}
                onChange={this.handleEndTimeChange}
                style={this.props.readOnly && styles.readOnlyInput}
                disabled={this.props.readOnly}
              />
              <InputGroup.Addon>
                {!this.props.readOnly && <i className="fa fa-clock-o" />}
              </InputGroup.Addon>
            </InputGroup>
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
        dateFormat: 'mm/dd/y',
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
