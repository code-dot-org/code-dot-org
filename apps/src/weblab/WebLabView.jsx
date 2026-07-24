/** @file Top-level view for WebLab */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import Meter from '@cdo/apps/templates/Meter';
import msg from '@cdo/locale';
import weblabMsg from '@cdo/weblab/locale';

import CompletionButton from '../templates/CompletionButton';
import InstructionsWithWorkspace from '../templates/instructions/InstructionsWithWorkspace';
import PaneHeader, {PaneSection, PaneButton} from '../templates/PaneHeader';
import ProjectTemplateWorkspaceIcon from '../templates/ProjectTemplateWorkspaceIconV2';
import StudioAppWrapper from '../templates/StudioAppWrapper';

// Helper for converting bytes to megabytes.
const bytesToMegabytes = bytes => {
  return bytes * 0.000000954;
};

/**
 * Top-level React wrapper for WebLab
 */
class WebLabView extends React.Component {
  static propTypes = {
    onUndo: PropTypes.func.isRequired,
    onRedo: PropTypes.func.isRequired,
    onRefreshPreview: PropTypes.func.isRequired,
    onStartFullScreenPreview: PropTypes.func.isRequired,
    onEndFullScreenPreview: PropTypes.func.isRequired,
    onToggleInspector: PropTypes.func.isRequired,
    onAddFileHTML: PropTypes.func.isRequired,
    onAddFileCSS: PropTypes.func.isRequired,
    onAddFileImage: PropTypes.func.isRequired,
    onMount: PropTypes.func.isRequired,

    // From redux
    isProjectLevel: PropTypes.bool.isRequired,
    isReadOnlyWorkspace: PropTypes.bool.isRequired,
    isInspectorOn: PropTypes.bool.isRequired,
    isFullScreenPreviewOn: PropTypes.bool.isRequired,
    showProjectTemplateWorkspaceIcon: PropTypes.bool.isRequired,
    dialog: PropTypes.element,
    maxProjectCapacity: PropTypes.number.isRequired,
    projectSize: PropTypes.number.isRequired,
  };

  componentDidMount() {
    this.props.onMount();
  }

  projectCapacityLabel = () => {
    let totalMegabytes = Math.round(
      bytesToMegabytes(this.props.maxProjectCapacity)
    );
    let currentMegabytes = bytesToMegabytes(this.props.projectSize);
    // If using 75%+ capacity, display a decimal with 2 digits.
    // Otherwise, round the capacity.
    currentMegabytes =
      currentMegabytes / totalMegabytes >= 0.75
        ? currentMegabytes.toFixed(2)
        : Math.round(currentMegabytes);

    return weblabMsg.currentProjectCapacity({
      currentMegabytes,
      totalMegabytes,
    });
  };

