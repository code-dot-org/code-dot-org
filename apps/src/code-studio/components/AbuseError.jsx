/* eslint-disable react/no-danger */
import PropTypes from 'prop-types';
import React from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import msg from '@cdo/locale';

/**
 * A component containing some text/links for projects that have had abuse
 * reported. This is used in our blocking AbuseBox, in the share dialog, and
 * in our smaller alert in apps.
 */
export default class AbuseError extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    textStyle: PropTypes.object
  };

  render() {
    return (
      <div className={this.props.className} style={this.props.style}>
        <div>
          <SafeMarkdown markdown={msg.tosLong({url: 'http://code.org/tos'})} />
        </div>
        <div>
          <SafeMarkdown
            markdown={msg.contactUs({url: 'https://code.org/contact'})}
          />
        </div>
      </div>
    );
  }
}
