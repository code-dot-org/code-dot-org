'use strict';

var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var UnconnectedStudioAppWrapper = require('../templates/StudioAppWrapper').UnconnectedStudioAppWrapper;

/**
 * Top-level React wrapper for our NetSim app.
 */
var NetSimView = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    isEmbedView: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    generateCodeAppHtml: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    return (
      <UnconnectedStudioAppWrapper
          assetUrl={this.props.assetUrl}
          isEmbedView={this.props.isEmbedView}
          isShareView={this.props.isShareView}>
        <ProtectedStatefulDiv contentFunction={this.props.generateCodeAppHtml} />
      </UnconnectedStudioAppWrapper>
    );
  }
});
module.exports = NetSimView;
