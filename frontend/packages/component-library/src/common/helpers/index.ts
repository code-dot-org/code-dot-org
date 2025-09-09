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
 */
export const calculatePositionedElementStyles = ({
  nodePosition,
  positionedElementRef,
  direction,
  tailOffset,
  tailLength,
}: {
  nodePosition: HTMLElement | null;
  positionedElementRef: React.RefObject<HTMLDivElement | null>;
  direction: ComponentPlacementDirection;
  tailOffset: number;
  tailLength: number;
}) => {
  const styles: React.CSSProperties = {
    position: 'absolute',
    inset: '0px auto auto 0px',
  };
  let effectiveDirection = direction;

  if (nodePosition && positionedElementRef.current && direction !== 'none') {
    const rect = nodePosition.getBoundingClientRect();
    const tooltipRect = positionedElementRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const textDirection = document.documentElement.dir || 'ltr';
    const isLtr = textDirection === 'ltr';

    let top = 0;
    let left = 0;

    const calculatePosition = (dir: ComponentPlacementDirection) => {
      switch (dir) {
        case 'onRight':
          top = rect.top + scrollY + rect.height / 2 - tooltipRect.height / 2;
          left =
            (isLtr ? rect.right : rect.left - tooltipRect.width) +
            scrollX +
            tailOffset +
            tailLength;
          break;
        case 'onBottom':
          top = rect.bottom + scrollY + tailOffset + tailLength;
          left = rect.left + scrollX + rect.width / 2 - tooltipRect.width / 2;
          break;
        case 'onLeft':
          top = rect.top + scrollY + rect.height / 2 - tooltipRect.height / 2;
          left =
            (isLtr ? rect.left - tooltipRect.width : rect.right) +
            scrollX -
            tailOffset -
            tailLength;
          break;
        case 'onTop':
        default:
          top =
            rect.top + scrollY - tooltipRect.height - tailOffset - tailLength;
          left = rect.left + scrollX + rect.width / 2 - tooltipRect.width / 2;
          break;
      }

      return {top, left};
    };

    const fitsInViewport = (pos: {top: number; left: number}) => {
      return (
        pos.top >= scrollY &&
        pos.top + tooltipRect.height <= scrollY + viewportHeight &&
        pos.left >= scrollX &&
        pos.left + tooltipRect.width <= scrollX + viewportWidth
      );
    };

    let proposedPosition = calculatePosition(direction);
    if (!fitsInViewport(proposedPosition)) {
      // Flip logic
      const flipDirection = {
        onRight: 'onLeft',
        onLeft: 'onRight',
        onTop: 'onBottom',
        onBottom: 'onTop',
      }[direction];

      const flippedPosition = calculatePosition(
        flipDirection as ComponentPlacementDirection,
      );
      if (fitsInViewport(flippedPosition)) {
        proposedPosition = flippedPosition;
        effectiveDirection = flipDirection as ComponentPlacementDirection;
      }
      // Otherwise, fallback to original even if partially visible
    }

    // Finally, clamp within viewport to always keep visible:
    proposedPosition.top = Math.min(
      Math.max(proposedPosition.top, scrollY + tailOffset),
      scrollY + viewportHeight - tooltipRect.height - tailOffset,
    );
    proposedPosition.left = Math.min(
      Math.max(proposedPosition.left, scrollX + tailOffset),
      scrollX + viewportWidth - tooltipRect.width - tailOffset,
    );

    styles.transform = `translate3d(${proposedPosition.left}px, ${proposedPosition.top}px, 0px)`;
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
 */
export const updatePositionedElementStyles = ({
  nodePosition,
  positionedElementRef,
  direction,
  setPositionedElementStyles,
  setPositionedElementDirection,
  tailOffset,
  tailLength,
}: {
  nodePosition: HTMLElement | null;
  positionedElementRef: React.RefObject<HTMLDivElement | null>;
  direction: ComponentPlacementDirection;
  setPositionedElementStyles: React.Dispatch<
    React.SetStateAction<React.CSSProperties>
  >;
  setPositionedElementDirection: React.Dispatch<
    React.SetStateAction<ComponentPlacementDirection>
  >;
  tailOffset: number;
  tailLength: number;
}) => {
  const {styles, effectiveDirection} = calculatePositionedElementStyles({
    nodePosition,
    positionedElementRef,
    direction,
    tailOffset,
    tailLength,
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
