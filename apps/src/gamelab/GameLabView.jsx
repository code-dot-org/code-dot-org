/** @file Top-level view for GameLab */
/* global dashboard */
import classNames from 'classnames';
import {connect} from 'react-redux';
import React, {PropTypes} from 'react';
import AnimationTab from './AnimationTab/AnimationTab';
import StudioAppWrapper from '../templates/StudioAppWrapper';
import ErrorDialogStack from './ErrorDialogStack';
import AnimationJsonViewer from './AnimationJsonViewer';
import {GameLabInterfaceMode, GAME_WIDTH, GAME_HEIGHT} from './constants';
import GameLabVisualizationHeader from './GameLabVisualizationHeader';
import GameLabVisualizationColumn from './GameLabVisualizationColumn';
import InstructionsWithWorkspace from '../templates/instructions/InstructionsWithWorkspace';
import {isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';
import CodeWorkspace from '../templates/CodeWorkspace';
import {allowAnimationMode, showVisualizationHeader} from './stateQueries';
import IFrameEmbedOverlay from '../templates/IFrameEmbedOverlay';
import LocationPicker from './LocationPicker';
import VisualizationResizeBar from "../lib/ui/VisualizationResizeBar";


/**
 * Top-level React wrapper for GameLab
 */
class GameLabView extends React.Component {
  static propTypes = {
    // Provided manually
    showFinishButton: PropTypes.bool.isRequired,
    onMount: PropTypes.func.isRequired,
    // Provided by Redux
    interfaceMode: PropTypes.oneOf([GameLabInterfaceMode.CODE, GameLabInterfaceMode.ANIMATION]).isRequired,
    isResponsive: PropTypes.bool.isRequired,
    hideSource: PropTypes.bool.isRequired,
    pinWorkspaceToBottom: PropTypes.bool.isRequired,
    allowAnimationMode: PropTypes.bool.isRequired,
    showVisualizationHeader: PropTypes.bool.isRequired,
    isIframeEmbed: PropTypes.bool.isRequired,
    isRunning: PropTypes.bool.isRequired,
  };

  getChannelId() {
    if (dashboard && dashboard.project) {
      return dashboard.project.getCurrentId();
    }
    return undefined;
  }

  componentDidMount() {
    this.props.onMount();
  }

  renderCodeMode() {
    const {interfaceMode, isResponsive, hideSource, pinWorkspaceToBottom,
           showFinishButton} = this.props;

    // Code mode contains protected (non-React) content.  We have to always
    // render it, so when we're not in code mode use CSS to hide it.
    const codeModeStyle = {
      display: interfaceMode !== GameLabInterfaceMode.CODE ? 'none' : undefined
    };

    const visualizationColumnStyle = {
      width: GAME_WIDTH
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
          {this.props.showVisualizationHeader && <GameLabVisualizationHeader />}
          <GameLabVisualizationColumn finishButton={showFinishButton}/>
        </div>
        {this.props.isIframeEmbed &&
         !this.props.isRunning &&
         <IFrameEmbedOverlay
           appWidth={GAME_WIDTH}
           appHeight={GAME_HEIGHT}
           style={{top: 79, left: 17}}
           playButtonStyle={{top: 620, left: 179}}
         />}
        <VisualizationResizeBar/>
        <InstructionsWithWorkspace>
          <CodeWorkspace withSettingsCog/>
        </InstructionsWithWorkspace>
      </div>
    );
  }

  renderAnimationMode() {
    const {allowAnimationMode, interfaceMode} = this.props;
    return allowAnimationMode && interfaceMode === GameLabInterfaceMode.ANIMATION ?
        <AnimationTab channelId={this.getChannelId()} /> :
        undefined;
  }

  render() {
    return (
      <StudioAppWrapper>
        {this.renderCodeMode()}
        {this.renderAnimationMode()}
        <ErrorDialogStack/>
        <AnimationJsonViewer/>
        <LocationPicker/>
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
}))(GameLabView);
