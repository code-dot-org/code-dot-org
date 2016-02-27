'use strict';

var ProtectedStatefulDiv = require('./ProtectedStatefulDiv.jsx');

/**
 * Top-level React wrapper for our standard blockly apps.
 */
var AppView = React.createClass({
  propTypes: {
    renderCodeApp: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    return (
      <div>
        <ProtectedStatefulDiv renderContents={this.props.renderCodeApp} />
        <div className="clear"></div>
      </div>
    );
  }
});
module.exports = AppView;
