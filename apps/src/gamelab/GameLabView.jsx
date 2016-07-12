/** @file Top-level view for GameLab */
/* global dashboard */
'use strict';

import classNames from 'classnames';
import {connect} from 'react-redux';
import React from 'react';
var _ = require('lodash');
var AnimationTab = require('./AnimationTab/AnimationTab');
var StudioAppWrapper = require('../templates/StudioAppWrapper');
var ErrorDialogStack = require('./ErrorDialogStack');
var gameLabConstants = require('./constants');
var GameLabVisualizationHeader = require('./GameLabVisualizationHeader');
var GameLabVisualizationColumn = require('./GameLabVisualizationColumn');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var InstructionsWithWorkspace = require('../templates/instructions/InstructionsWithWorkspace');
import {isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';
import CodeWorkspace from '../templates/CodeWorkspace';

var GameLabInterfaceMode = gameLabConstants.GameLabInterfaceMode;
var GAME_WIDTH = gameLabConstants.GAME_WIDTH;

/**
 * Top-level React wrapper for GameLab
 */
var GameLabView = React.createClass({
  propTypes: {
    interfaceMode: React.PropTypes.oneOf([GameLabInterfaceMode.CODE, GameLabInterfaceMode.ANIMATION]).isRequired,
    isEmbedView: React.PropTypes.bool.isRequired,
    isResponsive: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    showFinishButton: React.PropTypes.bool.isRequired,
    hideSource: React.PropTypes.bool.isRequired,
    onMount: React.PropTypes.func.isRequired,
    showAnimationMode: React.PropTypes.bool.isRequired
  },

  getChannelId: function () {
    if (dashboard && dashboard.project) {
      return dashboard.project.getCurrentId();
    }
    return undefined;
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  renderCodeMode: function () {
    // Code mode contains protected (non-React) content.  We have to always
    // render it, so when we're not in code mode use CSS to hide it.
    var codeModeStyle = {};
    if (this.props.interfaceMode !== GameLabInterfaceMode.CODE) {
      codeModeStyle.display = 'none';
    }

    var visualizationColumnStyle = {
      width: GAME_WIDTH
    };

    const visualizationColumnClassNames = classNames({
      responsive: this.props.isResponsive,
      pin_bottom: !this.props.hideSource && this.props.pinWorkspaceToBottom
    });

    return (
      <div style={codeModeStyle}>
        <div
            id="visualizationColumn"
            className={visualizationColumnClassNames}
            style={visualizationColumnStyle}
        >
          {this.shouldShowHeader() && <GameLabVisualizationHeader />}
          <GameLabVisualizationColumn
              finishButton={this.props.showFinishButton}
          />
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

  renderAnimationMode: function () {
    const {showAnimationMode, interfaceMode} = this.props;
    return showAnimationMode && interfaceMode === GameLabInterfaceMode.ANIMATION ?
        <AnimationTab channelId={this.getChannelId()} /> :
        undefined;
  },

  shouldShowHeader: function () {
    const {showAnimationMode, isEmbedView, isShareView} = this.props;
    return showAnimationMode && !(isEmbedView || isShareView);
  },

  render: function () {
    return (
      <StudioAppWrapper>
        {this.renderCodeMode()}
        {this.renderAnimationMode()}
        <ErrorDialogStack/>
      </StudioAppWrapper>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    hideSource: state.pageConstants.hideSource,
    interfaceMode: state.interfaceMode,
    isEmbedView: state.pageConstants.isEmbedView,
    isResponsive: isResponsiveFromState(state),
    isShareView: state.pageConstants.isShareView,
    pinWorkspaceToBottom: state.pageConstants.pinWorkspaceToBottom,
    showAnimationMode: state.pageConstants.showAnimationMode
  };
})(GameLabView);
