var React = require('react');

var PropertyRow = React.createClass({
  propTypes: {
    initialValue: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]).isRequired,
    isNumber: React.PropTypes.bool,
    isMultiLine: React.PropTypes.bool,
    handleChange: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue
    };
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({value: newProps.initialValue});
  },

  handleChangeInternal: function(event) {
    var value = event.target.value;
    this.props.handleChange(value);
    this.setState({value: value});
  },

  render: function() {
    var inputElement;
    if (this.props.isMultiLine) {
      inputElement = <textarea
        value={this.state.value}
        onChange={this.handleChangeInternal}/>;
    } else {
      inputElement = <input
        type={this.props.isNumber ? 'number' : undefined}
        value={this.state.value}
        onChange={this.handleChangeInternal}/>;
    }


    return (
      <tr>
        <td>{this.props.desc}</td>
        <td>
          {inputElement}
        </td>
      </tr>
    );
  }
});

module.exports = PropertyRow;
