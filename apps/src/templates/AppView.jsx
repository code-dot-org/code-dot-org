import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import ModalFunctionEditor from '@cdo/apps/blockly/components/ModalFunctionEditor';

import VisualizationResizeBar from '../code-studio/components/VisualizationResizeBar';
import {isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';

import CodeWorkspace from './CodeWorkspace';
import InstructionsWithWorkspace from './instructions/InstructionsWithWorkspace';
import Overlay from './Overlay';
import StudioAppWrapper from './StudioAppWrapper';

/**
 * Top-level React wrapper for our standard blockly apps.
 */
class AppView extends React.Component {
  static propTypes = {
    hideSource: PropTypes.bool.isRequired,
    isResponsive: PropTypes.bool.isRequired,
    pinWorkspaceToBottom: PropTypes.bool.isRequired,

    // not provided by redux
    visualizationColumn: PropTypes.element,
    onMount: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.onMount();
  }

  render() {
    const visualizationColumnClassNames = classNames({
      responsive: this.props.isResponsive,
      pin_bottom: !this.props.hideSource && this.props.pinWorkspaceToBottom,
    });

    return (
      <StudioAppWrapper>
        <Overlay />
        <div id="visualizationColumn" className={visualizationColumnClassNames}>
          {this.props.visualizationColumn}
        </div>
        <VisualizationResizeBar />
        <InstructionsWithWorkspace>
          <CodeWorkspace />
          <ModalFunctionEditor />
        </InstructionsWithWorkspace>
      </StudioAppWrapper>
    );
  }
}

export const UnconnectedAppView = AppView;
export default connect(state => ({
  hideSource: state.pageConstants.hideSource,
  isResponsive: isResponsiveFromState(state),
  pinWorkspaceToBottom: state.pageConstants.pinWorkspaceToBottom,
}))(UnconnectedAppView);
