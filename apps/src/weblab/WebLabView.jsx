/** @file Top-level view for GameLab */
/* global dashboard */

import React from 'react';
import {connect} from 'react-redux';
import StudioAppWrapper from '../templates/StudioAppWrapper';
import InstructionsWithWorkspace from '../templates/instructions/InstructionsWithWorkspace';
import msg from '@cdo/locale';
import weblabMsg from '@cdo/weblab/locale';
import PaneHeader, {PaneButton} from '../templates/PaneHeader';

/**
 * Top-level React wrapper for WebLab
 */
const WebLabView = React.createClass({
  propTypes: {
    isProjectLevel: React.PropTypes.bool.isRequired,
    isReadOnlyWorkspace: React.PropTypes.bool.isRequired,
    isInspectorOn: React.PropTypes.bool.isRequired,
    hideToolbar: React.PropTypes.bool.isRequired,
    onUndo: React.PropTypes.func.isRequired,
    onRedo: React.PropTypes.func.isRequired,
    onRefreshPreview: React.PropTypes.func.isRequired,
    onToggleInspector: React.PropTypes.func.isRequired,
    onAddFileHTML: React.PropTypes.func.isRequired,
    onAddFileCSS: React.PropTypes.func.isRequired,
    onAddFileImage: React.PropTypes.func.isRequired,
    onFinish: React.PropTypes.func.isRequired,
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
    var iframeStyles = {
      position: 'absolute',
      width: '100%'
    };
    var iframeScrolling;
    var iframeClass;
    var iframeBottom = this.props.isProjectLevel ? '20px' : '90px';
    if (this.props.hideToolbar) {
      iframeStyles.height = '100%';
      iframeScrolling = 'yes';
      iframeClass = '';
    } else {
      iframeStyles.height = `calc(100% - ${iframeBottom})`;
      iframeScrolling = 'no';
      iframeClass = 'weblab-host';
    }
    const finishStyles = {
      position: 'absolute',
      right: 0,
      bottom: 0,
    };

    return (
      <StudioAppWrapper>
        <InstructionsWithWorkspace>
          <div>
            {!this.props.hideToolbar &&
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
                </div>
              </PaneHeader>
            }
            <iframe
              className={iframeClass}
              src="/weblab/host"
              frameBorder="0"
              scrolling={iframeScrolling}
              style={iframeStyles}
            />
            {!this.props.isProjectLevel &&
              <button className="share" style={finishStyles} onClick={this.props.onFinish}>
                <img src="/blockly/media/1x1.gif"/>
                {msg.finish()}
              </button>
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
