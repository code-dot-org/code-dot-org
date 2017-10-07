/** @file Top-level view for GameLab */
import React, {PropTypes} from 'react';
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
class WebLabView extends React.Component {
  static propTypes = {
    isProjectLevel: PropTypes.bool.isRequired,
    isReadOnlyWorkspace: PropTypes.bool.isRequired,
    isInspectorOn: PropTypes.bool.isRequired,
    onUndo: PropTypes.func.isRequired,
    onRedo: PropTypes.func.isRequired,
    onRefreshPreview: PropTypes.func.isRequired,
    onToggleInspector: PropTypes.func.isRequired,
    onAddFileHTML: PropTypes.func.isRequired,
    onAddFileCSS: PropTypes.func.isRequired,
    onAddFileImage: PropTypes.func.isRequired,
    onMount: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.onMount();
  }

  render() {
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
}

export default connect(state => ({
  isProjectLevel: state.pageConstants.isProjectLevel,
  isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
  isInspectorOn: state.inspectorOn,
}))(WebLabView);
