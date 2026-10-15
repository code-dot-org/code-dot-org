import PropTypes from 'prop-types';
import React from 'react';

import * as rowStyle from '@cdo/apps/applab/designElements/rowStyle';
import msg from '@cdo/locale';

class DropdownField extends React.Component {
  static propTypes = {
    displayName: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    disabledOptions: PropTypes.array,
    getDisplayNameForOption: PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    inlineLabel: PropTypes.bool,
  };

  render() {
    const labelStyle = {
      ...rowStyle.description,
      color: 'var(--text-neutral-primary)',
      ...(this.props.inlineLabel
        ? {float: 'left', marginTop: '5px', paddingRight: '5px'}
        : {}),
    };

    const containerStyle = {
      paddingLeft: this.props.inlineLabel ? 10 : 20,
      float: 'left',
      marginBottom: 8,
    };

    const selectStyle = {
      color: 'var(--text-neutral-primary)',
      borderColor: 'var(--borders-neutral-strong)',
    };

    return (
      <div style={containerStyle}>
        <label style={labelStyle}>{this.props.displayName}</label>
        <select
          value={this.props.value}
          onChange={this.props.onChange}
          style={selectStyle}
        >
          <option value="">{msg.select()}</option>
          {this.props.options.map(option => (
            <option
              key={option}
              disabled={
                this.props.disabledOptions &&
                this.props.disabledOptions.includes(option)
              }
              value={option}
            >
              {this.props.getDisplayNameForOption
                ? this.props.getDisplayNameForOption(option)
                : option}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

export default DropdownField;
