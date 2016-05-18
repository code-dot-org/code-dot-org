/* global React */

var FacilitatorsList = React.createClass({
  propTypes: {
    facilitators: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        name: React.PropTypes.string,
        email: React.PropTypes.string
      })
    ).isRequired
  },

  render: function () {
    var listItems = this.props.facilitators.map(function (facilitator, i) {
      return (
        <li key={i}>
          {facilitator.name} ({facilitator.email})
        </li>
      );
    });

    return (
      <ul>
        {listItems}
      </ul>
    );
  }
});
module.exports = FacilitatorsList;
