var React = require('react');

var BooleanPropertyRow = React.createClass({
  propTypes: {
    initialValue: React.PropTypes.bool.isRequired,
    handleChange: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      isChecked: this.props.initialValue
    };
  },

  handleChangeInternal: function(event) {
    var value = event.target.checked;
    this.props.handleChange(value);
    this.setState({isChecked: value});
  },

  render: function() {
    return (
      <tr>
        <td>{this.props.desc}</td>
        <td>
          <input
            type="checkbox"
            checked={this.state.isChecked}
            onChange={this.handleChangeInternal}/>
        </td>
      </tr>
    );
  }
});

module.exports = BooleanPropertyRow;
