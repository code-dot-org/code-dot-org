import React, {PropTypes} from 'react';
import * as rowStyle from './rowStyle';

export default class EnumPropertyRow extends React.Component {
  static propTypes = {
    initialValue: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleChange: PropTypes.func.isRequired,
    desc: PropTypes.node,
  };

  state = {
    selectedValue: this.props.initialValue
  };

  handleChange = (event) => {
    this.props.handleChange(event.target.value);
    this.setState({selectedValue: event.target.value});
  };

  render() {
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
}
