/**
 * TimeSelect control.
 * Displays a text box with a clock icon. When clicked, it displays a popup
 * with a list of suggested times between a specified min and max at half hour
 * intervals. The text box can also be edited directly.
 */

import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import {FormControl, InputGroup} from 'react-bootstrap';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {TIME_FORMAT} from '../workshopConstants';

const styles = {
  input: {
    fontFamily: '"Gotham 4r"'
  },
  readOnlyInput: {
    fontFamily: '"Gotham 4r"',
    backgroundColor: 'inherit',
    cursor: 'default',
    border: 'none'
  }
};

export default class TimeSelect extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func.isRequired
  };

  handleChange = e => {
    this.props.onChange(e.target.value);
  };

  handleBlur = e => {
    let time = moment(e.target.value, TIME_FORMAT);
    if (!time.isValid()) {
      // When time is not in the expected format, attempt to parse generically.
      time = moment(e.target.value);
    }
    // Normalize the format if it's a valid string.
    if (time.isValid() && time.format(TIME_FORMAT) !== e.target.value) {
      this.props.onChange(time.format(TIME_FORMAT));
    }
  };

  render() {
    return (
      <InputGroup>
        <FormControl
          type="text"
          value={this.props.value || ''}
          placeholder="hh:mm"
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          style={this.props.readOnly ? styles.readOnlyInput : styles.input}
          disabled={this.props.readOnly}
        />
        {!this.props.readOnly && (
          <InputGroup.Addon>
            <FontAwesome icon="clock-o" />
          </InputGroup.Addon>
        )}
      </InputGroup>
    );
  }
}
