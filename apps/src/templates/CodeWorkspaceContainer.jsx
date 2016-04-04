/* global appOptions */

/**
 * A non-protected div that wraps our ProtectedStatefulDiv codeWorkspace, allowing
 * us to position it vertically. Causes resize events to fire when receiving new props
 */

var Radium = require('radium');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv.jsx');
var utils = require('../utils');

var styles = {
  main: {
    position: 'absolute',
    // left gets set externally
    // top is set in render
    right: 0,
    bottom: 0,
    marginLeft: 15, // margin gives space for vertical resizer
  },
  mainRTL: {
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
    left: 0,
    marginLeft: 0
  }
};

var CodeWorkspaceContainer = React.createClass({
  propTypes: {
    topMargin: React.PropTypes.number.isRequired,
    generateCodeWorkspaceHtml: React.PropTypes.func.isRequired,
    onSizeChange: React.PropTypes.func
  },

  componentDidUpdate: function (prevProps) {
    if (this.props.onSizeChange && this.props.topMargin !== prevProps.topMargin) {
      this.props.onSizeChange();
    }
  },

  render: function () {
    // TODO - These probably better belong as props (and possibly in the redux
    // store), but I'd like to get the quick and dirty fix in ASAP as RTL is
    // currently broken
    var noViz = appOptions.app === 'jigsaw';
    var rtl = document.querySelector('html').getAttribute('dir') === 'rtl';

    var mainStyle = [styles.main, {
      top: this.props.topMargin
    },
      noViz && styles.noVisualization,
      rtl && styles.mainRTL
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
