/** @file A clickable item in the scroll area of the animation picker */
'use strict';

var AnimationPreview = require('./AnimationPreview');
var color = require('../../color');
var Radium = require('radium');

var THUMBNAIL_SIZE = 105;
var THUMBNAIL_BORDER_WIDTH = 1;

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
    borderWidth: THUMBNAIL_BORDER_WIDTH,
    borderRadius: 12,
    cursor: 'pointer',
    ':hover': {
      borderColor: color.purple
    }
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
    fontSize: '90%',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  labelIcon: {
    fontStyle: 'italic'
  }
};

var AnimationPickerListItem = function (props) {
  var thumbnailStyle = [
    styles.thumbnail,
    props.icon && styles.thumbnailIcon
  ];

  var labelStyle = [
    styles.label,
    props.icon && styles.labelIcon
  ];

  return (
    <div style={styles.root} onClick={props.onClick}>
      <div style={thumbnailStyle}>
        {props.sourceUrl && <AnimationPreview
            width={THUMBNAIL_SIZE - 2 * THUMBNAIL_BORDER_WIDTH}
            height={THUMBNAIL_SIZE - 2 * THUMBNAIL_BORDER_WIDTH}
            sourceUrl={props.sourceUrl}
            sourceWidth={props.sourceWidth}
            sourceHeight={props.sourceHeight}
            frameWidth={props.frameWidth}
            frameHeight={props.frameHeight}
            frameCount={props.frameCount}
            frameRate={props.frameRate}/>}
        {props.icon && <i className={"fa fa-" + props.icon} />}
      </div>
      <div style={labelStyle}>
        {props.label}
      </div>
    </div>
  );
};
AnimationPickerListItem.propTypes = {
  label: React.PropTypes.string.isRequired,
  icon: React.PropTypes.string,
  sourceUrl: React.PropTypes.string,
  sourceWidth: React.PropTypes.number,
  sourceHeight: React.PropTypes.number,
  frameWidth: React.PropTypes.number,
  frameHeight: React.PropTypes.number,
  frameCount: React.PropTypes.number,
  frameRate: React.PropTypes.number,
  onClick: React.PropTypes.func
};
module.exports = Radium(AnimationPickerListItem);
