/** @file Top-level view for App Lab */
import ImportProjectDialog from './ImportProjectDialog';
import ImportScreensDialog from './ImportScreensDialog';
import React from 'react';
import ApplabVisualizationColumn from './ApplabVisualizationColumn';
import ProtectedStatefulDiv from '../templates/ProtectedStatefulDiv';
import StudioAppWrapper from '../templates/StudioAppWrapper';
import InstructionsWithWorkspace from '../templates/instructions/InstructionsWithWorkspace';
import { ApplabInterfaceMode } from './constants';
import CodeWorkspace from '../templates/CodeWorkspace';
import DataWorkspace from '../storage/dataBrowser/DataWorkspace';
import ProtectedDesignWorkspace from './ProtectedDesignWorkspace';
import { connect } from 'react-redux';

/**
 * Top-level React wrapper for App Lab.
 */
var AppLabView = React.createClass({
  propTypes: {
    handleVersionHistory: React.PropTypes.func.isRequired,
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
        <ImportProjectDialog />
        <ImportScreensDialog />
        <ApplabVisualizationColumn
          isEditingProject={this.props.isEditingProject}
          screenIds={this.props.screenIds}
          onScreenCreate={this.props.onScreenCreate}
        />
        <ProtectedStatefulDiv
          id="visualizationResizeBar"
          className="fa fa-ellipsis-v"
        />
        <InstructionsWithWorkspace>
          <CodeWorkspace withSettingsCog style={{display: codeWorkspaceVisible ? 'block' : 'none' }}/>
          {this.props.hasDesignMode && <ProtectedDesignWorkspace/>}
          {this.props.hasDataMode && <DataWorkspace handleVersionHistory={this.props.handleVersionHistory}/>}
        </InstructionsWithWorkspace>
      </StudioAppWrapper>
    );
  }
});

export default connect(state => ({
  hasDataMode: state.pageConstants.hasDataMode || false,
  hasDesignMode: state.pageConstants.hasDesignMode || false,
  interfaceMode: state.interfaceMode
}))(AppLabView);
