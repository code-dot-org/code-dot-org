import React, {PropTypes} from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';
import {isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';
import StudioAppWrapper from './StudioAppWrapper';
import InstructionsWithWorkspace from './instructions/InstructionsWithWorkspace';
import CodeWorkspace from './CodeWorkspace';
import Overlay from './Overlay';
import VisualizationResizeBar from '../lib/ui/VisualizationResizeBar';

/**
 * Top-level React wrapper for our standard blockly apps.
 */
const AppView = React.createClass({
  propTypes: {
    hideSource: PropTypes.bool.isRequired,
    isResponsive: PropTypes.bool.isRequired,
    pinWorkspaceToBottom: PropTypes.bool.isRequired,

    // not provided by redux
    visualizationColumn: PropTypes.element,
    onMount: PropTypes.func.isRequired,
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    const visualizationColumnClassNames = classNames({
      responsive: this.props.isResponsive,
      pin_bottom: !this.props.hideSource && this.props.pinWorkspaceToBottom
    });

    return (
      <StudioAppWrapper>
        <Overlay />
        <div id="visualizationColumn" className={visualizationColumnClassNames}>
          {this.props.visualizationColumn}
        </div>
        <VisualizationResizeBar/>
        <InstructionsWithWorkspace>
          <CodeWorkspace/>
        </InstructionsWithWorkspace>
      </StudioAppWrapper>
    );
  }
});
module.exports = connect(state => ({
  hideSource: state.pageConstants.hideSource,
  isResponsive: isResponsiveFromState(state),
  pinWorkspaceToBottom: state.pageConstants.pinWorkspaceToBottom
}))(AppView);
