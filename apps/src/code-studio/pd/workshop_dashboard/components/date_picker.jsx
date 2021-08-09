/**
 * DatePicker control.
 * It's basically a wrapper around react-datepicker (with limited props) that displays
 * as a React-Bootstrap select with a calendar icon Addon.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Radium from 'radium';
import ReactDatePicker from 'react-datepicker';
import {DATE_FORMAT} from '../workshopConstants';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {InputGroup, FormGroup, FormControl} from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';

class DateInputWithIconUnwrapped extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onClear: PropTypes.func,

    // These properties are set from ReactDatePicker, expected on the customInput.
    // Pass them through to the appropriate controls below.
    onChange: PropTypes.func,
    onClick: PropTypes.func,
    value: PropTypes.string,
    onBlur: PropTypes.func
  };

  // Called by ReactDatePicker to focus on the custom input.
  // Redirect to the underlying input control.
  focus = () => {
    if (this.inputControl) {
      this.inputControl.focus();
    }
  };

  handleClear = e => {
    e.stopPropagation();
    this.props.onClear();
  };

  render() {
    return (
      <InputGroup onClick={this.props.onClick}>
        <FormGroup>
          <FormControl
            type="text"
            value={this.props.value}
            onChange={this.props.onChange}
            style={this.props.disabled ? styles.readOnlyInput : null}
            disabled={this.props.disabled}
            onBlur={this.props.onBlur}
            ref={ref => (this.inputControl = ReactDOM.findDOMNode(ref))}
          />
          {!this.props.disabled && this.props.value && this.props.onClear && (
            <FormControl.Feedback>
              <span
                style={styles.clearElement}
                onClick={this.handleClear}
                title="Clear value"
              >
                &times;
              </span>
            </FormControl.Feedback>
          )}
        </FormGroup>
        {!this.props.disabled && (
          <InputGroup.Addon>{<FontAwesome icon="calendar" />}</InputGroup.Addon>
        )}
      </InputGroup>
    );
  }
}
const DateInputWithIcon = Radium(DateInputWithIconUnwrapped);

export default class DatePicker extends React.Component {
  static propTypes = {
    date: ReactDatePicker.propTypes.selected,
    onChange: PropTypes.func.isRequired,
    onBlur: ReactDatePicker.propTypes.onBlur,
    minDate: ReactDatePicker.propTypes.minDate,
    maxDate: ReactDatePicker.propTypes.maxDate,
    selectsStart: ReactDatePicker.propTypes.selectsStart,
    selectsEnd: ReactDatePicker.propTypes.selectsEnd,
    startDate: ReactDatePicker.propTypes.startDate,
    endDate: ReactDatePicker.propTypes.endDate,
    readOnly: ReactDatePicker.propTypes.disabled,
    clearable: PropTypes.bool
  };

  static defaultProps = {
    selectsStart: false,
    selectsEnd: false,
    startDate: null,
    endDate: null
  };

  handleChange = date => this.props.onChange(date);

  handleClear = () => this.props.onChange(null);

  render() {
    return (
      <ReactDatePicker
        customInput={
          <DateInputWithIcon
            disabled={this.props.readOnly}
            onClear={this.props.clearable && this.handleClear}
          />
        }
        selected={this.props.date}
        onChange={this.handleChange}
        onBlur={this.props.onBlur}
        dateFormat={DATE_FORMAT}
        minDate={this.props.minDate}
        maxDate={this.props.maxDate}
        selectsStart={this.props.selectsStart}
        selectsEnd={this.props.selectsEnd}
        startDate={this.props.startDate}
        endDate={this.props.endDate}
        disabled={this.props.readOnly}
      />
    );
  }
}

const styles = {
  readOnlyInput: {
    backgroundColor: 'inherit',
    cursor: 'default',
    border: 'none'
  },
  clearElement: {
    color: '#999',
    fontSize: '18px',
    zIndex: 10,
    cursor: 'pointer',
    pointerEvents: 'all',
    ':hover': {
      color: '#D0021B'
    }
  }
};
