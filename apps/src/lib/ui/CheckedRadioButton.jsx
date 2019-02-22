import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './checkedRadioButton.css';

export class CheckRadioButton extends Component {
  static propTypes = {
    id: PropTypes.string,
    disabledMode: PropTypes.bool,
    checked: PropTypes.bool.isRequired,
    value: PropTypes.string.isRequired,
    onRadioButtonChange: PropTypes.func.isRequired
  };

  handleChange = event => {
    console.log('CheckedRadioButton:' + event.target.value);
    this.props.onRadioButtonChange(event.target.value);
  };

  render() {
    return (
      <div>
        <input
          type={'radio'}
          className="with-font"
          id={this.props.id}
          value={this.props.value}
          checked={this.props.checked}
          onChange={this.handleChange}
          disabled={this.props.disabledMode}
        />
        <label htmlFor={this.props.id} />
      </div>
    );
  }
}