  render() {
    const {maxProjectCapacity, projectSize} = this.props;

    let headersHeight = 30;
    let iframeHeightOffset =
      headersHeight + (this.props.isProjectLevel ? 0 : 70);
    let iframeStyles = {
      position: 'absolute',
      width: '100%',
      height: `calc(100% - ${iframeHeightOffset}px)`,
    };

    return (
      <StudioAppWrapper>
        <InstructionsWithWorkspace>
          <div>
            <PaneHeader id="headers" style={{padding: '0 .125rem'}}>
              {!this.props.isFullScreenPreviewOn &&
                !this.props.isReadOnlyWorkspace && (
                  <PaneSection
                    style={{
                      alignItems: 'center',
                      flex: '0 1 auto',
                      gap: '0.125rem',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                  >
                    <PaneButton
                      iconProps={{iconName: 'circle-plus', iconStyle: 'solid'}}
                      leftJustified={true}
                      headerHasFocus={true}
                      isRtl={false}
                      onClick={this.props.onAddFileHTML}
                      label={weblabMsg.addHTMLButton()}
                    />
                    <PaneButton
                      iconProps={{iconName: 'circle-plus', iconStyle: 'solid'}}
                      leftJustified={true}
                      headerHasFocus={true}
                      isRtl={false}
                      onClick={this.props.onAddFileCSS}
                      label={weblabMsg.addCSSButton()}
                    />
                    <PaneButton
                      id="ui-test-add-image"
                      iconProps={{iconName: 'circle-plus', iconStyle: 'solid'}}
                      leftJustified={true}
                      headerHasFocus={true}
                      isRtl={false}
                      onClick={this.props.onAddFileImage}
                      label={weblabMsg.addImageButton()}
                    />
                  </PaneSection>
                )}
              <PaneSection
                id="workspace-header"
                style={{
                  alignItems: 'center',
                  flex: this.props.isReadOnlyWorkspace ? '1 1 0' : '0 1 auto',
                  gap: '0.125rem',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginLeft:
                    this.props.showProjectTemplateWorkspaceIcon ||
                    this.props.isReadOnlyWorkspace
                      ? 0
                      : '-0.125rem',
                }}
              >
                {this.props.showProjectTemplateWorkspaceIcon && (
                  <ProjectTemplateWorkspaceIcon />
                )}
                {this.props.isReadOnlyWorkspace && (
                  <span id="workspace-header-span">
                    {msg.readonlyWorkspaceHeader()}
                  </span>
                )}
              </PaneSection>
              <PaneSection
                style={{
                  alignItems: 'center',
                  flex:
                    this.props.isFullScreenPreviewOn ||
                    this.props.isReadOnlyWorkspace
                      ? '0 1 auto'
                      : '1 1 0',
                  gap: '0.125rem',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                {!this.props.isFullScreenPreviewOn && (
                  <PaneButton
                    id="versions-header"
                    iconProps={{iconName: 'clock', iconStyle: 'solid'}}
                    leftJustified={true}
                    headerHasFocus={true}
                    isRtl={false}
                    label={msg.showVersionsHeader()}
                  />
                )}
                {!this.props.isFullScreenPreviewOn &&
                  !this.props.isReadOnlyWorkspace && (
                    <>
                      {maxProjectCapacity > 0 && projectSize > 0 ? (
                        <Meter
                          id="weblab-project-capacity"
                          label={this.projectCapacityLabel()}
                          value={projectSize}
                          max={maxProjectCapacity}
                          containerStyle={{
                            flex: '1 1 0',
                            height: 30,
                          }}
                        />
                      ) : (
                        <span style={{flex: '1 1 0'}} />
                      )}
                    </>
                  )}
                {!this.props.isFullScreenPreviewOn && (
                  <PaneButton
                    iconProps={{iconName: 'arrow-pointer', iconStyle: 'solid'}}
                    leftJustified={false}
                    headerHasFocus={true}
                    isPressed={this.props.isInspectorOn}
                    pressedLabel={weblabMsg.toggleInspectorOff()}
                    isRtl={false}
                    onClick={this.props.onToggleInspector}
                    label={weblabMsg.toggleInspectorOn()}
                  />
                )}
                {!this.props.isFullScreenPreviewOn &&
                  !this.props.isReadOnlyWorkspace && (
                    <PaneButton
                      iconProps={{
                        iconName: 'rotate-right',
                        iconStyle: 'solid',
                      }}
                      leftJustified={false}
                      headerHasFocus={true}
                      isRtl={false}
                      onClick={this.props.onRefreshPreview}
                      label={weblabMsg.refreshPreview()}
                    />
                  )}
                <PaneButton
                  iconProps={{
                    iconName: this.props.isFullScreenPreviewOn
                      ? 'compress'
                      : 'up-down-left-right',
                    iconStyle: 'solid',
                  }}
                  leftJustified={false}
                  headerHasFocus={true}
                  isRtl={false}
                  onClick={
                    this.props.isFullScreenPreviewOn
                      ? this.props.onEndFullScreenPreview
                      : this.props.onStartFullScreenPreview
                  }
                  ariaLabel={
                    this.props.isFullScreenPreviewOn
                      ? weblabMsg.closeFullscreenPreview()
                      : weblabMsg.openFullscreenPreview()
                  }
                  label=""
                />
              </PaneSection>
            </PaneHeader>
            <iframe
              className="weblab-host"
              src="/weblab/host"
              frameBorder="0"
              scrolling="no"
              style={iframeStyles}
              title={msg.projectTypeWeblab()}
            />
            {!this.props.isProjectLevel && <CompletionButton />}
            {this.props.dialog}
          </div>
        </InstructionsWithWorkspace>
      </StudioAppWrapper>
    );
  }
}

export default connect(state => ({
  dialog: state.dialog,
  isProjectLevel: state.pageConstants.isProjectLevel,
  isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
  isInspectorOn: state.inspectorOn,
  isFullScreenPreviewOn: state.fullScreenPreviewOn,
  showProjectTemplateWorkspaceIcon:
    !!state.pageConstants.showProjectTemplateWorkspaceIcon,
  maxProjectCapacity: state.maxProjectCapacity,
  projectSize: state.projectSize,
}))(WebLabView);
