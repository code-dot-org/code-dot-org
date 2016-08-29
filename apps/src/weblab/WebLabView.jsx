/** @file Top-level view for GameLab */
/* global dashboard */
'use strict';

import classNames from 'classnames';
import {connect} from 'react-redux';
import React from 'react';
var _ = require('lodash');
var StudioAppWrapper = require('../templates/StudioAppWrapper');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
import {isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';
import CodeWorkspace from '../templates/CodeWorkspace';

/**
 * Top-level React wrapper for WebLab
 */
var WebLabView = React.createClass({
  propTypes: {
    onUndo: React.PropTypes.func.isRequired,
    onRedo: React.PropTypes.func.isRequired,
    onShowPreview: React.PropTypes.func.isRequired,
    onShowTutorial: React.PropTypes.func.isRequired,
    onToggleInspector: React.PropTypes.func.isRequired,
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
    return true;
    // return !(this.props.isEmbedView || this.props.isShareView);
  },

  render: function () {
    return (
      <StudioAppWrapper>
        <div>
          <a id="undo-link" href="#" onClick={this.props.onUndo}> Undo </a>
          |
          <a id="redo-link" href="#" onClick={this.props.onRedo}> Redo </a>
          |
          <a id="preview-link" href="#" onClick={this.props.onShowPreview}> Preview </a>
          |
          <a id="tutorial-link" href="#" onClick={this.props.onShowTutorial}> Tutorial </a>
          |
          <a id="inspector-link" href="#" onClick={this.props.onToggleInspector}> Inspector </a>
          <br/>
          <br/>
          <iframe
            src="/weblab/host"
            frameBorder="0"
            width="100%"
            height="560px"
            scrolling="no"
          />
        </div>
      </StudioAppWrapper>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
  };
})(WebLabView);
