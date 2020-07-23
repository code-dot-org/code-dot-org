/** @file Dropdown with positive integer options, used in crypto widget */
import PropTypes from 'prop-types';
import React from 'react';
import loadable from '../util/loadable';
const VirtualizedSelect = loadable(() =>
  import('../templates/VirtualizedSelect')
);
import classNames from 'classnames';
import {LINE_HEIGHT} from './style';

export default class IntegerDropdown extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    value: PropTypes.number,
    options: PropTypes.arrayOf(PropTypes.number).isRequired,
    style: PropTypes.object,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired
  };

  onChange = selected => this.props.onChange(selected ? selected.value : null);

  render() {
    let {className, value, options, style, disabled} = this.props;
    options = options.map(n => ({label: String(n), value: n}));
    return (
      <VirtualizedSelect
        className={classNames('integer-dropdown', className)}
        clearable={false}
        optionHeight={LINE_HEIGHT}
        options={options}
        value={value}
        style={style}
        disabled={disabled}
        onChange={this.onChange}
      />
    );
  }
}
