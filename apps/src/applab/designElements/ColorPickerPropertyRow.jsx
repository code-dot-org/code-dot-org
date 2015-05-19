/* global $ */
var React = require('react');

var colorPicker = require('../colpick');

var PropertyRow = React.createClass({
  propTypes: {
    initialValue: React.PropTypes.string.isRequired,
    handleChange: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue
    };
  },

  // TODO :change foo
  componentDidMount: function () {
    $(this.getDOMNode().querySelector('button')).colpick({
      color: this.state.value,
    	layout: 'hex',
    	submit: 0,
      onChange: this.handleColorChange
    });
  },

  handleChangeInternal: function(event) {
    this.changeColor(event.target.value);
  },

  handleColorChange: function (hsbColor, hexColor) {
    this.changeColor('#' + hexColor);
  },

  changeColor: function (color) {
    this.props.handleChange(color);
    this.setState({value: color});
  },

  render: function() {
    return (
      <tr>
        <td>{this.props.desc}</td>
        <td>
          <input
            value={this.state.value}
            onChange={this.handleChangeInternal}/>
          <button>Pick Color</button>
        </td>
      </tr>
    );
  }
});

module.exports = PropertyRow;
