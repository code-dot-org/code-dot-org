'use strict';

var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv.jsx');
var RotateContainer = require('../templates/RotateContainer.jsx');

/**
 * Wrapper component for all Code Studio app types, which provides rotate
 * container and clear-div but otherwise just renders children.
 */
var StudioAppWrapper = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    requireLandscape: React.PropTypes.bool.isRequired
  },

  render: function () {
    return (
      <div>
        {this.props.requireLandscape && <RotateContainer assetUrl={this.props.assetUrl} />}
        {this.props.children}
        <div className="clear"></div>
      </div>
    );
  }
});
module.exports = StudioAppWrapper;
