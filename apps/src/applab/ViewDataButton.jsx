/** @file Button that opens the data browser */
/* global $ */

var applabMsg = require('./locale');
var styles = require('../templates/ToggleButtonStyles');

/**
 * The button above the visualization that opens the data browser.
 * @type {function}
 */
var ViewDataButton = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func.isRequired
  },

  render: function () {
    var showDataButtonStyle = $.extend({},
      styles.buttonStyle,
      styles.inactiveStyle,
      {
        float: 'right',
        textAlign: 'left',
        maxWidth: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    );

    return (
      <button
          id='viewDataButton'
          style={showDataButtonStyle}
          className='no-outline'
          onClick={this.props.onClick}>
        <i className='fa fa-database' style={styles.iconStyle} />
        {applabMsg.viewData()}
      </button>
    );
  }
});
module.exports = ViewDataButton;
