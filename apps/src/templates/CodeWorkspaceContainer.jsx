/* global appOptions */

/**
 * A non-protected div that wraps our ProtectedStatefulDiv codeWorkspace, allowing
 * us to position it vertically. Causes resize events to fire when receiving new props
 */

var Radium = require('radium');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
var utils = require('../utils');
var commonStyles = require('../commonStyles');

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
    marginRight: 15
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
    codeWorkspace: React.PropTypes.element.isRequired,
    onSizeChange: React.PropTypes.func
  },

  /**
   * Called externally
   * @returns {number} The height of the rendered contents in pixels
   */
  getContentHeight: function () {
    return $(ReactDOM.findDOMNode(this)).height();
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
      this.props.noVisualization && styles.noVisualization,
      this.props.isRtl && styles.mainRtl,
      this.props.noVisualization && this.props.isRtl && styles.noVisualizationRtl,
      this.props.hidden && commonStyles.hidden
    ];

    return (
      <div style={mainStyle} className="editor-column">
        <ProtectedStatefulDiv
            id="codeWorkspace"
            style={styles.codeWorkspace}>
          {this.props.codeWorkspace}
          <ProtectedStatefulDiv id="designWorkspace" style={styles.hidden}/>
        </ProtectedStatefulDiv>
      </div>
    );
  }
});
module.exports = Radium(CodeWorkspaceContainer);
