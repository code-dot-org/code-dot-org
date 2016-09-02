/** @file Textbox that only allows positive integer values, used in crypto widget */
import React from 'react';
import color from '../color';

const IntegerTextbox = React.createClass({
  propTypes: {
    value: React.PropTypes.number,
    disabled: React.PropTypes.bool,
    color: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired
  },

  onChange(event) {
    const value = parseInt(event.target.value, 10);
    this.props.onChange(Number.isInteger(value) ? value : null);
  },

  render() {
    let {value, disabled, color: backgroundColor} = this.props;
    if (!Number.isInteger(value)) {
      value = '';
    }

    const style = {
      width: 75,
      paddingLeft: 8,
      margin: '0 5px',
      backgroundColor: backgroundColor || 'white',
      borderColor: color.light_gray,
      borderStyle: 'solid',
      borderWidth: 1
    };

    return (
      <input
        style={style}
        value={value}
        disabled={disabled}
        onChange={this.onChange}
      />);
  }
});
export default IntegerTextbox;
