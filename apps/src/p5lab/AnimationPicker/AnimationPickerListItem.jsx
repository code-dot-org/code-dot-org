/** @file A clickable item in the scroll area of the animation picker */
import PropTypes from 'prop-types';
import React from 'react';
import {PlayBehavior} from '../constants';
import * as shapes from '../shapes';
import AnimationPreview from './AnimationPreview';
import style from './animation-picker-list-item.module.scss';

import classNames from 'classnames';

export default class AnimationPickerListItem extends React.Component {
  static propTypes = {
    animationProps: shapes.AnimationProps,
    icon: PropTypes.string,
    label: PropTypes.string,
    onClick: PropTypes.func,
    playAnimations: PropTypes.bool,
    category: PropTypes.string,
    selected: PropTypes.bool
  };

  state = {
    loaded: false,
    hover: false
  };

  render() {
    const {
      icon,
      animationProps,
      category,
      onClick,
      playAnimations,
      label,
      selected
    } = this.props;
    const {loaded, hover} = this.state;

    const iconImageSrc = category
      ? `/blockly/media/p5lab/animation-previews/category_${category}.png`
      : '';

    const multiSelectIconClassName = `fa ${
      selected ? 'fa-check' : 'fa-plus'
    } fa-2x`;

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
            {icon && <i className={'fa fa-' + icon} />}
            {category && (
              <img
                data-category={category}
                className={style.categoryImage}
                src={iconImageSrc}
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
        {label && (
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
