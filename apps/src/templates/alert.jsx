/* global $ */
var colors = require('../sharedJsxStyles').colors;

/**
 * Simple boot-strapped style alert.
 */
var Alert = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired,
    type: React.PropTypes.oneOf("error", "warning").isRequired,
    onClose: React.PropTypes.func.isRequired,
    sideMargin: React.PropTypes.number,
  },

  render: function () {
    var styles = {
      main: {
        position: 'relative',
        zIndex: 1000,
        marginTop: 20,
        marginLeft: this.props.sideMargin || 50,
        marginRight: this.props.sideMargin || 50
      },
      typeSpecific: {
        error: {
          borderColor: colors.bootstrap.errorBorder,
          backgroundColor: colors.bootstrap.errorBackground,
          color: colors.bootstrap.errorText
        },
        warning: {
          borderColor: colors.bootstrap.warningBorder,
          backgroundColor: colors.bootstrap.warningBackground,
          color: 'black'
        },
      },
      child: {
        // from bootstrap's alert
        padding: '8px 35px 8px 14px',
        marginBottom: 20,
        textShadoow: '0 1px 0 rgba(255, 255, 255, 0.5)',
        border: '1px solid',
        borderRadius: 4,
      },
      closeButton: {
        margin: 0,
        // from bootstrap's close (note: we've lost :hover)
        padding: 0,
        cursor: 'pointer',
        background: 'transparent',
        border: 0,
        WebkitAppearance: 'none',
        float: 'right',
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: '20px',
        color: 'black',
        textShadow: '0 1px 0 white',
        opacity: 0.2,
        position: 'relative',
        top: -2,
        right: -21
      }
    };

    var childStyle = $.extend({}, styles.child, styles.typeSpecific[this.props.type]);

    return (
      <div style={styles.main}>
        <div style={childStyle}>
          <button style={styles.closeButton}>
            <span onClick={this.props.onClose}>&times;</span>
          </button>
          {this.props.children}
        </div>
      </div>
    );
  }
});

module.exports = Alert;
