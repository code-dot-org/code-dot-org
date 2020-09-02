/** @file Top-level view for GameLab */
/* global dashboard */
import classNames from 'classnames';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import AnimationTab from './AnimationTab/AnimationTab';
import StudioAppWrapper from '@cdo/apps/templates/StudioAppWrapper';
import ErrorDialogStack from './ErrorDialogStack';
import AnimationJsonViewer from './AnimationJsonViewer';
import {P5LabInterfaceMode, APP_WIDTH, APP_HEIGHT} from './constants';
import P5LabVisualizationHeader from './P5LabVisualizationHeader';
import P5LabVisualizationColumn from './P5LabVisualizationColumn';
import InstructionsWithWorkspace from '@cdo/apps/templates/instructions/InstructionsWithWorkspace';
import {isResponsiveFromState} from '@cdo/apps/templates/ProtectedVisualizationDiv';
import CodeWorkspace from '@cdo/apps/templates/CodeWorkspace';
import {allowAnimationMode, showVisualizationHeader} from './stateQueries';
import IFrameEmbedOverlay from '@cdo/apps/templates/IFrameEmbedOverlay';
import VisualizationResizeBar from '@cdo/apps/lib/ui/VisualizationResizeBar';
import AnimationPicker from './AnimationPicker/AnimationPicker';

/**
 * Top-level React wrapper for GameLab
 */
class P5LabView extends React.Component {
  static propTypes = {
    // Provided manually
    showFinishButton: PropTypes.bool.isRequired,
    onMount: PropTypes.func.isRequired,
    // Provided by Redux
    interfaceMode: PropTypes.oneOf([
      P5LabInterfaceMode.CODE,
      P5LabInterfaceMode.ANIMATION
    ]).isRequired,
    isResponsive: PropTypes.bool.isRequired,
    hideSource: PropTypes.bool.isRequired,
    pinWorkspaceToBottom: PropTypes.bool.isRequired,
    allowAnimationMode: PropTypes.bool.isRequired,
    showVisualizationHeader: PropTypes.bool.isRequired,
    isIframeEmbed: PropTypes.bool.isRequired,
    isRunning: PropTypes.bool.isRequired,
    spriteLab: PropTypes.bool.isRequired
  };

  state = {
    libraryManifest: {}
  };

  getChannelId() {
    if (dashboard && dashboard.project) {
      return dashboard.project.getCurrentId();
    }
    return undefined;
  }

  componentDidMount() {
    this.props.onMount();
    const locale = window.appOptions.locale;
    const app = this.props.spriteLab ? 'spritelab' : 'gamelab';
    // temporarily pull from local env for testing purposes
    if (app === 'spritelab') {
      this.setState({
        libraryManifest: require('./customSpritelabCostumeLibrary.json')
      });
    } else {
      fetch(`/api/v1/animation-library/manifest/${app}/${locale}`)
        .then(response => response.json())
        .then(libraryManifest => {
          this.setState({libraryManifest});
        });
    }
  }

  renderCodeMode() {
    const {
      interfaceMode,
      isResponsive,
      hideSource,
      pinWorkspaceToBottom,
      showFinishButton
    } = this.props;

    // Code mode contains protected (non-React) content.  We have to always
    // render it, so when we're not in code mode use CSS to hide it.
    const codeModeStyle = {
      display: interfaceMode !== P5LabInterfaceMode.CODE ? 'none' : undefined
    };

    const visualizationColumnStyle = {
      width: APP_WIDTH
    };

    const visualizationColumnClassNames = classNames({
      responsive: isResponsive,
      pin_bottom: !hideSource && pinWorkspaceToBottom
    });

    return (
      <div style={codeModeStyle}>
        <div
          id="visualizationColumn"
          className={visualizationColumnClassNames}
          style={visualizationColumnStyle}
        >
          {this.props.showVisualizationHeader && <P5LabVisualizationHeader />}
          <P5LabVisualizationColumn finishButton={showFinishButton} />
          {this.getChannelId() && (
            <AnimationPicker
              channelId={this.getChannelId()}
              allowedExtensions=".png,.jpg,.jpeg"
              libraryManifest={this.state.libraryManifest}
              hideUploadOption={this.props.spriteLab}
              hideAnimationNames={this.props.spriteLab}
            />
          )}
        </div>
        {this.props.isIframeEmbed && !this.props.isRunning && (
          <IFrameEmbedOverlay
            appWidth={APP_WIDTH}
            appHeight={APP_HEIGHT}
            style={{top: 79, left: 17}}
            playButtonStyle={{top: 620, left: 179}}
          />
        )}
        <VisualizationResizeBar />
        <InstructionsWithWorkspace>
          <CodeWorkspace withSettingsCog={!this.props.spriteLab} />
        </InstructionsWithWorkspace>
      </div>
    );
  }

  renderAnimationMode() {
    const {allowAnimationMode, interfaceMode} = this.props;
    return allowAnimationMode &&
      interfaceMode === P5LabInterfaceMode.ANIMATION ? (
      <AnimationTab
        channelId={this.getChannelId()}
        libraryManifest={this.state.libraryManifest}
        hideUploadOption={this.props.spriteLab}
        hideAnimationNames={this.props.spriteLab}
      />
    ) : (
      undefined
    );
  }

  render() {
    return (
      <StudioAppWrapper>
        {this.renderCodeMode()}
        {this.renderAnimationMode()}
        <ErrorDialogStack />
        <AnimationJsonViewer />
      </StudioAppWrapper>
    );
  }
}
export default connect(state => ({
  hideSource: state.pageConstants.hideSource,
  interfaceMode: state.interfaceMode,
  isResponsive: isResponsiveFromState(state),
  pinWorkspaceToBottom: state.pageConstants.pinWorkspaceToBottom,
  allowAnimationMode: allowAnimationMode(state),
  showVisualizationHeader: showVisualizationHeader(state),
  isRunning: state.runState.isRunning,
  isIframeEmbed: state.pageConstants.isIframeEmbed,
  spriteLab: state.pageConstants.isBlockly
}))(P5LabView);
