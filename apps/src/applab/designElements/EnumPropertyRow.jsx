import React, {PropTypes} from 'react';
import * as rowStyle from './rowStyle';

var EnumPropertyRow = React.createClass({
  propTypes: {
    initialValue: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleChange: PropTypes.func.isRequired,
    desc: PropTypes.node,
  },

  getInitialState: function () {
    return {
      selectedValue: this.props.initialValue
    };
  },

  handleChange: function (event) {
    this.props.handleChange(event.target.value);
    this.setState({selectedValue: event.target.value});
  },

  render: function () {
    let options = this.props.options.map(function (option, index) {
        return <option key={index} value={option}>{option}</option>;
    });
    return (
      <div style={rowStyle.container}>
        <div style={rowStyle.description}>{this.props.desc}</div>
        <select
          className="form-control"
          value={this.state.selectedValue}
          onChange={this.handleChange}
        >
          {options}
        </select>
      </div>
    );
  }
});

export default EnumPropertyRow;
