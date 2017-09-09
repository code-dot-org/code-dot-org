/** @file Textbox that only allows positive integer values, used in crypto widget */
import React, {PropTypes} from 'react';
import color from "../util/color";

export default class IntegerTextbox extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    value: PropTypes.number,
    disabled: PropTypes.bool,
    color: PropTypes.string,
    onChange: PropTypes.func.isRequired
  };

  onChange = (event) => {
    const value = parseInt(event.target.value, 10);
    this.props.onChange(Number.isInteger(value) ? value : null);
  };

  render() {
    let {className, value, disabled, color: backgroundColor} = this.props;
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
        className={className}
        style={style}
        value={value}
        disabled={disabled}
        onChange={this.onChange}
      />);
  }
}
