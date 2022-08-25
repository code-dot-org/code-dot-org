/** @file Top-level view for App Lab */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import ImportProjectDialog from './ImportProjectDialog';
import ImportScreensDialog from './ImportScreensDialog';
import ApplabVisualizationColumn from './ApplabVisualizationColumn';
import StudioAppWrapper from '../templates/StudioAppWrapper';
import InstructionsWithWorkspace from '../templates/instructions/InstructionsWithWorkspace';
import {ApplabInterfaceMode, WIDGET_WIDTH} from './constants';
import CodeWorkspace from '../templates/CodeWorkspace';
import DataWorkspace from '../storage/dataBrowser/DataWorkspace';
import ProtectedDesignWorkspace from './ProtectedDesignWorkspace';
import VisualizationResizeBar from '../lib/ui/VisualizationResizeBar';
import ExternalRedirectDialog from '@cdo/apps/applab/ExternalRedirectDialog';

/**
 * Top-level React wrapper for App Lab.
 */
class AppLabView extends React.Component {
  static propTypes = {
    handleVersionHistory: PropTypes.func.isRequired,
    autogenerateML: PropTypes.func.isRequired,
    isEditingProject: PropTypes.bool.isRequired,
    screenIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    onScreenCreate: PropTypes.func.isRequired,
    onMount: PropTypes.func.isRequired,

    // Provided by redux
    hasDataMode: PropTypes.bool.isRequired,
    hasDesignMode: PropTypes.bool.isRequired,
    interfaceMode: PropTypes.oneOf([
      ApplabInterfaceMode.CODE,
      ApplabInterfaceMode.DESIGN,
      ApplabInterfaceMode.DATA
    ]).isRequired,
    isRtl: PropTypes.bool,
    widgetMode: PropTypes.bool
  };

  componentDidMount() {
    this.props.onMount();
  }

  render() {
    const {
      interfaceMode,
      widgetMode,
      isRtl,
      isEditingProject,
      screenIds,
      onScreenCreate,
      autogenerateML,
      hasDesignMode,
      hasDataMode,
      handleVersionHistory
    } = this.props;

    const codeWorkspaceVisible = ApplabInterfaceMode.CODE === interfaceMode;

    let instructionWorkspaceStyle = {};
    if (widgetMode) {
      instructionWorkspaceStyle = isRtl
        ? styles.widgetInstructionsRtl
        : styles.widgetInstructions;
    }

    return (
      <StudioAppWrapper>
        <ImportProjectDialog />
        <ImportScreensDialog />
        <ExternalRedirectDialog />
        <ApplabVisualizationColumn
          isEditingProject={isEditingProject}
          screenIds={screenIds}
          onScreenCreate={onScreenCreate}
        />
        <VisualizationResizeBar />
        {/* Applying instructionWorkspaceStyle to both the instructions (using instructionsStyle) and the
         *  workspace (using workspaceStyle) is necessary because both elements are absolutely positioned.
         */}
        <InstructionsWithWorkspace
          workspaceStyle={instructionWorkspaceStyle}
          instructionsStyle={instructionWorkspaceStyle}
        >
          <CodeWorkspace
            withSettingsCog
            style={{display: codeWorkspaceVisible ? 'block' : 'none'}}
            autogenerateML={autogenerateML}
          />
          {hasDesignMode && <ProtectedDesignWorkspace />}
          {hasDataMode && (
            <DataWorkspace handleVersionHistory={handleVersionHistory} />
          )}
        </InstructionsWithWorkspace>
      </StudioAppWrapper>
    );
  }
}

export default connect(state => ({
  hasDataMode: state.pageConstants.hasDataMode || false,
  hasDesignMode: state.pageConstants.hasDesignMode || false,
  interfaceMode: state.interfaceMode,
  isRtl: state.isRtl,
  widgetMode: state.pageConstants.widgetMode
}))(AppLabView);

const styles = {
  widgetInstructions: {
    left: WIDGET_WIDTH
  },
  widgetInstructionsRtl: {
    right: WIDGET_WIDTH
  }
};
