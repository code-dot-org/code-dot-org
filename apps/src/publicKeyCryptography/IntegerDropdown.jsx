/** @file Dropdown with positive integer options, used in crypto widget */
import React from 'react';
import color from '../color';
import {LINE_HEIGHT} from './style';

const style = {
  root: {
    width: 100,
    height: Math.min(LINE_HEIGHT, 24),
    // lineHeight does not get the automatic 'px' suffix
    // see https://facebook.github.io/react/tips/style-props-value-px.html
    lineHeight: `${LINE_HEIGHT}px`,
    verticalAlign: 'middle',
    marginBottom: 0,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 4,
    color: color.charcoal,
    border: `1px solid ${color.lighter_gray}`,
    backgroundColor: color.white
  }
};

const IntegerDropdown = React.createClass({
  propTypes: {
    value: React.PropTypes.number,
    onChange: React.PropTypes.func.isRequired,
    options: React.PropTypes.arrayOf(React.PropTypes.number).isRequired
  },

  onChange(event) {
    const value = parseInt(event.target.value, 10);
    this.props.onChange(typeof value === 'number' && !isNaN(value) ? value : null);
  },

  render() {
    let {value, options} = this.props;
    if (typeof value !== 'number') {
      value = '';
    }
    return (
      <select style={style.root} value={value} onChange={this.onChange}>
        <option key="empty" value=""/>
        {options.map(n => <option key={n} value={n}>{n}</option>)}
      </select>);
  }
});
export default IntegerDropdown;
