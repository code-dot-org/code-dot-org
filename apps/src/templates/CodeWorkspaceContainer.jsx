/* global appOptions */

/**
 * A non-protected div that wraps our ProtectedStatefulDiv codeWorkspace, allowing
 * us to position it vertically. Causes resize events to fire when receiving new props
 */

var _ = require('../lodash');
var Radium = require('radium');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv.jsx');
var utils = require('../utils');
var sharedStyles = require('./sharedStyles');

var styles = {
  main: _.assign({
    position: 'absolute',
    // top is set in render
    right: 0,
    bottom: 0,
    marginLeft: 15, // margin gives space for vertical resizer
    }, sharedStyles.editorColumnMedia.width),
  // only some callers want to resize based on height media queries
  mainResizesOnHeight: sharedStyles.editorColumnMedia.height,
  mainRtl: {
    right: undefined,
    left: 0,
    marginRight: 15
  },
  hidden: {
    display: 'none'
  },
  codeWorkspace: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    border: 'none',
    borderTop: '1px solid #ddd',
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
    topMargin: React.PropTypes.number.isRequired,
    hidden: React.PropTypes.bool,
    isRtl: React.PropTypes.bool.isRequired,
    noVisualization: React.PropTypes.bool.isRequired,
    visualizationResizesOnHeight: React.PropTypes.bool,
    generateCodeWorkspaceHtml: React.PropTypes.func.isRequired,
    onSizeChange: React.PropTypes.func
  },

  componentDidUpdate: function (prevProps) {
    if (this.props.onSizeChange && this.props.topMargin !== prevProps.topMargin) {
      this.props.onSizeChange();
    }
  },

  render: function () {
    var mainStyle = [styles.main, {
      top: this.props.topMargin
    },
      this.props.visualizationResizesOnHeight && styles.mainResizesOnHeight,
      this.props.noVisualization && styles.noVisualization,
      this.props.isRtl && styles.mainRtl,
      this.props.noVisualization && this.props.isRtl && styles.noVisualizationRtl,
      this.props.hidden && styles.hidden
    ];

    return (
      <div style={mainStyle} className="editor-column">
        <ProtectedStatefulDiv
            id="codeWorkspace"
            style={styles.codeWorkspace}>
          <ProtectedStatefulDiv
              id="codeWorkspaceWrapper"
              contentFunction={this.props.generateCodeWorkspaceHtml}/>
          <ProtectedStatefulDiv id="designWorkspace" style={styles.hidden}/>
        </ProtectedStatefulDiv>
      </div>
    );
  }
});
module.exports = Radium(CodeWorkspaceContainer);
