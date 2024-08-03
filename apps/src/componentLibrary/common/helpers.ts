import React, {AriaAttributes} from 'react';

import {ComponentPlacementDirection} from '@cdo/apps/componentLibrary/common/types';

type PrimitiveValue =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | null
  | undefined;

export const getAriaPropsFromProps = (props: {
  [key: string]: PrimitiveValue;
}) => {
  const ariaProps: {[key: string]: PrimitiveValue} = {};
  Object.keys(props).forEach(key => {
    if (key.startsWith('aria-')) {
      ariaProps[key] = props[key];
    }
  });

  return ariaProps as AriaAttributes;
};

export const updatePositionedElementStyles = ({
  nodePosition,
  positionedElementRef,
  direction,
  setPositionedElementStyles,
  tailOffset,
  tailLength,
}: {
  nodePosition: HTMLElement | null;
  positionedElementRef: React.RefObject<HTMLDivElement | null>;
  direction?: ComponentPlacementDirection | 'none';
  setPositionedElementStyles: React.Dispatch<
    React.SetStateAction<React.CSSProperties>
  >;
  tailOffset: number;
  tailLength: number;
}) => {
  if (nodePosition && positionedElementRef.current && direction !== 'none') {
    const rect = nodePosition.getBoundingClientRect();
    const tooltipRect = positionedElementRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const textDirection = document.documentElement.dir || 'ltr'; // Default to 'ltr' if not specified
    const isLtr = textDirection === 'ltr';

    const styles: React.CSSProperties = {};

    const verticalMiddlePosition =
      rect.top + scrollY + rect.height / 2 - tooltipRect.height / 2;
    const verticalTopPosition =
      rect.top + scrollY - tooltipRect.height - tailOffset - tailLength;
    const verticalBottomPosition =
      rect.top + rect.height + scrollY + tailOffset + tailLength;

    const horizontalMiddlePosition =
      rect.left + scrollX + rect.width / 2 - tooltipRect.width / 2;
    const horizontalLeftPosition =
      rect.left + scrollX - tooltipRect.width - tailOffset - tailLength;
    const horizontalRightPosition =
      rect.right + scrollX + tailOffset + tailLength;

    // Calculate the tooltip position based on the direction and its tail length
    switch (direction) {
      case 'onRight':
        styles.top = verticalMiddlePosition;
        styles.left = isLtr ? horizontalRightPosition : horizontalLeftPosition;
        break;
      case 'onBottom':
        styles.top = verticalBottomPosition;
        styles.left = horizontalMiddlePosition;
        break;
      case 'onLeft':
        styles.top = verticalMiddlePosition;
        styles.left = isLtr ? horizontalLeftPosition : horizontalRightPosition;
        break;
      case 'onTop':
      default:
        styles.top = verticalTopPosition;
        styles.left = horizontalMiddlePosition;
        break;
    }

    setPositionedElementStyles(styles);
  }
};
