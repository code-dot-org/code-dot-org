/** @file Top-level view for App Lab */
'use strict';

var ApplabVisualizationColumn = require('./ApplabVisualizationColumn');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var ConnectedStudioAppWrapper = require('../templates/ConnectedStudioAppWrapper');
var InstructionsWithWorkspace = require('../templates/instructions/InstructionsWithWorkspace');

/**
 * Top-level React wrapper for App Lab.
 */
var AppLabView = React.createClass({
  propTypes: {
    isEditingProject: React.PropTypes.bool.isRequired,

    screenIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,

    codeWorkspace: React.PropTypes.element.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    return (
      <ConnectedStudioAppWrapper>
        <ApplabVisualizationColumn
            isEditingProject={this.props.isEditingProject}
            screenIds={this.props.screenIds}
            onScreenCreate={this.props.onScreenCreate} />
        <ProtectedStatefulDiv
            id="visualizationResizeBar"
            className="fa fa-ellipsis-v" />
        <InstructionsWithWorkspace
          codeWorkspace={this.props.codeWorkspace}/>
      </ConnectedStudioAppWrapper>
    );
  }
});

module.exports = AppLabView;
