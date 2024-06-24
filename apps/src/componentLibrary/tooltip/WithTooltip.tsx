import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
  HTMLAttributes,
} from 'react';
import {createPortal} from 'react-dom';

import Tooltip, {TooltipOverlay, TooltipProps} from './_Tooltip';

// Define the tail offset and length values
const tailOffset = 4;
const tailLengths = {
  l: 12,
  m: 9,
  s: 6,
  xs: 6,
};

export interface WithTooltipProps {
  children: ReactNode;
  tooltipOverlayClassName?: string;
  tooltipProps: TooltipProps;
}

const WithTooltip: React.FunctionComponent<WithTooltipProps> = ({
  children,
  tooltipOverlayClassName,
  tooltipProps,
}) => {
  const [nodePosition, setNodePosition] = useState<HTMLElement | null>(null);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [tooltipStyles, setTooltipStyles] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Define the additional event handlers
  const handleShowTooltip = (
    show: boolean,
    event: React.SyntheticEvent<HTMLElement>
  ) => {
    setShowTooltip(show);
    setNodePosition(show ? (event.target as HTMLElement) : null);
  };

  const tailLength = tailLengths[tooltipProps.size || 'm'];

  const updateTooltipStyles = useCallback(() => {
    if (nodePosition && tooltipRef.current) {
      const rect = nodePosition.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      const direction = document.documentElement.dir || 'ltr'; // Default to 'ltr' if not specified
      const isLtr = direction === 'ltr';

      const styles: React.CSSProperties = {};

      const verticalMiddlePosition =
        rect.top + scrollY + rect.height / 2 - tooltipRect.height / 2;
      const verticalTopPosition =
        rect.top + scrollY - tooltipRect.height - tailOffset - tailLength;
      const verticalBottomPosition =
        rect.bottom + scrollY + tailOffset + tailLength;

      const horizontalMiddlePosition =
        rect.left + scrollX + rect.width / 2 - tooltipRect.width / 2;
      const horizontalLeftPosition =
        rect.left + scrollX - tooltipRect.width - tailOffset - tailLength;
      const horizontalRightPosition =
        rect.right + scrollX + tailOffset + tailLength;

      // Calculate the tooltip position based on the direction and its tail length
      switch (tooltipProps.direction) {
        case 'onRight':
          styles.top = verticalMiddlePosition;
          styles.left = isLtr
            ? horizontalRightPosition
            : horizontalLeftPosition;
          break;
        case 'onBottom':
          styles.top = verticalBottomPosition;
          styles.left = horizontalMiddlePosition;
          break;
        case 'onLeft':
          styles.top = verticalMiddlePosition;
          styles.left = isLtr
            ? horizontalLeftPosition
            : horizontalRightPosition;
          break;
        case 'onTop':
        default:
          styles.top = verticalTopPosition;
          styles.left = horizontalMiddlePosition;
          break;
      }
      setTooltipStyles(styles);
    }
  }, [nodePosition, tailLength, tooltipProps.direction]);

  // Effect to update tooltip styles when the tooltip is shown
  useEffect(() => {
    const updateTooltipPositionIfShown = () => {
      if (showTooltip) {
        updateTooltipStyles();
      }
    };

    updateTooltipPositionIfShown();

    window.addEventListener('resize', updateTooltipPositionIfShown);
    return () => {
      window.removeEventListener('resize', updateTooltipPositionIfShown);
    };
  }, [
    showTooltip,
    nodePosition,
    tooltipProps.direction,
    tailLength,
    updateTooltipStyles,
  ]);

  const tooltipStyleProps: React.CSSProperties = {
    visibility: showTooltip ? 'visible' : 'hidden',
    ...tooltipStyles,
  };

  // Check if children is a valid React element and clone it with ariaDescribedBy attribute
  // and additional event handlers to make sure the tooltip is displayed correctly
  const componentToWrap =
    React.isValidElement<HTMLAttributes<HTMLElement>>(children) &&
    React.cloneElement(children, {
      'aria-describedby': tooltipProps.tooltipId,
      onFocus: (event: React.FocusEvent<HTMLElement>) => {
        handleShowTooltip(true, event);
        children.props.onFocus?.(event);
      },
      onBlur: (event: React.FocusEvent<HTMLElement, Element>) => {
        handleShowTooltip(false, event);
        children.props.onBlur?.(event);
      },
      onMouseEnter: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        handleShowTooltip(true, event);
        children.props.onMouseEnter?.(event);
      },
      onMouseLeave: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        handleShowTooltip(false, event);
        children.props.onMouseLeave?.(event);
      },
    });

  return (
    <TooltipOverlay className={tooltipOverlayClassName}>
      {componentToWrap}
      {showTooltip &&
        createPortal(
          <Tooltip
            {...tooltipProps}
            ref={tooltipRef}
            style={tooltipStyleProps}
          />,
          document.body
        )}
    </TooltipOverlay>
  );
};

export default WithTooltip;
