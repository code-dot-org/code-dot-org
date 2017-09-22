
import React, {PropTypes} from 'react';
var RotateContainer = require('../templates/RotateContainer');
var connect = require('react-redux').connect;

/**
 * Wrapper component for all Code Studio app types, which provides rotate
 * container and clear-div but otherwise just renders children.
 */
var StudioAppWrapper = React.createClass({
  propTypes: {
    assetUrl: PropTypes.func.isRequired,
    isEmbedView: PropTypes.bool.isRequired,
    isShareView: PropTypes.bool.isRequired,
    children: PropTypes.node,
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
module.exports = connect(function propsFromStore(state) {
  return {
    assetUrl: state.pageConstants.assetUrl,
    isEmbedView: state.pageConstants.isEmbedView,
    isShareView: state.pageConstants.isShareView
  };
})(StudioAppWrapper);
