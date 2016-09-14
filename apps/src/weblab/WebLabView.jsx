/** @file Top-level view for GameLab */
/* global dashboard */

import classNames from 'classnames';
import {connect} from 'react-redux';
import React from 'react';
import _ from 'lodash';
import StudioAppWrapper from '../templates/StudioAppWrapper';
import InstructionsWithWorkspace from '../templates/instructions/InstructionsWithWorkspace';

/**
 * Top-level React wrapper for WebLab
 */
const WebLabView = React.createClass({
  propTypes: {
    onUndo: React.PropTypes.func.isRequired,
    onRedo: React.PropTypes.func.isRequired,
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
  },

  render: function () {
    const iframeStyles = {
      position: 'absolute',
      top: '20px',
      width: '100%',
      height: 'calc(100% - 20px)'
    };

    return (
      <StudioAppWrapper>
        <InstructionsWithWorkspace>
          <div>
            <a id="undo-link" href="#" onClick={this.props.onUndo}> Undo </a>
            |
            <a id="redo-link" href="#" onClick={this.props.onRedo}> Redo </a>
            |
            <a id="inspector-link" href="#" onClick={this.props.onToggleInspector}> Inspector </a>
            <br/>
            <iframe
              src="/weblab/host"
              frameBorder="0"
              scrolling="no"
              style={iframeStyles}
            />
          </div>
        </InstructionsWithWorkspace>
      </StudioAppWrapper>
    );
  }
});

export default WebLabView;
