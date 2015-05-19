var React = require('react');

module.exports = React.createClass({
  propTypes: {
    name: React.PropTypes.instanceOf(String).isRequired
  },

  render: function () {
    return (
      <tr>
        <td>{this.props.name}</td>
      </tr>
    );
  }
});
