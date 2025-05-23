import React, {AriaAttributes} from 'react';

import {ComponentPlacementDirection} from '@/common/types';

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

/**
 * Calculates the positioned element styles based on the node(relative element)
 * position and the direction of the positioned element. Can be used to calculate styles
 * for both position: fixed and position: absolute.
 * @param nodePosition
 * @param positionedElementRef
 * @param direction
 * @param tailOffset
 * @param tailLength
 * @param isPositionFixed
 */
export const calculatePositionedElementStyles = ({
  nodePosition,
  positionedElementRef,
  direction,
  tailOffset,
  tailLength,
  isPositionFixed = false,
}: {
  nodePosition: HTMLElement | null;
  positionedElementRef: React.RefObject<HTMLDivElement | null>;
  direction?: ComponentPlacementDirection;
  tailOffset: number;
  tailLength: number;
  isPositionFixed?: boolean;
}) => {
  const styles: React.CSSProperties = {};
  let effectiveDirection = direction;

  if (nodePosition && positionedElementRef.current && direction !== 'none') {
    const rect = nodePosition.getBoundingClientRect();
    const tooltipRect = positionedElementRef.current.getBoundingClientRect();
    const scrollY = isPositionFixed ? 0 : window.scrollY;
    const scrollX = isPositionFixed ? 0 : window.scrollX;
    const textDirection = document.documentElement.dir || 'ltr'; // Default to 'ltr' if not specified
    const isLtr = textDirection === 'ltr';

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
        // Adjust if the tooltip goes offscreen on the right
        if (styles.left + tooltipRect.width > window.innerWidth) {
          effectiveDirection = 'onLeft';
        }
        break;
      case 'onBottom':
        styles.top = verticalBottomPosition;
        styles.left = horizontalMiddlePosition;
        // Adjust if the tooltip goes offscreen at the bottom
        if (styles.top + tooltipRect.height > window.innerHeight) {
          effectiveDirection = 'onTop';
        }
        break;
      case 'onLeft':
        styles.top = verticalMiddlePosition;
        styles.left = isLtr ? horizontalLeftPosition : horizontalRightPosition;
        // Adjust if the tooltip goes offscreen on the left
        if (styles.left < 0) {
          effectiveDirection = 'onRight';
        }
        break;
      case 'onTop':
      default:
        styles.top = verticalTopPosition;
        styles.left = horizontalMiddlePosition;
        // Adjust if the tooltip goes offscreen at the top
        if (styles.top < 0) {
          effectiveDirection = 'onBottom';
        }
        break;
    }

    // Ensure the tooltip stays within the viewport horizontally
    if (styles.left + tooltipRect.width > window.innerWidth) {
      styles.left = window.innerWidth - tooltipRect.width - tailOffset;
    } else if (styles.left < 0) {
      styles.left = tailOffset;
    }

    // Ensure the tooltip stays within the viewport vertically
    if (styles.top + tooltipRect.height > window.innerHeight) {
      styles.top = window.innerHeight - tooltipRect.height - tailOffset;
    } else if (styles.top < 0) {
      styles.top = tailOffset;
    }
  }

  return {styles, effectiveDirection};
};
/**
 * Shortcut function to update React state for the positioned element styles based on the node position
 * (relative element) position and the direction of the positioned element.
 * For more context see calculatePositionedElementStyles function.
 * @param nodePosition
 * @param positionedElementRef
 * @param direction
 * @param setPositionedElementStyles
 * @param setPositionedElementDirection
 * @param tailOffset
 * @param tailLength
 * @param isPositionFixed
 */
export const updatePositionedElementStyles = ({
  nodePosition,
  positionedElementRef,
  direction,
  setPositionedElementStyles,
  setPositionedElementDirection,
  tailOffset,
  tailLength,
  isPositionFixed = false,
}: {
  nodePosition: HTMLElement | null;
  positionedElementRef: React.RefObject<HTMLDivElement | null>;
  direction?: ComponentPlacementDirection;
  setPositionedElementStyles: React.Dispatch<
    React.SetStateAction<React.CSSProperties>
  >;
  setPositionedElementDirection: React.Dispatch<
    React.SetStateAction<ComponentPlacementDirection>
  >;
  tailOffset: number;
  tailLength: number;
  isPositionFixed?: boolean;
}) => {
  const {styles, effectiveDirection} = calculatePositionedElementStyles({
    nodePosition,
    positionedElementRef,
    direction,
    tailOffset,
    tailLength,
    isPositionFixed,
  });

  if (
    effectiveDirection &&
    effectiveDirection !== 'none' &&
    effectiveDirection !== direction
  ) {
    setPositionedElementDirection(effectiveDirection);
  } else {
    setPositionedElementStyles(styles);
  }
};

// Check to see if a URL is blocked.
export const checkIfURLIsBlocked = (url: string): Promise<boolean> => {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(false);
    img.onerror = () => resolve(true);
    // This prevents the browser from caching the image.
    img.src = `${url}?_=${Math.random()}`;
  });
};

// Check to see if YouTube is blocked using the checkIfURLIsBlocked function.
export const checkIfYouTubeIsBlocked = async () => {
  const [isYouTubeBlocked, isYouTubeNoCookieBlocked] = await Promise.all([
    checkIfURLIsBlocked('https://www.youtube.com/favicon.ico'),
    checkIfURLIsBlocked('https://www.youtube-nocookie.com/favicon.ico'),
  ]);

  return isYouTubeBlocked || isYouTubeNoCookieBlocked;
};
