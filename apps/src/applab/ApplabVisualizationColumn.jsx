import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import * as dom from '../dom';
import BelowVisualization from '../templates/BelowVisualization';
import CompletionButton from '../templates/CompletionButton';
import GameButtons, {ResetButton} from '../templates/GameButtons';
import IFrameEmbedOverlay from '../templates/IFrameEmbedOverlay';
import {isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';
import * as color from '../util/color';

import {getAppWidth, APP_HEIGHT} from './constants';
import PhoneFrame from './PhoneFrame';
import PlaySpaceHeader from './PlaySpaceHeader';
import Visualization from './Visualization';

class ApplabVisualizationColumn extends React.Component {
  static propTypes = {
    isEditingProject: PropTypes.bool.isRequired,
    screenIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    onScreenCreate: PropTypes.func.isRequired,

    // Provided by redux
    isReadOnlyWorkspace: PropTypes.bool.isRequired,
    visualizationHasPadding: PropTypes.bool.isRequired,
    isShareView: PropTypes.bool.isRequired,
    isResponsive: PropTypes.bool.isRequired,
    nonResponsiveWidth: PropTypes.number.isRequired,
    isRunning: PropTypes.bool.isRequired,
    hideSource: PropTypes.bool.isRequired,
    playspacePhoneFrame: PropTypes.bool,
    isIframeEmbed: PropTypes.bool.isRequired,
    pinWorkspaceToBottom: PropTypes.bool.isRequired,
    isPaused: PropTypes.bool,
    awaitingContainedResponse: PropTypes.bool.isRequired,
    widgetMode: PropTypes.bool,
  };

  getClassNames() {
    const {
      visualizationHasPadding,
      isResponsive,
      widgetMode,
      hideSource,
      pinWorkspaceToBottom,
      isShareView,
    } = this.props;
    const chromelessShare = dom.isMobile() && !dom.isIPad();

    return classNames({
      with_padding: visualizationHasPadding,
      responsive: isResponsive && !widgetMode,
      pin_bottom: !hideSource && pinWorkspaceToBottom,

      // the below replicates some logic in StudioApp.handleHideSource_ which
      // imperatively changes the css classes depending on various share
      // parameters. This logic really shouldn't live in StudioApp, so I don't
      // feel too bad about copying it here, where it should really live...
      chromelessShare: chromelessShare && isShareView,
      wireframeShare: !chromelessShare && isShareView,
      widgetWidth: widgetMode,
    });
  }

  getCompletionButtonSyle() {
    return this.props.playspacePhoneFrame || this.props.widgetMode
      ? styles.phoneFrameCompletion
      : styles.completion;
  }

  render() {
    const {
      isIframeEmbed,
      isRunning,
      playspacePhoneFrame,
      isPaused,
      screenIds,
      awaitingContainedResponse,
      onScreenCreate,
      isResponsive,
      nonResponsiveWidth,
      isReadOnlyWorkspace,
      isEditingProject,
      widgetMode,
    } = this.props;

    const maxWidth = !isResponsive ? {maxWidth: nonResponsiveWidth} : {};

    let visualization = [
      <Visualization key="1" />,
      isIframeEmbed && !isRunning && (
        <IFrameEmbedOverlay
          key="2"
          appWidth={getAppWidth(this.props)}
          appHeight={APP_HEIGHT}
        />
      ),
    ];
    // Share view still uses image for phone frame. Would eventually like it to
    // use same code
    if (playspacePhoneFrame) {
      // wrap our visualization in a phone frame
      visualization = (
        <PhoneFrame
          isDark={isRunning}
          showSelector={!isRunning}
          isPaused={isPaused}
          screenIds={screenIds}
          runButtonDisabled={awaitingContainedResponse}
          onScreenCreate={onScreenCreate}
        >
          {visualization}
        </PhoneFrame>
      );
    }

    return (
      <div
        id="visualizationColumn"
        className={this.getClassNames()}
        style={maxWidth}
      >
        {!isReadOnlyWorkspace && (
          <PlaySpaceHeader
            isEditingProject={isEditingProject}
            screenIds={screenIds}
            onScreenCreate={onScreenCreate}
          />
        )}
        {visualization}
        {isIframeEmbed && !widgetMode && (
          <div style={styles.resetButtonWrapper}>
            <ResetButton hideText style={styles.resetButton} />
          </div>
        )}
        {/* The playspace phone frame has a run/reset button, so we don't need to render and hide
            run/reset in GameButtons */}
        <GameButtons noRunResetButton={playspacePhoneFrame}>
          {/* This div is used to control whether or not our finish button is centered*/}
          <div style={this.getCompletionButtonSyle()}>
            <CompletionButton />
          </div>
        </GameButtons>
        {awaitingContainedResponse && (
          <div style={styles.containedInstructions}>
            {i18n.predictionInstructions()}
          </div>
        )}
        <BelowVisualization />
      </div>
    );
  }
}

const styles = {
  completion: {
    display: 'inline',
  },
  phoneFrameCompletion: {
    display: 'block',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
  },
  resetButtonWrapper: {
    position: 'absolute',
    bottom: 5,
    textAlign: 'center',
    width: '100%',
  },
  resetButton: {
    display: 'inline-block',
    backgroundColor: color.dark_charcoal,
    borderColor: color.dark_charcoal,
    marginLeft: 5,
    position: 'relative',
    left: 2,
    bottom: 2,
  },
  containedInstructions: {
    marginTop: 10,
  },
};

export const UnconnectedApplabVisualizationColumn = ApplabVisualizationColumn;

export default connect(state => ({
  isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
  visualizationHasPadding: state.pageConstants.visualizationHasPadding,
  isShareView: state.pageConstants.isShareView,
  isResponsive: isResponsiveFromState(state),
  nonResponsiveWidth: state.pageConstants.nonResponsiveVisualizationColumnWidth,
  isIframeEmbed: state.pageConstants.isIframeEmbed,
  hideSource: state.pageConstants.hideSource,
  isRunning: state.runState.isRunning,
  awaitingContainedResponse: state.runState.awaitingContainedResponse,
  isPaused: state.runState.isDebuggerPaused,
  playspacePhoneFrame: state.pageConstants.playspacePhoneFrame,
  pinWorkspaceToBottom: state.pageConstants.pinWorkspaceToBottom,
  widgetMode: state.pageConstants.widgetMode,
}))(ApplabVisualizationColumn);
