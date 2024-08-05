/** @file A clickable item in the scroll area of the animation picker */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import {PlayBehavior} from '../constants';
import * as shapes from '../shapes';

import AnimationPreview from './AnimationPreview';

import style from './animation-picker-list-item.module.scss';

export default class AnimationPickerListItem extends React.Component {
  static propTypes = {
    animationProps: shapes.AnimationProps,
    icon: PropTypes.string,
    label: PropTypes.string,
    onClick: PropTypes.func,
    playAnimations: PropTypes.bool,
    category: PropTypes.string,
    selected: PropTypes.bool,
    isBackgroundsTab: PropTypes.bool,
    isAnimationJsonMode: PropTypes.bool,
  };

  state = {
    loaded: false,
    hover: false,
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
      isBackgroundsTab,
    } = this.props;
    const {loaded, hover} = this.state;
    const multiSelectIconClassName = `fa ${
      selected ? 'fa-check' : 'fa-plus'
    } fa-2x`;

    let iconImageSrc = category
      ? `/blockly/media/p5lab/animation-previews/category_${category}.png`
      : '';
    if (this.props.isAnimationJsonMode && category === 'all') {
      iconImageSrc =
        '/blockly/media/p5lab/animation-previews/category_all_including_backgrounds.png';
    }

    const previewSize = parseInt(style.previewSize);

    return (
      <div
        className={classNames(style.root, !label && style.noLabel)}
        onFocus={() => this.setState({hover: true})}
        onBlur={() => this.setState({hover: false})}
        onMouseEnter={() => this.setState({hover: true})}
        onMouseLeave={() => this.setState({hover: false})}
      >
        <button
          onClick={onClick}
          className={classNames(
            style.thumbnail,
            icon && style.thumbnailIcon,
            hover && style.multiSelectBorder,
            hover && style.hoverBorder,
            selected && style.selectBorder,
            animationProps && loaded && style.block,
            animationProps && !loaded && style.none
          )}
          type="button"
          aria-label={label}
          data-category={category}
        >
          <div>
            {animationProps && (
              <AnimationPreview
                animationProps={animationProps}
                sourceUrl={animationProps.sourceUrl}
                width={previewSize}
                height={previewSize}
                playBehavior={!playAnimations ? PlayBehavior.NEVER_PLAY : null}
                onPreviewLoad={() => this.setState({loaded: true})}
              />
            )}
            {icon && (
              <i
                className={classNames(
                  'fa fa-' + icon,
                  isBackgroundsTab && style.icon
                )}
              />
            )}
            {isBackgroundsTab && (
              <span className={classNames(style.label, style.labelIcon)}>
                {label}
              </span>
            )}
            {iconImageSrc && (
              <img
                className={style.categoryImage}
                src={iconImageSrc}
                alt={''}
              />
            )}
          </div>
          {animationProps && loaded && (hover || selected) && (
            <i
              className={classNames(
                multiSelectIconClassName,
                style.multiSelectIcon,
                hover && style.hoverIcon,
                selected && style.selectIcon
              )}
            />
          )}
        </button>
        {label && !isBackgroundsTab && (
          <div
            className={classNames(
              style.label,
              icon && style.labelIcon,
              animationProps && loaded && style.block,
              animationProps && !loaded && style.none
            )}
          >
            {label}
          </div>
        )}
      </div>
    );
  }
}

export function getCategory(element) {
  return element.getAttribute('data-category');
}
