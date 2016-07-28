/* eslint-disable react/no-danger */
import React from 'react';

/**
 * A component containing some text/links for projects that have had abuse
 * reported. This is used in our blocking AbuseBox, in the share dialog, and
 * in our smaller alert in apps.
 */
var AbuseError = React.createClass({
  propTypes: {
    i18n: React.PropTypes.shape({
      tos: React.PropTypes.string.isRequired,
      contact_us: React.PropTypes.string.isRequired
    }).isRequired,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    textStyle: React.PropTypes.object
  },
  render: function () {
    // It's only OK to use dangerouslySetInnerHTML as long as we're not
    // populating it with user input. In our case, we're setting it using
    // our i18n strings
    return (
      <div className={this.props.className} style={this.props.style}>
        <p
          style={this.props.textStyle}
          dangerouslySetInnerHTML={{__html: this.props.i18n.tos}}
        >
        </p>
        <p
          style={this.props.textStyle}
          dangerouslySetInnerHTML={{__html: this.props.i18n.contact_us}}
        >
        </p>
      </div>
    );
  }
});
module.exports = AbuseError;

// AbuseError is placed on the dashboard namespace so that it can be accessed
// by apps
window.dashboard = window.dashboard || {};
window.dashboard.AbuseError = AbuseError;
