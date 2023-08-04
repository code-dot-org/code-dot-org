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
import {
  MODAL_EDITOR_ID,
  MODAL_EDITOR_NAME_INPUT_ID,
  MODAL_EDITOR_DELETE_ID,
  MODAL_EDITOR_CLOSE_ID,
} from '../blockly/addons/functionEditorConstants';

class CodeWorkspaceContainer extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    style: PropTypes.object,

    // Provided by redux
    hidden: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    noVisualization: PropTypes.bool.isRequired,
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
      ...style,
    };

    return (
      <div style={mainStyle} className="editor-column">
        <div id="codeWorkspace" style={styles.codeWorkspace}>
          {children}
          <div id={MODAL_EDITOR_ID} style={styles[MODAL_EDITOR_ID]}>
            <div
              className="toolbar"
              style={{
                zIndex: 1,
                position: 'absolute',
                left: '142px',
                top: '10px',
                width: '800px',
              }}
            >
              <div style={{float: 'right'}}>
                <button type="button" id={MODAL_EDITOR_DELETE_ID}>
                  delete
                </button>
                <button type="button" id={MODAL_EDITOR_CLOSE_ID}>
                  close
                </button>
              </div>
              <div
                id={`${MODAL_EDITOR_NAME_INPUT_ID}Container`}
                style={{padding: '10px', width: '100%'}}
              >
                <div style={{width: '100%'}}>Name your function: </div>
                <div>
                  <input
                    id={MODAL_EDITOR_NAME_INPUT_ID}
                    style={{width: '100%'}}
                    type="text"
                  />
                </div>
              </div>
              <div style={{padding: '10px', width: '100%'}}>
                <div style={{width: '100%'}}>
                  What is your function supposed to do?
                </div>
                <div>
                  <textarea
                    style={{width: '100%'}}
                    id="functionDescriptionText"
                    rows="2"
                  />
                </div>
              </div>
            </div>
          </div>
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
  }),
  undefined,
  null,
  {forwardRef: true}
)(CodeWorkspaceContainer);

const styles = {
  main: {
    position: 'absolute',
    // left gets set externally :(
    top: 0,
    right: 0,
    bottom: 0,
    marginLeft: 15, // margin gives space for vertical resizer
  },
  mainRtl: {
    right: undefined,
    left: 0,
    marginLeft: 0,
    marginRight: 15,
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
  },
  [MODAL_EDITOR_ID]: {
    display: 'none',
    position: 'absolute',
    // TODO: Calculate these values based on the size of the workspace
    top: '30px',
    left: '0px',
    zIndex: 1000,
    width: '100%',
    height: '100%',
    // border: '10px solid green',
    // borderRadius: '15px',
  },
  noVisualization: {
    // Overrides left set in css
    left: 0,
    marginLeft: 0,
  },
  noVisualizationRtl: {
    right: 0,
  },
};
