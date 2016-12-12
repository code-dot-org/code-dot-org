/**
 * DatePicker control.
 * It's basically a wrapper around react-datepicker (with limited props) that displays
 * as a React-Bootstrap select with a calendar icon Addon.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactDatePicker from 'react-datepicker';
import {DATE_FORMAT} from '../workshopConstants';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import moment from 'moment';
import {
  InputGroup,
  FormControl
} from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';

const styles = {
  readOnlyInput: {
    backgroundColor: 'inherit',
    cursor: 'default',
    border: 'none'
  }
};

const DateInputWithIcon = React.createClass({
  propTypes: {
    disabled: React.PropTypes.bool,

    // These properties are set from ReactDatePicker, expected on the customInput.
    // Pass them through to the appropriate controls below.
    onChange: React.PropTypes.func,
    onClick: React.PropTypes.func,
    value: React.PropTypes.string,
    onBlur: React.PropTypes.func
  },

  // Called by ReactDatePicker to focus on the custom input.
  // Redirect to the underlying input control.
  focus() {
    if (this.inputControl) {
      this.inputControl.focus();
    }
  },

  render() {
    return (
      <InputGroup onClick={this.props.onClick}>
        <FormControl
          type="text"
          value={this.props.value}
          onChange={this.props.onChange}
          style={this.props.disabled ? styles.readOnlyInput : null}
          disabled={this.props.disabled}
          onBlur={this.props.onBlur}
          ref={ref => this.inputControl = ReactDOM.findDOMNode(ref)}
        />
        {!this.props.disabled && (
          <InputGroup.Addon>
            {<FontAwesome icon="calendar"/>}
          </InputGroup.Addon>
        )}
      </InputGroup>
    );
  }
});

const DatePicker = React.createClass({
  propTypes: {
    date: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    minDate: React.PropTypes.object,
    maxDate: React.PropTypes.object,
    selectsStart: React.PropTypes.bool,
    selectsEnd: React.PropTypes.bool,
    startDate: React.PropTypes.object,
    endDate: React.PropTypes.object,
    readOnly: React.PropTypes.bool
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
        customInput={
          <DateInputWithIcon
            disabled={this.props.readOnly}
          />
        }
        selected={this.props.date}
        onChange={this.handleChange}
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
});
export default DatePicker;

if (BUILD_STYLEGUIDE) {
  DatePicker.styleGuideExamples = storybook => {
    return storybook
    .storiesOf('DatePicker', module)
    .add(
      'Basic',
      // Currently the Bootstrap 3 styles required by React-Bootstrap are only applied inside div#workshop-container.
      // This is to prevent conflicts with other parts of Code Studio using Bootstrap 2.
      // See pd.scss. Without this container div it won't render properly.
      () => <div id="workshop-container">
        <DatePicker
          date={moment()}
          onChange={storybook.action('changed')}
        />
      </div>
    );
  };
}
