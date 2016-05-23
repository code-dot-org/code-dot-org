'use strict';

import classNames from 'classnames';
import {connect} from 'react-redux';
import {isResponsiveFromState} from '../templates/ProtectedVisualizationDiv';
var _ = require('../lodash');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
var StudioAppWrapper = require('./StudioAppWrapper');
var CodeWorkspaceContainer = require('./CodeWorkspaceContainer');

/**
 * Top-level React wrapper for our standard blockly apps.
 */
var AppView = React.createClass({
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
        <div id="visualizationColumn" className={visualizationColumnClassNames}>
          {this.props.visualizationColumn}
        </div>
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
        <CodeWorkspaceContainer topMargin={0}/>
      </StudioAppWrapper>
    );
  }
});
module.exports = connect(state => ({
  hideSource: state.pageConstants.hideSource,
  isResponsive: isResponsiveFromState(state),
  pinWorkspaceToBottom: state.pageConstants.pinWorkspaceToBottom
}))(AppView);
