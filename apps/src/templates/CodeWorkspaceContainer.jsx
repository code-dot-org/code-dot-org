/* global appOptions */

/**
 * A non-protected div that wraps our ProtectedStatefulDiv codeWorkspace, allowing
 * us to position it vertically. Causes resize events to fire when receiving new props
 */

import $ from 'jquery';
var React = require('react');
var ReactDOM = require('react-dom');
var Radium = require('radium');
var utils = require('../utils');
var commonStyles = require('../commonStyles');
import { connect } from 'react-redux';

var styles = {
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
    zIndex: 0
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

var CodeWorkspaceContainer = React.createClass({
  propTypes: {
    // redux provided
    hidden: React.PropTypes.bool.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    pinWorkspaceToBottom: React.PropTypes.bool.isRequired,
    noVisualization: React.PropTypes.bool.isRequired,

    // not in redux
    topMargin: React.PropTypes.number.isRequired,
  },

  /**
   * Called externally
   * @returns {number} The height of the rendered contents in pixels
   */
  getRenderedHeight: function () {
    return $(ReactDOM.findDOMNode(this)).height();
  },

  componentDidUpdate: function (prevProps) {
    if (this.props.topMargin !== prevProps.topMargin) {
      utils.fireResizeEvent();
    }
  },

  render: function () {
    var mainStyle = [styles.main, {
      top: this.props.topMargin
    },
      this.props.noVisualization && styles.noVisualization,
      this.props.isRtl && styles.mainRtl,
      this.props.noVisualization && this.props.isRtl && styles.noVisualizationRtl,
      this.props.hidden && commonStyles.hidden
    ];

    return (
      <div style={mainStyle} className="editor-column">
        <div id="codeWorkspace" style={styles.codeWorkspace}>
          {this.props.children}
        </div>
      </div>
    );
  }
});
module.exports = connect(state => ({
  hidden: state.pageConstants.hideSource,
  isRtl: state.pageConstants.localeDirection === 'rtl',
  noVisualization: state.pageConstants.noVisualization,
  pinWorkspaceToBottom: state.pageConstants.pinWorkspaceToBottom
}), undefined, null, { withRef: true }
)(Radium(CodeWorkspaceContainer));
