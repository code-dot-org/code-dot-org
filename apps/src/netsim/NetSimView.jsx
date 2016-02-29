'use strict';

var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv.jsx');
var StudioAppWrapper = require('../templates/StudioAppWrapper.jsx');

/**
 * Top-level React wrapper for our NetSim app.
 */
var NetSimView = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    requireLandscape: React.PropTypes.bool.isRequired,
    renderCodeApp: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    return (
      <StudioAppWrapper
          assetUrl={this.props.assetUrl}
          requireLandscape={this.props.requireLandscape}>
        <ProtectedStatefulDiv renderContents={this.props.renderCodeApp} />
      </StudioAppWrapper>
    );
  }
});
module.exports = NetSimView;
