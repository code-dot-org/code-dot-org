/** @file Top-level view for App Lab */
'use strict';

var React = require('react');
var ApplabVisualizationColumn = require('./ApplabVisualizationColumn');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var StudioAppWrapper = require('../templates/StudioAppWrapper');
var InstructionsWithWorkspace = require('../templates/instructions/InstructionsWithWorkspace');
import { ApplabInterfaceMode } from './constants';
import CodeWorkspace from '../templates/CodeWorkspace';
import DataWorkspace from './DataWorkspace';
import ProtectedDesignWorkspace from './ProtectedDesignWorkspace';
import { connect } from 'react-redux';

/**
 * Top-level React wrapper for App Lab.
 */
var AppLabView = React.createClass({
  propTypes: {
    hasDataMode: React.PropTypes.bool.isRequired,
    hasDesignMode: React.PropTypes.bool.isRequired,
    interfaceMode: React.PropTypes.oneOf([
      ApplabInterfaceMode.CODE,
      ApplabInterfaceMode.DESIGN,
      ApplabInterfaceMode.DATA
    ]).isRequired,
    isEditingProject: React.PropTypes.bool.isRequired,

    screenIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,

    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    const codeWorkspaceVisible = (ApplabInterfaceMode.CODE === this.props.interfaceMode);
    return (
      <StudioAppWrapper>
        <ApplabVisualizationColumn
            isEditingProject={this.props.isEditingProject}
            screenIds={this.props.screenIds}
            onScreenCreate={this.props.onScreenCreate} />
        <ProtectedStatefulDiv
            id="visualizationResizeBar"
            className="fa fa-ellipsis-v" />
        <InstructionsWithWorkspace>
          <CodeWorkspace style={{display: codeWorkspaceVisible ? 'block' : 'none' }}/>
          {this.props.hasDesignMode && <ProtectedDesignWorkspace/>}
          {this.props.hasDataMode && <DataWorkspace/>}
        </InstructionsWithWorkspace>
      </StudioAppWrapper>
    );
  }
});

module.exports = connect(state => ({
  hasDataMode: state.pageConstants.hasDataMode || false,
  hasDesignMode: state.pageConstants.hasDesignMode || false,
  interfaceMode: state.interfaceMode
}))(AppLabView);
