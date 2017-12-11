/** @file Top-level view for App Lab */
import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import ImportProjectDialog from './ImportProjectDialog';
import ImportScreensDialog from './ImportScreensDialog';
import ApplabVisualizationColumn from './ApplabVisualizationColumn';
import StudioAppWrapper from '../templates/StudioAppWrapper';
import InstructionsWithWorkspace from '../templates/instructions/InstructionsWithWorkspace';
import { ApplabInterfaceMode } from './constants';
import CodeWorkspace from '../templates/CodeWorkspace';
import DataWorkspace from '../storage/dataBrowser/DataWorkspace';
import ProtectedDesignWorkspace from './ProtectedDesignWorkspace';
import VisualizationResizeBar from "../lib/ui/VisualizationResizeBar";

/**
 * Top-level React wrapper for App Lab.
 */
class AppLabView extends React.Component {
  static propTypes = {
    handleVersionHistory: PropTypes.func.isRequired,
    hasDataMode: PropTypes.bool.isRequired,
    hasDesignMode: PropTypes.bool.isRequired,
    interfaceMode: PropTypes.oneOf([
      ApplabInterfaceMode.CODE,
      ApplabInterfaceMode.DESIGN,
      ApplabInterfaceMode.DATA
    ]).isRequired,
    isEditingProject: PropTypes.bool.isRequired,

    screenIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    onScreenCreate: PropTypes.func.isRequired,

    onMount: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.onMount();
  }

  render() {
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
        <VisualizationResizeBar/>
        <InstructionsWithWorkspace>
          <CodeWorkspace withSettingsCog style={{display: codeWorkspaceVisible ? 'block' : 'none' }}/>
          {this.props.hasDesignMode && <ProtectedDesignWorkspace/>}
          {this.props.hasDataMode && <DataWorkspace handleVersionHistory={this.props.handleVersionHistory}/>}
        </InstructionsWithWorkspace>
      </StudioAppWrapper>
    );
  }
}

export default connect(state => ({
  hasDataMode: state.pageConstants.hasDataMode || false,
  hasDesignMode: state.pageConstants.hasDesignMode || false,
  interfaceMode: state.interfaceMode
}))(AppLabView);
