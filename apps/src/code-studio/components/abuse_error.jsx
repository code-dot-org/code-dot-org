/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';

/**
 * A component containing some text/links for projects that have had abuse
 * reported. This is used in our blocking AbuseBox, in the share dialog, and
 * in our smaller alert in apps.
 */
var AbuseError = createReactClass({
  propTypes: {
    i18n: PropTypes.shape({
      tos: PropTypes.string.isRequired,
      contact_us: PropTypes.string.isRequired
    }).isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    textStyle: PropTypes.object
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
