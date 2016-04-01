'use strict';

var Radium = require('radium');
var _ = require('../../lodash');
var color = require('../../color');
var styleConstants = require('../../styleConstants');

var styles = {
  showHideButton: {
    position: 'absolute',
    top: 0,
    left: 8,
    margin: 0,
    lineHeight: styleConstants['workspace-headers-height'] + 'px',
    fontSize: 18,
    ':hover': {
      cursor: 'pointer',
      color: color.white
    }
  },
};

/**
 * Simple icon that either points up or down, and supports onClick
 */
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
          className={iconClass + " fa"}/>
    );
  }
});
module.exports = Radium(CollapserIcon);
