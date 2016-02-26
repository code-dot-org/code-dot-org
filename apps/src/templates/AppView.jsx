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
    return <ProtectedStatefulDiv renderContents={this.props.renderCodeApp} />;
  }
});
module.exports = AppView;
