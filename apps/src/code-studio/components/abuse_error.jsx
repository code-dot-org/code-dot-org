/* eslint-disable react/no-danger */
import React, {PropTypes} from 'react';

/**
 * A component containing some text/links for projects that have had abuse
 * reported. This is used in our blocking AbuseBox, in the share dialog, and
 * in our smaller alert in apps.
 */
export default class AbuseError extends React.Component {
  static propTypes = {
    i18n: PropTypes.shape({
      tos: PropTypes.string.isRequired,
      contact_us: PropTypes.string.isRequired
    }).isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    textStyle: PropTypes.object
  };

  render() {
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
}
