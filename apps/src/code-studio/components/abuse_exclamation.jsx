import React from 'react';
var AbuseError = require('./abuse_error');

/**
 * A big blue box with an exclamation mark on the left and our abuse text on
 * the right.
 */
export default React.createClass({
  propTypes: {
    i18n: React.PropTypes.shape({
      tos: React.PropTypes.string.isRequired,
      contact_us: React.PropTypes.string.isRequired,
      edit_project: React.PropTypes.string.isRequired,
      go_to_code_studio: React.PropTypes.string.isRequired
    }).isRequired,
    isOwner: React.PropTypes.bool.isRequired
  },
  render: function () {
    var cyan = '#0094ca';
    var style = {
      backgroundColor: cyan,
      color: 'white',
      maxWidth: 600,
      margin: '0 auto',
      marginTop: 20,
      borderRadius: 15
    };

    var circleStyle = {
      width: 100,
      height: 100,
      background: 'gold',
      borderRadius: 50,
      MozBorderRadius: 50,
      WebkitBorderRadius: 50,
      margin: 20,
      position: 'relative'
    };

    var exclamationStyle = {
      fontSize: 80,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };

    var bodyStyle = {
      paddingLeft: 0,
      paddingTop: 10,
      paddingBottom: 10,
      paddingRight: 20
    };

    var textStyle = {
      fontSize: 18,
      lineHeight: '24px',
      padding: 5
    };

    var finalLink, finalLinkText;
    if (this.props.isOwner) {
      finalLink = 'edit';
      finalLinkText = this.props.i18n.edit_project;
    } else {
      finalLink = 'https:/studio.code.org';
      finalLinkText = this.props.i18n.go_to_code_studio;
    }

    return (
      <table style={style}>
        <tr>
          <td>
            <div style={circleStyle}>
              <div style={exclamationStyle}>!</div>
            </div>
          </td>
          <td style={bodyStyle}>
            <AbuseError
                i18n={this.props.i18n}
                className="exclamation-abuse"
                textStyle={textStyle}/>
            <p className="exclamation-abuse" style={textStyle}>
              <a href={finalLink}>{finalLinkText}</a>
            </p>
          </td>
        </tr>
      </table>
    );
  }
});
