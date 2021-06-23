/** @file Top-level view for WebLab */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import StudioAppWrapper from '../templates/StudioAppWrapper';
import InstructionsWithWorkspace from '../templates/instructions/InstructionsWithWorkspace';
import msg from '@cdo/locale';
import weblabMsg from '@cdo/weblab/locale';
import PaneHeader, {PaneSection, PaneButton} from '../templates/PaneHeader';
import CompletionButton from '../templates/CompletionButton';
import ProjectTemplateWorkspaceIcon from '../templates/ProjectTemplateWorkspaceIcon';
import styleConstants from '../styleConstants';
import {changeShowError} from './actions';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import {getStore} from '../redux';
import Meter from '@cdo/apps/templates/Meter';

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
    dialog: PropTypes.object,
    maxProjectCapacity: PropTypes.number.isRequired,
    projectSize: PropTypes.number.isRequired
  };

  componentDidMount() {
    this.props.onMount();
  }

  closeErrorDialog() {
    getStore().dispatch(changeShowError(false));
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
      totalMegabytes
    });
  };

  render() {
    const {maxProjectCapacity, projectSize} = this.props;

    let headersHeight = styleConstants['workspace-headers-height'];
    let iframeHeightOffset =
      headersHeight + (this.props.isProjectLevel ? 0 : 70);
    let iframeStyles = {
      position: 'absolute',
      width: '100%',
      height: `calc(100% - ${iframeHeightOffset}px)`
    };

    return (
      <StudioAppWrapper>
        <InstructionsWithWorkspace>
          <div>
            <PaneHeader hasFocus={true} id="headers">
              {!this.props.isFullScreenPreviewOn &&
                !this.props.isReadOnlyWorkspace && (
                  <div>
                    <PaneButton
                      iconClass="fa fa-plus-circle"
                      leftJustified={true}
                      headerHasFocus={true}
                      isRtl={false}
                      onClick={this.props.onAddFileHTML}
                      label={weblabMsg.addHTMLButton()}
                    />
                    <PaneButton
                      iconClass="fa fa-plus-circle"
                      leftJustified={true}
                      headerHasFocus={true}
                      isRtl={false}
                      onClick={this.props.onAddFileCSS}
                      label={weblabMsg.addCSSButton()}
                    />
                    <PaneButton
                      id="ui-test-add-image"
                      iconClass="fa fa-plus-circle"
                      leftJustified={true}
                      headerHasFocus={true}
                      isRtl={false}
                      onClick={this.props.onAddFileImage}
                      label={weblabMsg.addImageButton()}
                    />
                  </div>
                )}
              <div>
                <PaneButton
                  iconClass={
                    this.props.isFullScreenPreviewOn
                      ? 'fa fa-compress'
                      : 'fa fa-arrows-alt'
                  }
                  leftJustified={false}
                  headerHasFocus={true}
                  isRtl={false}
                  onClick={
                    this.props.isFullScreenPreviewOn
                      ? this.props.onEndFullScreenPreview
                      : this.props.onStartFullScreenPreview
                  }
                  label=""
                />
                {!this.props.isFullScreenPreviewOn &&
                  !this.props.isReadOnlyWorkspace && (
                    <div>
                      <PaneButton
                        id="versions-header"
                        iconClass="fa fa-clock-o"
                        leftJustified={true}
                        headerHasFocus={true}
                        isRtl={false}
                        label={msg.showVersionsHeader()}
                      />
                      {maxProjectCapacity > 0 && projectSize > 0 && (
                        <Meter
                          id="weblab-project-capacity"
                          label={this.projectCapacityLabel()}
                          value={projectSize}
                          max={maxProjectCapacity}
                          containerStyle={{
                            float: 'left',
                            height: styleConstants['workspace-headers-height']
                          }}
                        />
                      )}
                      <PaneButton
                        iconClass="fa fa-repeat"
                        leftJustified={false}
                        headerHasFocus={true}
                        isRtl={false}
                        onClick={this.props.onRefreshPreview}
                        label={weblabMsg.refreshPreview()}
                      />
                    </div>
                  )}
                {!this.props.isFullScreenPreviewOn && (
                  <PaneButton
                    iconClass="fa fa-mouse-pointer"
                    leftJustified={false}
                    headerHasFocus={true}
                    isPressed={this.props.isInspectorOn}
                    pressedLabel={weblabMsg.toggleInspectorOff()}
                    isRtl={false}
                    onClick={this.props.onToggleInspector}
                    label={weblabMsg.toggleInspectorOn()}
                  />
                )}
                <PaneSection id="workspace-header">
                  {this.props.showProjectTemplateWorkspaceIcon && (
                    <ProjectTemplateWorkspaceIcon />
                  )}
                  {this.props.isReadOnlyWorkspace && (
                    <span id="workspace-header-span">
                      {msg.readonlyWorkspaceHeader()}
                    </span>
                  )}
                </PaneSection>
              </div>
            </PaneHeader>
            <iframe
              className="weblab-host"
              src="/weblab/host"
              frameBorder="0"
              scrolling="no"
              style={iframeStyles}
            />
            {!this.props.isProjectLevel && <CompletionButton />}
            {this.props.dialog && (
              <StylizedBaseDialog isOpen {...this.props.dialog} />
            )}
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
  showProjectTemplateWorkspaceIcon: !!state.pageConstants
    .showProjectTemplateWorkspaceIcon,
  maxProjectCapacity: state.maxProjectCapacity,
  projectSize: state.projectSize
}))(WebLabView);
