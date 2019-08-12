import GameButtons, {ResetButton} from '../templates/GameButtons';
import IFrameEmbedOverlay from '../templates/IFrameEmbedOverlay';
import * as color from '../util/color';
import {WIDGET_WIDTH, APP_WIDTH, APP_HEIGHT} from './constants';
import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import Visualization from './Visualization';
import CompletionButton from '../templates/CompletionButton';
import PlaySpaceHeader from './PlaySpaceHeader';
import PhoneFrame from './PhoneFrame';
import BelowVisualization from '../templates/BelowVisualization';
import {isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';
import {connect} from 'react-redux';
import classNames from 'classnames';
import i18n from '@cdo/locale';
import * as dom from '../dom';

const styles = {
  completion: {
    display: 'inline'
  },
  phoneFrameCompletion: {
    display: 'block',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center'
  },
  resetButtonWrapper: {
    position: 'absolute',
    bottom: 5,
    textAlign: 'center',
    width: '100%'
  },
  resetButton: {
    display: 'inline-block',
    backgroundColor: color.dark_charcoal,
    borderColor: color.dark_charcoal,
    marginLeft: 5,
    position: 'relative',
    left: 2,
    bottom: 2
  },
  containedInstructions: {
    marginTop: 10
  }
};

/**
 * Equivalent of visualizationColumn.html.ejs. Initially only supporting
 * portions used by App Lab
 */
class ApplabVisualizationColumn extends React.Component {
  static propTypes = {
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

    // non redux backed
    isEditingProject: PropTypes.bool.isRequired,
    screenIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    onScreenCreate: PropTypes.func.isRequired
  };

  state = {renderedWidth: this.props.widgetMode ? WIDGET_WIDTH : APP_WIDTH};

  getClassNames() {
    if (this.props.widgetMode) {
      return 'widgetWidth';
    }

    const chromelessShare = dom.isMobile() && !dom.isIPad();
    return classNames({
      with_padding: this.props.visualizationHasPadding,
      responsive: this.props.isResponsive,
      pin_bottom: !this.props.hideSource && this.props.pinWorkspaceToBottom,

      // the below replicates some logic in StudioApp.handleHideSource_ which
      // imperatively changes the css classes depending on various share
      // parameters. This logic really shouldn't live in StudioApp, so I don't
      // feel too bad about copying it here, where it should really live...
      chromelessShare: chromelessShare && this.props.isShareView,
      wireframeShare: !chromelessShare && this.props.isShareView
    });
  }

  getCompletionButtonSyle() {
    return this.props.playspacePhoneFrame || this.props.widgetMode
      ? styles.phoneFrameCompletion
      : styles.completion;
  }

  render() {
    let visualization = [
      <Visualization key="1" />,
      this.props.isIframeEmbed && !this.props.isRunning && (
        <IFrameEmbedOverlay
          key="2"
          appWidth={this.state.renderedWidth}
          appHeight={APP_HEIGHT}
        />
      )
    ];
    // Share view still uses image for phone frame. Would eventually like it to
    // use same code
    if (this.props.playspacePhoneFrame) {
      // wrap our visualization in a phone frame
      visualization = (
        <PhoneFrame
          isDark={this.props.isRunning}
          showSelector={!this.props.isRunning}
          isPaused={this.props.isPaused}
          screenIds={this.props.screenIds}
          runButtonDisabled={this.props.awaitingContainedResponse}
          onScreenCreate={this.props.onScreenCreate}
        >
          {visualization}
        </PhoneFrame>
      );
    }

    return (
      <div
        id="visualizationColumn"
        className={this.getClassNames()}
        style={[
          !this.props.isResponsive && {maxWidth: this.props.nonResponsiveWidth}
        ]}
      >
        {!this.props.isReadOnlyWorkspace && (
          <PlaySpaceHeader
            isEditingProject={this.props.isEditingProject}
            screenIds={this.props.screenIds}
            onScreenCreate={this.props.onScreenCreate}
          />
        )}
        {visualization}
        {this.props.isIframeEmbed && !this.props.widgetMode && (
          <div style={styles.resetButtonWrapper}>
            <ResetButton hideText style={styles.resetButton} />
          </div>
        )}
        <GameButtons>
          {/* This div is used to control whether or not our finish button is centered*/}
          <div style={this.getCompletionButtonSyle()}>
            <CompletionButton />
          </div>
        </GameButtons>
        {this.props.awaitingContainedResponse && (
          <div style={styles.containedInstructions}>
            {i18n.predictionInstructions()}
          </div>
        )}
        <BelowVisualization />
      </div>
    );
  }
}

export const UnconnectedApplabVisualizationColumn = ApplabVisualizationColumn;

export default connect(function propsFromStore(state) {
  return {
    isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    visualizationHasPadding: state.pageConstants.visualizationHasPadding,
    isShareView: state.pageConstants.isShareView,
    isResponsive: isResponsiveFromState(state),
    nonResponsiveWidth:
      state.pageConstants.nonResponsiveVisualizationColumnWidth,
    isIframeEmbed: state.pageConstants.isIframeEmbed,
    hideSource: state.pageConstants.hideSource,
    isRunning: state.runState.isRunning,
    awaitingContainedResponse: state.runState.awaitingContainedResponse,
    isPaused: state.runState.isDebuggerPaused,
    playspacePhoneFrame: state.pageConstants.playspacePhoneFrame,
    pinWorkspaceToBottom: state.pageConstants.pinWorkspaceToBottom,
    widgetMode: state.pageConstants.widgetMode
  };
})(Radium(ApplabVisualizationColumn));
