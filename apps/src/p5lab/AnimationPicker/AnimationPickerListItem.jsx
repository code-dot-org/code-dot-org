/** @file A clickable item in the scroll area of the animation picker */
import PropTypes from 'prop-types';
import React from 'react';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import {PlayBehavior} from '../constants';
import * as shapes from '../shapes';
import AnimationPreview from './AnimationPreview';
import {KeyCodes} from '@cdo/apps/constants';

const THUMBNAIL_SIZE = 105;
const THUMBNAIL_BORDER_WIDTH = 1;
const HOVER_PLUS_SIZE = 34;

class AnimationPickerListItem extends React.Component {
  static propTypes = {
    animationProps: shapes.AnimationProps,
    icon: PropTypes.string,
    label: PropTypes.string,
    onClick: PropTypes.func,
    playAnimations: PropTypes.bool,
    category: PropTypes.string,
    selected: PropTypes.bool,
    multiSelectEnabled: PropTypes.bool
  };

  state = {
    loaded: false,
    hover: false
  };

  onItemKeyDown = e => {
    if (e.keyCode === KeyCodes.ENTER) {
      this.props.onClick(e);
    }
  };

  render() {
    const {
      icon,
      animationProps,
      category,
      onClick,
      playAnimations,
      label,
      selected,
      multiSelectEnabled
    } = this.props;
    const {loaded, hover} = this.state;
    const rootStyle = [styles.root, !label && styles.noLabel];

    const thumbnailStyle = [
      styles.thumbnail,
      icon && styles.thumbnailIcon,
      animationProps && {
        display: loaded ? 'block' : 'none'
      }
    ];

    const labelStyle = [
      styles.label,
      icon && styles.labelIcon,
      animationProps && {
        display: loaded ? 'block' : 'none'
      }
    ];
    const iconImageSrc = category
      ? `/blockly/media/p5lab/animation-previews/category_${category}.png`
      : '';

    const thumbnailStyleWithHover = [
      thumbnailStyle,
      hover && styles.multiSelectBorder,
      hover && styles.hoverBorder,
      selected && styles.selectBorder
    ];

    const multiSelectIconClassName = `fa ${
      selected ? 'fa-check' : 'fa-plus'
    } fa-2x`;
    const multiSelectIconStyle = [
      styles.multiSelectIcon,
      hover && styles.hoverIcon,
      selected && styles.selectIcon
    ];

    return (
      <button
        style={rootStyle}
        onClick={onClick}
        onKeyDown={this.onItemKeyDown}
        className={category}
        type="button"
        onFocus={() => this.setState({hover: true})}
        onBlur={() => this.setState({hover: false})}
      >
        <div style={thumbnailStyleWithHover}>
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
        {animationProps &&
          loaded &&
          (hover || selected) &&
          multiSelectEnabled && (
            <i
              className={multiSelectIconClassName}
              style={multiSelectIconStyle}
            />
          )}
      </button>
    );
  }
}

const styles = {
  root: {
    float: 'left',
    width: THUMBNAIL_SIZE,
    textAlign: 'center',
    margin: '1px 10px 10px 1px',
    position: 'relative',
    background: 'none',
    boxShadow: 'none',
    border: 0,
    padding: 2,
    outline: 'none'
  },
  thumbnail: {
    height: THUMBNAIL_SIZE,
    width: '100%',
    borderStyle: 'solid',
    borderColor: color.light_gray,
    borderWidth: THUMBNAIL_BORDER_WIDTH,
    borderRadius: 12,
    padding: '2px',
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
    fontSize: 12,
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
  multiSelectIcon: {
    position: 'absolute',
    borderStyle: 'solid',
    borderWidth: '2px',
    height: HOVER_PLUS_SIZE,
    width: HOVER_PLUS_SIZE,
    borderRadius: 5,
    top: THUMBNAIL_SIZE / 2 - HOVER_PLUS_SIZE / 2,
    left: THUMBNAIL_SIZE / 2 - HOVER_PLUS_SIZE / 2
  },
  hoverIcon: {
    color: color.purple,
    backgroundColor: color.white,
    borderColor: color.purple
  },
  selectIcon: {
    color: color.white,
    backgroundColor: color.level_perfect,
    borderColor: color.level_perfect
  },
  multiSelectBorder: {
    borderStyle: 'solid',
    borderRadius: 12,
    cursor: 'pointer',
    borderWidth: '3px',
    padding: 0
  },
  hoverBorder: {
    borderColor: color.purple
  },
  selectBorder: {
    borderWidth: '3px',
    padding: 0,
    borderColor: color.level_perfect
  }
};

export default Radium(AnimationPickerListItem);
