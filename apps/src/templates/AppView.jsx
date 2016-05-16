'use strict';

import classNames from 'classnames';
import {connect} from 'react-redux';
import {isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';
var _ = require('../lodash');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
// TODO - everyone is connected
var ConnectedStudioAppWrapper = require('./ConnectedStudioAppWrapper');
var CodeWorkspaceContainer = require('./CodeWorkspaceContainer');

/**
 * Top-level React wrapper for our standard blockly apps.
 */
var AppView = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    isEmbedView: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    hideSource: React.PropTypes.bool.isRequired,
    noVisualization: React.PropTypes.bool.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    visualizationColumn: React.PropTypes.element,
    onMount: React.PropTypes.func.isRequired,
    // Provided from redux
    isResponsive: React.PropTypes.bool.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    const visualizationColumnClassNames = classNames({
      responsive: this.props.isResponsive
    });

    return (
      <ConnectedStudioAppWrapper>
        <div id="visualizationColumn" className={visualizationColumnClassNames}>
          {this.props.visualizationColumn}
        </div>
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
        <CodeWorkspaceContainer
            topMargin={0}
            hidden={this.props.hideSource}
            noVisualization={this.props.noVisualization}
            isRtl={this.props.isRtl}
        />
      </ConnectedStudioAppWrapper>
    );
  }
});
module.exports = connect(state => ({
  isResponsive: isResponsiveFromState(state)
}))(AppView);
