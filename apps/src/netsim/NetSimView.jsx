'use strict';

var React = require('react');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var StudioAppWrapper = require('../templates/StudioAppWrapper');

/**
 * Top-level React wrapper for our NetSim app.
 */
var NetSimView = React.createClass({
  propTypes: {
    generateCodeAppHtml: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    return (
      <StudioAppWrapper>
        <ProtectedStatefulDiv contentFunction={this.props.generateCodeAppHtml} />
      </StudioAppWrapper>
    );
  }
});
module.exports = NetSimView;
