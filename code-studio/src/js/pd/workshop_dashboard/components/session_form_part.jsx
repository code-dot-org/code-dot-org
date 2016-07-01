/*
  Individual Session input for creating and editing workshops.
  Sets date, startTime, and endTime for the session.
 */

import $ from 'jquery';
var React = require('react');
var ReactDOM = require('react-dom');
var moment = require('moment');
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;

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
    readOnly: React.PropTypes.bool
  },

  handleDateChange: function (e) {
    this.props.session.date = e.target.value;
    this.props.onChange(this.props.session);
  },
  handleStartTimeChange: function (e) {
    this.props.session.startTime = e.target.value;
    this.props.onChange(this.props.session);
  },
  handleEndTimeChange: function (e) {
    this.props.session.endTime = e.target.value;
    this.props.onChange(this.props.session);
  },
  handleRemoveClick: function (e) {
    this.props.onRemove();
  },
  handleAddClick: function (e) {
    this.props.onAdd();
  },

  renderAddButton: function () {
    if (this.props.onAdd && !this.props.readOnly) {
      return (
        <Button onClick={this.handleAddClick} >
          <i className="fa fa-plus" />
        </Button>
      );
    }
    return null;
  },
  renderRemoveButton: function () {
    if (this.props.onRemove && !this.props.readOnly) {
      return (
        <Button onClick={this.handleRemoveClick}>
          <i className="fa fa-minus"/>
        </Button>
      );
    }
    return null;
  },

  render: function () {
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
          <Input
            type="text"
            className="date-picker"
            value={this.props.session.date || ''}
            onChange={this.handleDateChange}
            addonAfter={!this.props.readOnly && <i className="fa fa-calendar" />}
            bsStyle={style.date}
            help={help.date}
            style={this.props.readOnly && styles.readOnlyInput}
            disabled={this.props.readOnly}
          />
        </Col>
        <Col sm={3}>
          <Input
            type="time"
            placeholder="hh:mm"
            value={this.props.session.startTime || ''}
            onChange={this.handleStartTimeChange}
            addonAfter={!this.props.readOnly && <i className="fa fa-clock-o" />}
            bsStyle={style.startTime}
            help={help.startTime}
            style={this.props.readOnly && styles.readOnlyInput}
            disabled={this.props.readOnly}
          />
        </Col>
        <Col sm={3}>
          <Input
            type="time"
            placeholder="hh:mm"
            value={this.props.session.endTime || ''}
            onChange={this.handleEndTimeChange}
            addonAfter={!this.props.readOnly && <i className="fa fa-clock-o" />}
            bsStyle={style.endTime}
            help={help.endTime}
            style={this.props.readOnly && styles.readOnlyInput}
            disabled={this.props.readOnly}
          />
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

  componentDidUpdate: function (prevProps) {
    if (prevProps.readOnly && !this.props.readOnly) {
      this.applyDatePicker();
    }
  },

  applyDatePicker: function () {
    // Add date picker to date input.
    var dateInput = $(ReactDOM.findDOMNode(this)).find('.date-picker');
    $(dateInput).datepicker({
      minDate: 0,
      dateFormat: 'mm/dd/y',
      onSelect: function (dateText) {
      this.props.session.date = dateText;
      this.props.onChange(this.props.session);
      }.bind(this)
    });

    // Show the date picker also when the calender icon to the right of the input is clicked.
    $(dateInput).next().on("click", function () {
      $(dateInput).datepicker("show");
    });
  }
});
module.exports = SessionFormPart;
