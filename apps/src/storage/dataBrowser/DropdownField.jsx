import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import * as rowStyle from '@cdo/apps/applab/designElements/rowStyle';

class DropdownField extends React.Component {
  static propTypes = {
    displayName: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    disabledOptions: PropTypes.array,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  };

  render() {
    return (
      <div style={rowStyle.container}>
        <label style={rowStyle.description}>{this.props.displayName}</label>
        <select value={this.props.value} onChange={this.props.onChange}>
          <option value="">Select</option>
          {this.props.options.map(option => (
            <option
              key={option}
              disabled={
                this.props.disabledOptions &&
                this.props.disabledOptions.includes(option)
              }
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

export default Radium(DropdownField);
