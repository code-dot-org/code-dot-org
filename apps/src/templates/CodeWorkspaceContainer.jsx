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

class CodeWorkspaceContainer extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    style: PropTypes.object,

    // Provided by redux
    hidden: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    noVisualization: PropTypes.bool.isRequired,
  };

  state = {
    showDetails: false,
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

  addAlien() {
    const w = Blockly.getMainWorkspace();
    const b = w.newBlock('Dancelab_makeAnonymousDanceSprite');
    b.initSvg();
    w.render() ;
    const p = w.getBlocksByType('Dancelab_whenSetup')
    const pc = p[0].getChildren()[0].nextConnection;
    const bc = b.previousConnection;
    pc.connect(bc);
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
        <div
          id="llm"
          style={{
            backgroundColor: 'white',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '90px',
          }}
        >
          <div
            style={{
              width: '100%',
              height: 30,
              backgroundColor: '#292f36',
              color: 'white',
              lineHeight: '33px',
              paddingLeft: 35,
            }}
          >
            AI
          </div>
          <div style={{fontSize: 18}}>
            {!this.state.showDetails && (
              <div>
                <div
                  style={styles.aiChoice}
                  onClick={() => this.setState({showDetails: 'dancer'})}
                >
                  Create a dancer...
                </div>
                <div
                  style={styles.aiChoice}
                  onClick={() => this.setState({showDetails: 'background'})}
                >
                  Create a background...
                </div>
                <div style={styles.aiChoice}>Create an effect...</div>
              </div>
            )}

            {this.state.showDetails === 'dancer' && (
              <div>
                <div style={{...styles.aiChoice, ...styles.aiSelectedChoice}}>
                  Create a dancer who looks like a
                </div>
                <div
                  style={styles.aiChoice}
                  onClick={() => {
                    this.setState({showDetails: false});
                    this.addAlien();
                  }}
                >
                  alien
                </div>
                <div style={styles.aiChoice}>robot</div>
                <div style={styles.aiChoice}>frog</div>
              </div>
            )}

            {this.state.showDetails === 'background' && (
              <div>
                <div style={{...styles.aiChoice, ...styles.aiSelectedChoice}}>
                  Create a background that looks like a
                </div>
                <div
                  style={styles.aiChoice}
                  onClick={() => this.setState({showDetails: false})}
                >
                  kaleidoscope
                </div>
                <div style={styles.aiChoice}>rainbow</div>
                <div style={styles.aiChoice}>laser</div>
              </div>
            )}
          </div>
        </div>
        <div id="codeWorkspace" style={styles.codeWorkspace}>
          {children}
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
    opacity: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 90,
    borderBottomStyle: 'none',
    borderRightStyle: 'none',
    borderLeftStyle: 'none',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: '#ddd',
    //pointerEvents: 'none',
    height: 'calc(100% - 90px)',
  },
  noVisualization: {
    // Overrides left set in css
    left: 0,
    marginLeft: 0,
  },
  noVisualizationRtl: {
    right: 0,
  },
  aiChoice: {
    backgroundColor: '#5b8df2',
    padding: 5,
    borderRadius: 5,
    padding: '10px 25px',
    color: 'white',
    margin: 8,
    display: 'inline-block',
    cursor: 'pointer',
  },
  aiSelectedChoice: {
    //color: 'black',
    backgroundColor: 'rgb(67 105 182)',
  },
};
