/* global React */

var moment = require('moment');

var SessionTime = React.createClass({
  propTypes: {
    session: React.PropTypes.shape({
      start: React.PropTypes.string.isRequired,
      end: React.PropTypes.string.isRequired
    }).isRequired
  },

  render: function () {
    var formattedTime = moment.utc(this.props.session.start).format('MM/DD/YY, h:mmA') +
      '-' + moment.utc(this.props.session.end).format('h:mmA');

    return <div>{formattedTime}</div>;
  }
});
module.exports = SessionTime;
