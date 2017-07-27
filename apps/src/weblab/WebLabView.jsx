/** @file Top-level view for GameLab */
/* global dashboard */

import React from 'react';
import {connect} from 'react-redux';
import StudioAppWrapper from '../templates/StudioAppWrapper';
import InstructionsWithWorkspace from '../templates/instructions/InstructionsWithWorkspace';
import msg from '@cdo/locale';
import weblabMsg from '@cdo/weblab/locale';
import PaneHeader, {PaneSection, PaneButton} from '../templates/PaneHeader';
import CompletionButton from '../templates/CompletionButton';

/**
 * Top-level React wrapper for WebLab
 */
const WebLabView = React.createClass({
  propTypes: {
    isProjectLevel: React.PropTypes.bool.isRequired,
    isReadOnlyWorkspace: React.PropTypes.bool.isRequired,
    isInspectorOn: React.PropTypes.bool.isRequired,
    onUndo: React.PropTypes.func.isRequired,
    onRedo: React.PropTypes.func.isRequired,
    onRefreshPreview: React.PropTypes.func.isRequired,
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
    let iframeBottom = this.props.isProjectLevel ? '20px' : '90px';
    let iframeStyles = {
      position: 'absolute',
      width: '100%',
      height: `calc(100% - ${iframeBottom})`
    };

    return (
      <StudioAppWrapper>
        <InstructionsWithWorkspace>
          <div>
            <PaneHeader hasFocus={true} id="headers">
              {!this.props.isReadOnlyWorkspace &&
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
                </div>
              }
              <div>
                {!this.props.isReadOnlyWorkspace &&
                  <div>
                    <PaneButton
                      id="versions-header"
                      iconClass="fa fa-clock-o"
                      leftJustified={true}
                      headerHasFocus={true}
                      isRtl={false}
                      label={msg.showVersionsHeader()}
                    />
                    <PaneButton
                      iconClass="fa fa-repeat"
                      leftJustified={false}
                      headerHasFocus={true}
                      isRtl={false}
                      onClick={this.props.onRefreshPreview}
                      label={weblabMsg.refreshPreview()}
                    />
                  </div>
                }
                <PaneButton
                  iconClass="fa fa-mouse-pointer"
                  leftJustified={false}
                  headerHasFocus={true}
                  isPressed={this.props.isInspectorOn}
                  pressedLabel={weblabMsg.toggleInspectorOff()}
                  isRtl={false}
                  onClick={this.props.onToggleInspector}
                  label={weblabMsg.toggleInspectorOn()}
                />
                {this.props.isReadOnlyWorkspace &&
                  <PaneSection id="workspace-header">
                    <span id="workspace-header-span">
                      {msg.readonlyWorkspaceHeader()}
                    </span>
                  </PaneSection>
                }
              </div>
            </PaneHeader>
            <iframe
              className="weblab-host"
              src="/weblab/host"
              frameBorder="0"
              scrolling="no"
              style={iframeStyles}
            />
            {!this.props.isProjectLevel &&
              <CompletionButton />
            }
          </div>
        </InstructionsWithWorkspace>
      </StudioAppWrapper>
    );
  }
});

export default connect(function propsFromStore(state) {
  return {
    isProjectLevel: state.pageConstants.isProjectLevel,
    isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    isInspectorOn: state.inspectorOn,
  };
})(WebLabView);
