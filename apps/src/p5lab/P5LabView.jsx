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
import {
  P5LabInterfaceMode,
  P5LabType,
  APP_WIDTH,
  APP_HEIGHT
} from './constants';
import P5LabVisualizationHeader from './P5LabVisualizationHeader';
import P5LabVisualizationColumn from './P5LabVisualizationColumn';
import InstructionsWithWorkspace from '@cdo/apps/templates/instructions/InstructionsWithWorkspace';
import {isResponsiveFromState} from '@cdo/apps/templates/ProtectedVisualizationDiv';
import CodeWorkspace from '@cdo/apps/templates/CodeWorkspace';
import {allowAnimationMode} from './stateQueries';
import IFrameEmbedOverlay from '@cdo/apps/templates/IFrameEmbedOverlay';
import VisualizationResizeBar from '@cdo/apps/lib/ui/VisualizationResizeBar';
import AnimationPicker, {PICKER_TYPE} from './AnimationPicker/AnimationPicker';
import {getManifest} from '@cdo/apps/assetManagement/animationLibraryApi';
import experiments from '@cdo/apps/util/experiments';

/**
 * Top-level React wrapper for GameLab
 */
class P5LabView extends React.Component {
  static propTypes = {
    // Provided manually
    showFinishButton: PropTypes.bool.isRequired,
    onMount: PropTypes.func.isRequired,
    pauseHandler: PropTypes.func.isRequired,
    hidePauseButton: PropTypes.bool.isRequired,
    onPromptAnswer: PropTypes.func,
    labType: PropTypes.oneOf(Object.keys(P5LabType)).isRequired,

    // Provided by Redux
    interfaceMode: PropTypes.oneOf([
      P5LabInterfaceMode.CODE,
      P5LabInterfaceMode.ANIMATION,
      P5LabInterfaceMode.BACKGROUND
    ]).isRequired,
    isResponsive: PropTypes.bool.isRequired,
    hideSource: PropTypes.bool.isRequired,
    pinWorkspaceToBottom: PropTypes.bool.isRequired,
    allowAnimationMode: PropTypes.bool.isRequired,
    isIframeEmbed: PropTypes.bool.isRequired,
    isRunning: PropTypes.bool.isRequired,
    isBlockly: PropTypes.bool.isRequired,
    isBackground: PropTypes.bool,
    currentUserType: PropTypes.string
  };

  constructor(props) {
    super(props);

    // Indicate the context of the animation picker
    let projectType = this.props.isBlockly
      ? PICKER_TYPE.spritelab
      : PICKER_TYPE.gamelab;

    this.state = {
      libraryManifest: {},
      projectType
    };
  }

  getChannelId() {
    if (dashboard && dashboard.project) {
      return dashboard.project.getCurrentId();
    }
    return undefined;
  }

  componentDidMount() {
    this.props.onMount();
    const locale = window.appOptions.locale;
    const app = this.props.isBlockly ? 'spritelab' : 'gamelab';
    getManifest(app, locale).then(libraryManifest => {
      this.setState({libraryManifest});
    });
  }

  // TODO: When we remove the backgrounds_and_upload experiment we can get rid of hideUploadOption
  shouldHideAnimationUpload() {
    // Teachers should always be allowed to upload animations, and we are currently
    // enabling it for students under an experiment flag.
    if (
      this.props.currentUserType === 'teacher' ||
      experiments.isEnabled(experiments.BACKGROUNDS_AND_UPLOAD)
    ) {
      return false;
    }

    return this.props.isBlockly;
  }

  // Teachers and users of non-blockly labs should always be allowed to upload animations
  // with no restrictions. Otherwise, if users upload animations we will disable publish and remix.
  shouldRestrictAnimationUpload() {
    if (this.props.currentUserType === 'teacher') {
      return false;
    }

    return this.props.isBlockly;
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
    let defaultQuery = {
      categoryQuery: '',
      searchQuery: ''
    };
    if (this.props.isBackground) {
      defaultQuery.categoryQuery = 'backgrounds';
    }
    // We don't want them to be able to navigate to all categories if we're only showing backgrounds.
    const navigable = !this.props.isBackground;
    // We don't want to show backgrounds if we're looking for costumes in Sprite Lab.
    const hideBackgrounds = !this.props.isBackground && this.props.isBlockly;
    const hideCostumes = this.props.isBackground && this.props.isBlockly;
    return (
      <div style={codeModeStyle}>
        <div
          id="visualizationColumn"
          className={visualizationColumnClassNames}
          style={visualizationColumnStyle}
        >
          <P5LabVisualizationHeader labType={this.props.labType} />
          <P5LabVisualizationColumn
            finishButton={showFinishButton}
            pauseHandler={this.props.pauseHandler}
            hidePauseButton={this.props.hidePauseButton}
            onPromptAnswer={this.props.onPromptAnswer}
          />
          {this.getChannelId() && (
            <AnimationPicker
              channelId={this.getChannelId()}
              libraryManifest={this.state.libraryManifest}
              hideUploadOption={this.shouldHideAnimationUpload()}
              shouldRestrictAnimationUpload={this.shouldRestrictAnimationUpload()}
              hideAnimationNames={this.props.isBlockly}
              navigable={navigable}
              defaultQuery={this.props.isBackground ? defaultQuery : undefined}
              hideBackgrounds={hideBackgrounds}
              hideCostumes={hideCostumes}
              pickerType={
                this.props.isBackground
                  ? PICKER_TYPE.backgrounds
                  : this.state.projectType
              }
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
          <CodeWorkspace withSettingsCog={!this.props.isBlockly} />
        </InstructionsWithWorkspace>
      </div>
    );
  }

  renderAnimationMode() {
    const {allowAnimationMode, interfaceMode} = this.props;
    let defaultQuery = {
      categoryQuery: '',
      searchQuery: ''
    };
    if (this.props.isBackground) {
      // Navigate to the backgrounds animation category.
      defaultQuery.categoryQuery = 'backgrounds';
    }
    const isBackgroundMode = interfaceMode === P5LabInterfaceMode.BACKGROUND;
    return allowAnimationMode &&
      (interfaceMode === P5LabInterfaceMode.ANIMATION ||
        interfaceMode === P5LabInterfaceMode.BACKGROUND) ? (
      <AnimationTab
        channelId={this.getChannelId()}
        defaultQuery={defaultQuery}
        libraryManifest={this.state.libraryManifest}
        hideUploadOption={this.shouldHideAnimationUpload()}
        shouldRestrictAnimationUpload={this.shouldRestrictAnimationUpload()}
        hideAnimationNames={this.props.isBlockly}
        hideBackgrounds={this.props.isBlockly && !isBackgroundMode}
        hideCostumes={isBackgroundMode}
        labType={this.props.labType}
        pickerType={
          this.props.isBackground
            ? PICKER_TYPE.backgrounds
            : this.state.projectType
        }
        interfaceMode={interfaceMode}
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
  isRunning: state.runState.isRunning,
  isIframeEmbed: state.pageConstants.isIframeEmbed,
  isBlockly: state.pageConstants.isBlockly,
  isBackground: state.animationPicker.isBackground,
  currentUserType: state.currentUser?.userType
}))(P5LabView);
