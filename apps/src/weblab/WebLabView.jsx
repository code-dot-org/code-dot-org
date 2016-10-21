/** @file Top-level view for GameLab */
/* global dashboard */

import React from 'react';
import StudioAppWrapper from '../templates/StudioAppWrapper';
import InstructionsWithWorkspace from '../templates/instructions/InstructionsWithWorkspace';
import msg from '@cdo/locale';
import weblabMsg from '@cdo/weblab/locale';
import PaneHeader from '../templates/PaneHeader';
var PaneButton = PaneHeader.PaneButton;

/**
 * Top-level React wrapper for WebLab
 */
const WebLabView = React.createClass({
  propTypes: {
    onUndo: React.PropTypes.func.isRequired,
    onRedo: React.PropTypes.func.isRequired,
    onToggleInspector: React.PropTypes.func.isRequired,
    onAddFileHTML: React.PropTypes.func.isRequired,
    onAddFileCSS: React.PropTypes.func.isRequired,
    onAddFileImage: React.PropTypes.func.isRequired,
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
      width: '100%',
      height: 'calc(100% - 20px)'
    };

    return (
      <StudioAppWrapper>
        <InstructionsWithWorkspace>
          <div>
            <PaneHeader hasFocus={true} id="headers">
              <div>
              <PaneButton
                iconClass="fa fa-plus-circle"
                leftJustified={true}
                headerHasFocus={true}
                isRtl={false}
                onClick={this.props.onAddFileHTML}
                label={weblabMsg.addHTMLButton()}
              />
              <PaneButton
                iconClass="fa fa-plus-circle"
                leftJustified={true}
                headerHasFocus={true}
                isRtl={false}
                onClick={this.props.onAddFileCSS}
                label={weblabMsg.addCSSButton()}
              />
              <PaneButton
                iconClass="fa fa-plus-circle"
                leftJustified={true}
                headerHasFocus={true}
                isRtl={false}
                onClick={this.props.onAddFileImage}
                label={weblabMsg.addImageButton()}
              />
              <PaneButton
                id="versions-header"
                iconClass="fa fa-clock-o"
                leftJustified={true}
                headerHasFocus={true}
                isRtl={false}
                label={msg.showVersionsHeader()}
              />
              <PaneButton
                iconClass="fa fa-mouse-pointer"
                leftJustified={false}
                headerHasFocus={true}
                isRtl={false}
                onClick={this.props.onToggleInspector}
                label={weblabMsg.toggleInspector()}
              />
              </div>
            </PaneHeader>
            <iframe
              className="weblab-host"
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
