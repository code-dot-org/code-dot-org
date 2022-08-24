/**
 * A non-protected div that wraps our ProtectedStatefulDiv codeWorkspace, allowing
 * us to position it vertically. Causes resize events to fire when receiving new props
 */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import {connect} from 'react-redux';
import * as utils from '../utils';
import commonStyles from '../commonStyles';
import WorkspaceAlert from '@cdo/apps/code-studio/components/WorkspaceAlert';
import {displayWorkspaceAlertOff} from '../code-studio/projectRedux';

class CodeWorkspaceContainer extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    style: PropTypes.object,

    // Provided by redux
    hidden: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    noVisualization: PropTypes.bool.isRequired,
    displayWorkspaceAlertOff: PropTypes.func,
    displayWorkspaceAlert: PropTypes.bool.isRequired,
    errorMsg: PropTypes.string.isRequired
  };

  /**
   * Called externally
   * @returns {number} The height of the rendered contents in pixels
   */
  getRenderedHeight() {
    return $(ReactDOM.findDOMNode(this)).height();
  }

  componentDidUpdate(prevProps) {
    if (this.props.style?.top !== prevProps.style?.top) {
      utils.fireResizeEvent();
    }
  }

  render() {
    const {hidden, isRtl, noVisualization, children, style} = this.props;
    const mainStyle = {
      ...styles.main,
      ...(noVisualization && styles.noVisualization),
      ...(isRtl && styles.mainRtl),
      ...(noVisualization && isRtl && styles.noVisualizationRtl),
      ...(hidden && commonStyles.hidden),
      ...style
    };

    return (
      <div style={mainStyle} className="editor-column">
        <div id="codeWorkspace" style={styles.codeWorkspace}>
          {children}
          {false && this.props.displayWorkspaceAlert && (
            <WorkspaceAlert
              type="error"
              onClose={this.props.displayWorkspaceAlertOff}
              isBlockly={false}
              displayBottom={true}
            >
              <div>{this.props.errorMsg}</div>
            </WorkspaceAlert>
          )}
        </div>
      </div>
    );
  }
}

export const TestableCodeWorkspaceContainer = Radium(CodeWorkspaceContainer);
export default connect(
  state => ({
    hidden:
      state.pageConstants.hideSource &&
      !state.pageConstants.visualizationInWorkspace,
    isRtl: state.isRtl,
    noVisualization: state.pageConstants.noVisualization,
    displayWorkspaceAlert: state.project.displayWorkspaceAlert,
    errorMsg: state.project.errorMsg
  }),
  dispatch => ({
    displayWorkspaceAlertOff: () => dispatch(displayWorkspaceAlertOff())
  }),
  null,
  {withRef: true}
)(CodeWorkspaceContainer);

const styles = {
  main: {
    position: 'absolute',
    // left gets set externally :(
    top: 0,
    right: 0,
    bottom: 0,
    marginLeft: 15 // margin gives space for vertical resizer
  },
  mainRtl: {
    right: undefined,
    left: 0,
    marginLeft: 0,
    marginRight: 15
  },
  codeWorkspace: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    borderBottomStyle: 'none',
    borderRightStyle: 'none',
    borderLeftStyle: 'none',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: '#ddd'
  },
  noVisualization: {
    // Overrides left set in css
    left: 0,
    marginLeft: 0
  },
  noVisualizationRtl: {
    right: 0
  }
};
