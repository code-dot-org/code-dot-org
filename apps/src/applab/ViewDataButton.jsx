/** @file Button that opens the data browser */
var React = require('react');
var applabMsg = require('./locale');
var styles = require('../templates/ToggleButtonStyles');
var FontAwesome = require('../templates/FontAwesome');

/**
 * The button above the visualization that opens the data browser.
 * @type {function}
 */
var ViewDataButton = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func.isRequired
  },

  render: function () {
    var showDataButtonStyle = Object.assign({},
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
          id="viewDataButton"
          style={showDataButtonStyle}
          className="no-outline"
          onClick={this.props.onClick}>
        <FontAwesome icon="database" style={styles.iconStyle} />
        {applabMsg.viewData()}
      </button>
    );
  }
});
module.exports = ViewDataButton;
