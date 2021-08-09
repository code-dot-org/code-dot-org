/** @file A clickable item in the scroll area of the animation picker */
import PropTypes from 'prop-types';
import React from 'react';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import {PlayBehavior} from '../constants';
import * as shapes from '../shapes';
import AnimationPreview from './AnimationPreview';

const THUMBNAIL_SIZE = 105;
const THUMBNAIL_BORDER_WIDTH = 1;

class AnimationPickerListItem extends React.Component {
  static propTypes = {
    animationProps: shapes.AnimationProps,
    icon: PropTypes.string,
    label: PropTypes.string,
    onClick: PropTypes.func,
    playAnimations: PropTypes.bool,
    category: PropTypes.string
  };

  state = {
    loaded: false
  };

  render() {
    const rootStyle = [styles.root, !this.props.label && styles.noLabel];

    const thumbnailStyle = [
      styles.thumbnail,
      this.props.icon && styles.thumbnailIcon,
      this.props.animationProps && {
        display: this.state.loaded ? 'block' : 'none'
      }
    ];

    const labelStyle = [
      styles.label,
      this.props.icon && styles.labelIcon,
      this.props.animationProps && {
        display: this.state.loaded ? 'block' : 'none'
      }
    ];
    const iconImageSrc = this.props.category
      ? `/blockly/media/p5lab/animation-previews/category_${
          this.props.category
        }.png`
      : '';

    return (
      <div
        style={rootStyle}
        onClick={this.props.onClick}
        className="uitest-animation-picker-item"
      >
        <div style={thumbnailStyle}>
          {this.props.animationProps && (
            <AnimationPreview
              animationProps={this.props.animationProps}
              sourceUrl={this.props.animationProps.sourceUrl}
              width={THUMBNAIL_SIZE - 2 * THUMBNAIL_BORDER_WIDTH}
              height={THUMBNAIL_SIZE - 2 * THUMBNAIL_BORDER_WIDTH}
              playBehavior={
                !this.props.playAnimations ? PlayBehavior.NEVER_PLAY : null
              }
              onPreviewLoad={() => this.setState({loaded: true})}
            />
          )}
          {this.props.icon && <i className={'fa fa-' + this.props.icon} />}
          {this.props.category && (
            <img
              className={this.props.category}
              style={styles.categoryImage}
              src={iconImageSrc}
            />
          )}
        </div>
        {this.props.label && <div style={labelStyle}>{this.props.label}</div>}
      </div>
    );
  }
}

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
  noLabel: {
    paddingBottom: 10
  },
  labelIcon: {
    fontStyle: 'italic'
  },
  categoryImage: {
    borderRadius: 10
  }
};

export default Radium(AnimationPickerListItem);
