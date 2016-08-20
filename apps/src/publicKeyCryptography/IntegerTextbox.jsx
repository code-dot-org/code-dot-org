/** @file Textbox that only allows positive integer values, used in crypto widget */
import React from 'react';

const IntegerTextbox = React.createClass({
  propTypes: {
    value: React.PropTypes.number,
    disabled: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired
  },

  onChange(event) {
    const value = parseInt(event.target.value, 10);
    this.props.onChange(Number.isInteger(value) ? value : null);
  },

  render() {
    let {value, disabled} = this.props;
    if (!Number.isInteger(value)) {
      value = '';
    }
    return <input value={value} disabled={disabled} onChange={this.onChange}/>;
  }
});
export default IntegerTextbox;
