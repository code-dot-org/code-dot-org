'use strict';

var _ = require('lodash');
var color = require('../../color');

var styles = {
  showHideButton: {
    position: 'absolute',
    top: 0,
    left: 8,
    margin: 0,
    lineHeight: '30px',
    fontSize: 18,
    // get hover behavior from CollapserIcon_showHideButton
  },
};

var CollapserIcon = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func.isRequired,
    collapsed: React.PropTypes.bool.isRequired
  },

  render: function () {
    var iconClass = this.props.collapsed ? 'fa-chevron-circle-up' :
      'fa-chevron-circle-down';

    return (
      <i style={styles.showHideButton}
          onClick={this.props.onClick}
          className={iconClass + " fa CollapserIcon_showHideButton"}/>
    );

  }
});
module.exports = CollapserIcon;
