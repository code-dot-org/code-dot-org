/**
 * A non-protected div that wraps our ProtectedStatefulDiv codeWorkspace. Causes
 * resize events to fire when receiving new props
 */

var _ = require('lodash');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv.jsx');
// TODO - as an action instead?
var utils = require('../utils');

var styles = {
  main: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0, // overriden in component
    bottom: 0
  },

  hidden: {
    display: 'none'
  },
  // same as #codeWorkspace + #codeWorkspace.pin_bottom from common.scss, with
  // the exception fo left: 400, which we let media queries from applab/styles.scss
  // deal with
  codeWorkspace: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    top: 0,
    marginLeft: 15,
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
      <div style={mainStyle}>
        <ProtectedStatefulDiv
            id="codeWorkspace"
            style={styles.codeWorkspace}
            className="applab workspace-right">
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
