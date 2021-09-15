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
    const {
      icon,
      animationProps,
      category,
      onClick,
      playAnimations,
      label
    } = this.props;
    const rootStyle = [styles.root, !label && styles.noLabel];

    const thumbnailStyle = [
      styles.thumbnail,
      icon && styles.thumbnailIcon,
      animationProps && {
        display: this.state.loaded ? 'block' : 'none'
      }
    ];

    const labelStyle = [
      styles.label,
      icon && styles.labelIcon,
      animationProps && {
        display: this.state.loaded ? 'block' : 'none'
      }
    ];
    const iconImageSrc = category
      ? `/blockly/media/p5lab/animation-previews/category_${category}.png`
      : '';

    const centerStyle = {
      top: THUMBNAIL_SIZE / 2 - 18,
      left: THUMBNAIL_SIZE / 2 - 18
    };

    const hoverIcon = [styles.hoverIcon, centerStyle];
    return (
      <div
        style={rootStyle}
        onClick={onClick}
        className="uitest-animation-picker-item"
      >
        <div style={thumbnailStyle}>
          {animationProps && (
            <AnimationPreview
              animationProps={animationProps}
              sourceUrl={animationProps.sourceUrl}
              width={THUMBNAIL_SIZE - 2 * THUMBNAIL_BORDER_WIDTH}
              height={THUMBNAIL_SIZE - 2 * THUMBNAIL_BORDER_WIDTH}
              playBehavior={!playAnimations ? PlayBehavior.NEVER_PLAY : null}
              onPreviewLoad={() => this.setState({loaded: true})}
            />
          )}
          {icon && <i className={'fa fa-' + icon} />}
          {category && (
            <img
              className={category}
              style={styles.categoryImage}
              src={iconImageSrc}
            />
          )}
        </div>
        {label && <div style={labelStyle}>{label}</div>}
        {animationProps && <i className="fa fa-plus fa-3x" style={hoverIcon} />}
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
    marginBottom: 10,
    position: 'relative'
  },
  thumbnail: {
    height: THUMBNAIL_SIZE,
    borderStyle: 'solid',
    borderColor: color.light_gray,
    borderWidth: THUMBNAIL_BORDER_WIDTH,
    borderRadius: 12,
    padding: '2px',
    cursor: 'pointer',
    ':hover': {
      borderColor: color.purple,
      borderWidth: '3px',
      padding: 0
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
  },
  hoverIcon: {
    position: 'absolute',
    color: color.purple,
    backgroundColor: color.white,
    borderColor: color.purple,
    borderStyle: 'solid',
    borderWidth: '2px',
    top: 0,
    left: 0,
    height: 36,
    width: 36
  }
};

export default Radium(AnimationPickerListItem);
