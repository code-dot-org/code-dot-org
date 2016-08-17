/** @file Dropdown with positive integer options, used in crypto widget */
import React from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import color from '../color';
import {LINE_HEIGHT} from './style';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';

const IntegerDropdown = React.createClass({
  propTypes: {
    value: React.PropTypes.number,
    onChange: React.PropTypes.func.isRequired,
    options: React.PropTypes.arrayOf(React.PropTypes.number).isRequired
  },

  onChange(selected) {
    this.props.onChange(selected ? selected.value : null);
  },

  render() {
    let {value, options} = this.props;
    options = options.map(n => ({label: String(n), value: n}));
    return (
      <VirtualizedSelect
        className="integer-dropdown"
        optionHeight={LINE_HEIGHT}
        options={options}
        value={value}
        onChange={this.onChange}
      />);
  }
});
export default IntegerDropdown;
