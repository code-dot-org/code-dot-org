import PropTypes from 'prop-types';
import React, {Component} from 'react';
import './checkedRadioButton.css';

export class CheckedRadioButton extends Component {
  static propTypes = {
    id: PropTypes.string,
    disabledMode: PropTypes.bool,
    checked: PropTypes.bool.isRequired,
    value: PropTypes.string.isRequired,
    // onRadioButtonChange is required if disabledMode=false
    onRadioButtonChange: PropTypes.func,
  };

  handleChange = event => {
    this.props.onRadioButtonChange(event.target.value);
  };

  render() {
    return (
      <div>
        <input
          type="radio"
          className="with-font"
          id={this.props.id}
          value={this.props.value}
          checked={this.props.checked}
          onChange={this.handleChange}
          disabled={this.props.disabledMode}
        />
        <label
          htmlFor={this.props.id}
          className="hidden-label-checked-radio-button"
        />
      </div>
    );
  }
}
