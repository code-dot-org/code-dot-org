/**
 * A non-protected div that wraps our ProtectedStatefulDiv codeWorkspace, allowing
 * us to position it vertically. Causes resize events to fire when receiving new props
 */

import $ from 'jquery';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import { connect } from 'react-redux';
import * as utils from '../utils';
import commonStyles from '../commonStyles';

class CodeWorkspaceContainer extends React.Component {
  static propTypes = {
    // redux provided
    hidden: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    noVisualization: PropTypes.bool.isRequired,

    // not in redux
    topMargin: PropTypes.number.isRequired,
    children: PropTypes.node,
  };

  /**
   * Called externally
   * @returns {number} The height of the rendered contents in pixels
   */
  getRenderedHeight() {
    return $(ReactDOM.findDOMNode(this)).height();
  }

  componentDidUpdate(prevProps) {
    if (this.props.topMargin !== prevProps.topMargin) {
      utils.fireResizeEvent();
    }
  }

  render() {
    const {hidden, isRtl, noVisualization, topMargin, children} = this.props;
    const mainStyle = {
      ...styles.main,
      top: topMargin,
      ...(noVisualization && styles.noVisualization),
      ...(isRtl && styles.mainRtl),
      ...(noVisualization && isRtl && styles.noVisualizationRtl),
      ...(hidden && commonStyles.hidden),
    };

    return (
      <div style={mainStyle} className="editor-column">
        <div id="codeWorkspace" style={styles.codeWorkspace}>
          {children}
        </div>
      </div>
    );
  }
}

export const TestableCodeWorkspaceContainer = Radium(CodeWorkspaceContainer);
export default connect(state => ({
  hidden: state.pageConstants.hideSource && !state.pageConstants.visualizationInWorkspace,
  isRtl: state.isRtl,
  noVisualization: state.pageConstants.noVisualization,
}), undefined, null, { withRef: true }
)(CodeWorkspaceContainer);

const styles = {
  main: {
    position: 'absolute',
    // left gets set externally :(
    // top is set in render
    right: 0,
    bottom: 0,
    marginLeft: 15, // margin gives space for vertical resizer
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
    borderTopColor: '#ddd',
    overflow: 'hidden',
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
