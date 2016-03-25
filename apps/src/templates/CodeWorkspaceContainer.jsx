/**
 * A non-protected div that wraps our ProtectedStatefulDiv codeWorkspace, allowing
 * us to position it vertically. Causes resize events to fire when receiving new props
 */

var _ = require('lodash');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv.jsx');
var utils = require('../utils');

var styles = {
  main: {
    position: 'absolute',
    // left gets set externally :(
    // top is set in render
    right: 0,
    bottom: 0,
    marginLeft: 15, // margin gives space for vertical resizer
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
};

var CodeWorkspaceContainer = React.createClass({
  propTypes: {
    topMargin: React.PropTypes.number.isRequired,
    generateCodeWorkspaceHtml: React.PropTypes.func.isRequired,
    onSizeChange: React.PropTypes.func.isRequired
  },

  componentDidUpdate: function (prevProps) {
    if (this.props.topMargin !== prevProps.topMargin) {
      this.props.onSizeChange();
    }
  },

  render: function () {
    var mainStyle = _.assign({}, styles.main, {
      top: this.props.topMargin
    });

    return (
      <div style={mainStyle} className="workspace-right">
        <ProtectedStatefulDiv
            id="codeWorkspace"
            style={styles.codeWorkspace}
            className="applab">
          <ProtectedStatefulDiv
              id="codeWorkspaceWrapper"
              contentFunction={this.props.generateCodeWorkspaceHtml}/>
          {!this.props.isReadOnlyWorkspace &&
            <ProtectedStatefulDiv id="designWorkspace" style={styles.hidden} />}
        </ProtectedStatefulDiv>
      </div>
    );
  }
});
module.exports = CodeWorkspaceContainer;
