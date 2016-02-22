/** @file Button that opens the data browser */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
/* global $ */

var applabMsg = require('./locale');
var styles = require('./PlaySpaceHeaderStyles');

/**
 * The button above the visualization that opens the data browser.
 * @type {function}
 */
var ViewDataButton = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func.isRequired
  },

  render: function () {

    var showDataButtonStyle = $.extend(
        {
          float: 'right',
          textAlign: 'left',
          maxWidth: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        },
        styles.buttonStyle,
        styles.inactiveStyle
    );

    return (
        <button
            id='viewDataButton'
            style={showDataButtonStyle}
            className='no-outline'
            onClick={this.props.onClick}>
          <i className='fa fa-database' style={styles.iconStyle}></i>
          {applabMsg.viewData()}
        </button>
    );
  }
});
module.exports = ViewDataButton;
