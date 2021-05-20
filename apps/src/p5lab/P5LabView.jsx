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
import {getManifest} from '@cdo/apps/assetManagement/animationLibraryApi';

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
    spriteLab: PropTypes.bool.isRequired,
    isBackground: PropTypes.bool
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
    getManifest(app, locale).then(libraryManifest => {
      this.setState({libraryManifest});
    });
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
    // we don't want them to be able to navigate to all categories if we're only showing backgrounds
    const navigable = !this.props.isBackground;
    // we don't want to show backgrounds if we're looking for sprites in spritelab
    const hideBackgrounds = !this.props.isBackground && this.props.spriteLab;
    // we don't want students to be able to draw their own backgrounds in spritelab so if we're showing
    // backgrounds alone, we must be in spritelab and we should get rid of the draw your own option
    const canDraw = !this.props.isBackground;
    return (
      <div style={codeModeStyle}>
        <div
          id="visualizationColumn"
          className={visualizationColumnClassNames}
          style={visualizationColumnStyle}
        >
          {this.props.showVisualizationHeader && <P5LabVisualizationHeader />}
          <P5LabVisualizationColumn
            finishButton={showFinishButton}
            pauseHandler={this.props.pauseHandler}
            hidePauseButton={this.props.hidePauseButton}
          />
          {this.getChannelId() && (
            <AnimationPicker
              channelId={this.getChannelId()}
              allowedExtensions=".png,.jpg,.jpeg"
              libraryManifest={this.state.libraryManifest}
              hideUploadOption={this.props.spriteLab}
              hideAnimationNames={this.props.spriteLab}
              navigable={navigable}
              defaultQuery={this.props.isBackground ? defaultQuery : undefined}
              hideBackgrounds={hideBackgrounds}
              canDraw={canDraw}
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
        hideBackgrounds={this.props.spriteLab}
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
  spriteLab: state.pageConstants.isBlockly,
  isBackground: state.animationPicker.isBackground
}))(P5LabView);
