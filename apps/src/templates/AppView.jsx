import React from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';
import {isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';
import ProtectedStatefulDiv from './ProtectedStatefulDiv';
import StudioAppWrapper from './StudioAppWrapper';
import InstructionsWithWorkspace from './instructions/InstructionsWithWorkspace';
import CodeWorkspace from './CodeWorkspace';
import Overlay from './Overlay';

/**
 * Top-level React wrapper for our standard blockly apps.
 */
const AppView = React.createClass({
  propTypes: {
    hideSource: React.PropTypes.bool.isRequired,
    isResponsive: React.PropTypes.bool.isRequired,
    pinWorkspaceToBottom: React.PropTypes.bool.isRequired,

    // not provided by redux
    visualizationColumn: React.PropTypes.element,
    onMount: React.PropTypes.func.isRequired,
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
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
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
