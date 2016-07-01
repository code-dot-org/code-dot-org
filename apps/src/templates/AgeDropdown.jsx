var React = require('react');

/**
 * A dropdown with the set of ages we use across our site (4-20, 21+)
 * NOTE: this is pretty similarly to a component in dashboard's
 * report_abuse_form.jsx. In an ideal world, we would have a better way of
 * sharing components between dashboard/apps and have any difference between
 * the two version controlled by props.
 */
module.exports = React.createClass({
  propTypes: {
    style: React.PropTypes.object
  },

  render: function () {
    var ages = ['', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14',
      '15', '16', '17', '18', '19', '20', '21+'];

    return (
      <select name="age" style={this.props.style}>{
        ages.map(function (age) {
          return <option key={age} value={age}>{age}</option>;
        })
      }</select>
    );
  }
});
