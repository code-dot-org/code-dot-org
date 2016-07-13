/** @file Top-level view for GameLab */
/* global dashboard */
'use strict';

import classNames from 'classnames';
import {connect} from 'react-redux';
import React from 'react';
var _ = require('lodash');
// var AnimationTab = require('./AnimationTab/AnimationTab');
var StudioAppWrapper = require('../templates/StudioAppWrapper');
// var ErrorDialogStack = require('./ErrorDialogStack');
// var gameLabConstants = require('./constants');
// var GameLabVisualizationHeader = require('./GameLabVisualizationHeader');
// var GameLabVisualizationColumn = require('./GameLabVisualizationColumn');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
//var InstructionsWithWorkspace = require('../templates/instructions/InstructionsWithWorkspace');
import {isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';
import CodeWorkspace from '../templates/CodeWorkspace';

// var GameLabInterfaceMode = gameLabConstants.GameLabInterfaceMode;
// var GAME_WIDTH = gameLabConstants.GAME_WIDTH;

/**
 * Top-level React wrapper for WebLab
 */
var WebLabView = React.createClass({
  propTypes: {
    // interfaceMode: React.PropTypes.oneOf([GameLabInterfaceMode.CODE, GameLabInterfaceMode.ANIMATION]).isRequired,
    // isEmbedView: React.PropTypes.bool.isRequired,
    // isResponsive: React.PropTypes.bool.isRequired,
    // isShareView: React.PropTypes.bool.isRequired,
    // showFinishButton: React.PropTypes.bool.isRequired,
    // hideSource: React.PropTypes.bool.isRequired,
    onMount: React.PropTypes.func.isRequired
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

  shouldShowHeader: function () {
    return !(this.props.isEmbedView || this.props.isShareView);
  },

  render: function () {
    return (
      <StudioAppWrapper>
        <div>
          <a id="undo-link" href="#"> Undo </a>
          |
          <a id="redo-link" href="#"> Redo </a>
          |
          <a id="preview-link" href="#"> Preview </a>
          |
          <a id="tutorial-link" href="#"> Tutorial </a>
          <br/>
          <br/>
          <iframe src="/bramble/hosted2.html" frameborder="0"
            width="100%" height="560px" scrolling="no" />
        </div>
      </StudioAppWrapper>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
  //  hideSource: state.pageConstants.hideSource,
  //  interfaceMode: state.interfaceMode,
  //  isEmbedView: state.pageConstants.isEmbedView,
  //  isResponsive: isResponsiveFromState(state),
  //  isShareView: state.pageConstants.isShareView,
  //  pinWorkspaceToBottom: state.pageConstants.pinWorkspaceToBottom
  };
})(WebLabView);
