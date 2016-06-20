/** @file A clickable item in the scroll area of the animation picker */
'use strict';

import React from 'react';
import Radium from 'radium';
import color from '../../color';
import AnimationPreview from './AnimationPreview';

const THUMBNAIL_SIZE = 105;
const THUMBNAIL_BORDER_WIDTH = 1;

const styles = {
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

const AnimationPickerListItem = React.createClass({
  propTypes: {
    animation: React.PropTypes.object, // TODO: Shape?
    icon: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func
  },

  render() {
    var thumbnailStyle = [
      styles.thumbnail,
      this.props.icon && styles.thumbnailIcon
    ];

    var labelStyle = [
      styles.label,
      this.props.icon && styles.labelIcon
    ];

    return (
      <div style={styles.root} onClick={this.props.onClick}>
        <div style={thumbnailStyle}>
          {this.props.animation &&
              <AnimationPreview
                  animationData={this.props.animation}
                  sourceUrl={this.props.animation.sourceUrl}
                  width={THUMBNAIL_SIZE - 2 * THUMBNAIL_BORDER_WIDTH}
                  height={THUMBNAIL_SIZE - 2 * THUMBNAIL_BORDER_WIDTH}
              />
          }
          {this.props.icon && <i className={"fa fa-" + this.props.icon} />}
        </div>
        <div style={labelStyle}>
          {this.props.label}
        </div>
      </div>
    );
  }
});
export default Radium(AnimationPickerListItem);
