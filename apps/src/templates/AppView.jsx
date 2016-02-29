'use strict';

var ProtectedStatefulDiv = require('./ProtectedStatefulDiv.jsx');
var RotateContainer = require('./RotateContainer.jsx');

/**
 * Top-level React wrapper for our standard blockly apps.
 */
var AppView = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    requireLandscape: React.PropTypes.bool.isRequired,
    renderCodeWorkspace: React.PropTypes.func.isRequired,
    renderVisualizationColumn: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    return (
      <div>
        {this.props.requireLandscape && <RotateContainer assetUrl={this.props.assetUrl} />}
        <ProtectedStatefulDiv
            id="visualizationColumn"
            renderContents={this.props.renderVisualizationColumn} />
        <div id="visualizationResizeBar" className="fa fa-ellipsis-v"></div>
        <ProtectedStatefulDiv
            id="codeWorkspace"
            renderContents={this.props.renderCodeWorkspace} />
        <div className="clear"></div>
      </div>
    );
  }
});
module.exports = AppView;
