'use strict';

var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv.jsx');
var RotateContainer = require('../templates/RotateContainer.jsx');

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
      <div>
        {this.props.requireLandscape && <RotateContainer assetUrl={this.props.assetUrl} />}
        <ProtectedStatefulDiv renderContents={this.props.renderCodeApp} />
        <div className="clear"></div>
      </div>
    );
  }
});
module.exports = NetSimView;
