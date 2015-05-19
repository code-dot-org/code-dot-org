var React = require('react');

var PropertyRow = React.createClass({
  propTypes: {
    initialValue: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]).isRequired,
    handleChange: React.PropTypes.func
  },

  handleChangeInternal: function(event) {
    var value = event.target.value;
    this.props.handleChange(value);
  },
  render: function() {
    return (
      <tr>
        <td>{this.props.desc}</td>
        <td>
          <input
            defaultValue={this.props.initialValue}
            onChange={this.handleChangeInternal}/>
        </td>
      </tr>
    );
  }
});

module.exports = PropertyRow;
