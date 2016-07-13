/** @file Top-level view for GameLab */
/* global dashboard */
import classNames from 'classnames';
import {connect} from 'react-redux';
import React from 'react';
import AnimationTab from './AnimationTab/AnimationTab';
import StudioAppWrapper from '../templates/StudioAppWrapper';
import ErrorDialogStack from './ErrorDialogStack';
import {GameLabInterfaceMode, GAME_WIDTH} from './constants';
import GameLabVisualizationHeader from './GameLabVisualizationHeader';
import GameLabVisualizationColumn from './GameLabVisualizationColumn';
import ProtectedStatefulDiv from '../templates/ProtectedStatefulDiv';
import InstructionsWithWorkspace from '../templates/instructions/InstructionsWithWorkspace';
import {isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';
import CodeWorkspace from '../templates/CodeWorkspace';

/**
 * Top-level React wrapper for GameLab
 */
const GameLabView = React.createClass({
  propTypes: {
    // Provided manually
    showFinishButton: React.PropTypes.bool.isRequired,
    onMount: React.PropTypes.func.isRequired,
    // Provided by Redux
    interfaceMode: React.PropTypes.oneOf([GameLabInterfaceMode.CODE, GameLabInterfaceMode.ANIMATION]).isRequired,
    isEmbedView: React.PropTypes.bool.isRequired,
    isResponsive: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    hideSource: React.PropTypes.bool.isRequired,
    pinWorkspaceToBottom: React.PropTypes.bool.isRequired,
    showAnimationMode: React.PropTypes.bool.isRequired
  },

  getChannelId() {
    if (dashboard && dashboard.project) {
      return dashboard.project.getCurrentId();
    }
    return undefined;
  },

  componentDidMount() {
    this.props.onMount();
  },

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
          {this.shouldShowHeader() && <GameLabVisualizationHeader />}
          <GameLabVisualizationColumn finishButton={showFinishButton}/>
        </div>
        <ProtectedStatefulDiv
            id="visualizationResizeBar"
            className="fa fa-ellipsis-v"
        />
        <InstructionsWithWorkspace>
          <CodeWorkspace/>
        </InstructionsWithWorkspace>
      </div>
    );
  },

  renderAnimationMode() {
    const {showAnimationMode, interfaceMode} = this.props;
    return showAnimationMode && interfaceMode === GameLabInterfaceMode.ANIMATION ?
        <AnimationTab channelId={this.getChannelId()} /> :
        undefined;
  },

  shouldShowHeader() {
    const {showAnimationMode, isEmbedView, isShareView} = this.props;
    return showAnimationMode && !(isEmbedView || isShareView);
  },

  render() {
    return (
      <StudioAppWrapper>
        {this.renderCodeMode()}
        {this.renderAnimationMode()}
        <ErrorDialogStack/>
      </StudioAppWrapper>
    );
  }
});
module.exports = connect(state => ({
  hideSource: state.pageConstants.hideSource,
  interfaceMode: state.interfaceMode,
  isEmbedView: state.pageConstants.isEmbedView,
  isResponsive: isResponsiveFromState(state),
  isShareView: state.pageConstants.isShareView,
  pinWorkspaceToBottom: state.pageConstants.pinWorkspaceToBottom,
  showAnimationMode: state.pageConstants.showAnimationMode
}))(GameLabView);
