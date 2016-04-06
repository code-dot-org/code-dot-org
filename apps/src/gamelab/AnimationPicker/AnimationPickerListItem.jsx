/** @file A clickable item in the scroll area of the animation picker */
'use strict';

var color = require('../../color');
var Radium = require('radium');

var THUMBNAIL_SIZE = 105;

var styles = {
  root: {
    float: 'left',
    width: THUMBNAIL_SIZE,
    textAlign: 'center',
    marginRight: 10,
    marginBottom: 10
  },
  thumbnail: {
    height: THUMBNAIL_SIZE,
    borderStyle: 'solid',
    borderColor: color.light_gray,
    borderWidth: 1.5,
    borderRadius: 12,
    cursor: 'pointer'
  },
  thumbnailIcon: {
    color: color.white,
    backgroundColor: color.purple,
    borderColor: color.purple,
    fontSize: THUMBNAIL_SIZE / 2,
    lineHeight: THUMBNAIL_SIZE + 'px',
    ':hover': {
      backgroundColor: color.light_purple,
      borderColor: color.light_purple
    }
  },
  label: {
    marginTop: 3,
    fontSize: '90%'
  },
  labelIcon: {
    fontStyle: 'italic'
  }
};

var AnimationPickerListItem = React.createClass({
  propTypes: {
    label: React.PropTypes.string.isRequired,
    icon: React.PropTypes.string
  },

  renderThumbnail: function () {
    if (this.props.icon) {
      return (
        <div style={[styles.thumbnail, styles.thumbnailIcon]}>
          <i className={"fa fa-" + this.props.icon} />
        </div>
      );
    }

    return <div style={styles.thumbnail}></div>;
  },

  renderLabel: function () {
    return (
      <div style={[styles.label, this.props.icon && styles.labelIcon]}>
        {this.props.label}
      </div>
    );
  },

  render: function () {
    var thumbnail;

    return <div style={styles.root}>
      {this.renderThumbnail()}
      {this.renderLabel()}
    </div>;
  }
});
module.exports = Radium(AnimationPickerListItem);
