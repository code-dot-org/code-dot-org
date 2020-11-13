import PropTypes from 'prop-types';
import React from 'react';
import * as rowStyle from './rowStyle';

export default class EnumPropertyRow extends React.Component {
  static propTypes = {
    initialValue: PropTypes.string.isRequired,
    displayOptions: PropTypes.arrayOf(PropTypes.string),
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleChange: PropTypes.func.isRequired,
    desc: PropTypes.node,
    containerStyle: PropTypes.object
  };

  state = {
    selectedValue: this.props.initialValue
  };

  handleChange = event => {
    this.props.handleChange(event.target.value);
    this.setState({selectedValue: event.target.value});
  };

  render() {
    const {options, displayOptions = [], desc} = this.props;
    const {selectedValue} = this.state;

    const renderedOptions = options.map(function(option, index) {
      return (
        <option key={index} value={option}>
          {displayOptions[index] || option}
        </option>
      );
    });
    return (
      <div style={this.props.containerStyle || rowStyle.container}>
        <div style={rowStyle.description}>{desc}</div>
        <select
          className="form-control"
          style={rowStyle.enumInput}
          value={selectedValue}
          onChange={this.handleChange}
        >
          {renderedOptions}
        </select>
      </div>
    );
  }
}
