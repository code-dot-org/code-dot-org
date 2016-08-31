/** @file Dropdown with positive integer options, used in crypto widget */
import React from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import {LINE_HEIGHT} from './style';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';

const IntegerDropdown = React.createClass({
  propTypes: {
    value: React.PropTypes.number,
    options: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
    style: React.PropTypes.object,
    disabled: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired
  },

  onChange(selected) {
    this.props.onChange(selected ? selected.value : null);
  },

  render() {
    let {value, options, style, disabled} = this.props;
    options = options.map(n => ({label: String(n), value: n}));
    return (
      <VirtualizedSelect
        className="integer-dropdown"
        clearable={false}
        optionHeight={LINE_HEIGHT}
        options={options}
        value={value}
        style={style}
        disabled={disabled}
        onChange={this.onChange}
      />);
  }
});
export default IntegerDropdown;
