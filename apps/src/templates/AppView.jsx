'use strict';

/**
 * Top-level React wrapper for our standard blockly apps.
 */
var AppView = React.createClass({
  propTypes: {
    renderCodeApp: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.refs.placeholder.getDOMNode().innerHTML = this.props.renderCodeApp();
    this.props.onMount();
  },

  render: function () {
    return <div ref="placeholder"></div>;
  }
});
module.exports = AppView;
