
import React, {PropTypes} from 'react';
var msg = require('@cdo/locale');

/**
 * "Rotate your device" overlay.
 */
var RotateContainer = React.createClass({
  propTypes: {
    assetUrl: PropTypes.func.isRequired
  },

  render: function () {
    return (
      <div id="rotateContainer" style={this.getStyle()}>
        <div id="rotateText">
          <p>{msg.rotateText()}<br />{msg.orientationLock()}</p>
        </div>
      </div>
    );
  },

  getStyle: function () {
    return {
      backgroundImage: 'url(' + this.props.assetUrl('media/turnphone_horizontal.png') + ')'
    };
  }
});
module.exports = RotateContainer;
