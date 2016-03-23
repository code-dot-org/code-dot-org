/** Animation or Frame thumbnail */
'use strict';

var _ = require('../../lodash');
var color = require('../../color');

var staticStyles = {
  root: {
    position: 'relative',
    imageRendering: 'pixelated',
    backgroundColor: 'white',
    borderRadius: 9,
    marginLeft: 4,
    marginRight: 4
  },
  wrapper: {
    position: 'relative',
    margin: 4
  },
  image: {
    width: '100%'
  },
  indexBubble: {
    position: 'absolute',
    top: 0,
    left: 0,
    minWidth: 20,
    height: 20,
    overflow: 'hidden',
    borderRadius: 12,
    textAlign: 'center',
    border: 'solid ' + color.light_purple + ' 2px',
    backgroundColor: color.white
  },
  indexBubbleText: {
    margin: 2,
    fontWeight: 'bold',
    fontSize: 16,
    color: color.light_purple
  }
};

/**
 * Animation or Frame thumbnail.
 */
var ListItemThumbnail = React.createClass({
  propTypes: {
    index: React.PropTypes.number,
    isSelected: React.PropTypes.bool,
    src: React.PropTypes.string.isRequired
  },

  getIndexBubble: function () {
    if (typeof this.props.index === 'undefined') {
      return undefined;
    }

    return (
      <div style={staticStyles.indexBubble}>
        <div style={staticStyles.indexBubbleText}>{this.props.index}</div>
      </div>
    );
  },

  render: function () {
    var styles = _.merge({}, staticStyles, {
      root: {
        border: 'solid 2px ' + (this.props.isSelected ? color.purple : color.light_purple)
      }
    });

    return (
      <div style={styles.root}>
        <div style={styles.wrapper}>
          <img src={this.props.src} style={styles.image}/>
          {this.getIndexBubble()}
        </div>
      </div>
    );
  }
});
module.exports = ListItemThumbnail;
