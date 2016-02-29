'use strict';

var RotateContainer = require('../templates/RotateContainer.jsx');

/**
 * Wrapper component for all Code Studio app types, which provides rotate
 * container and clear-div but otherwise just renders children.
 */
var StudioAppWrapper = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    isEmbedView: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired
  },

  requiresLandscape: function () {
    return !(this.props.isEmbedView || this.props.isShareView);
  },

  render: function () {
    return (
      <div>
        {this.requiresLandscape() && <RotateContainer assetUrl={this.props.assetUrl} />}
        {this.props.children}
        <div className="clear"></div>
      </div>
    );
  }
});
module.exports = StudioAppWrapper;
