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
    this.refs.codeApp.getDOMNode().innerHTML = this.props.renderCodeApp();
    this.props.onMount();
  },

  render: function () {
    return <ProtectedStatefulDiv ref="codeApp" />;
  }
});
module.exports = AppView;
