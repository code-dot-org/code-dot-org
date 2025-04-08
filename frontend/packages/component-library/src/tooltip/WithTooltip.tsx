import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
  HTMLAttributes,
} from 'react';
import {createPortal} from 'react-dom';

import {updatePositionedElementStyles} from '@/common/helpers';

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
  const childRef = useRef<HTMLElement | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  // Define the additional event handlers
  const handleShowTooltip = (
    show: boolean,
    event: React.SyntheticEvent<HTMLElement>,
    isTooltip: boolean = false,
  ) => {
    setShowTooltip(show);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (!isTooltip) {
      setNodePosition(show ? (event.target as HTMLElement) : null);
    }
  };

  const handleHideTooltip = () => {
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowTooltip(false);
      setNodePosition(null);
    }, 100); // Allows for small but visible close delay
  };

  const tailLength = tailLengths[tooltipProps.size || 'm'];

  // Update tooltip position dynamically
  const updateTooltipStyles = useCallback(() => {
    updatePositionedElementStyles({
      nodePosition,
      positionedElementRef: tooltipRef,
      direction: tooltipProps.direction,
      setPositionedElementStyles: setTooltipStyles,
      tailOffset,
      tailLength,
    });
    const tooltip = tooltipRef.current;
    const child = childRef.current;

    if (!tooltip || !child) return;

    const tooltipRect = tooltip.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();
    const {innerWidth: viewportWidth, innerHeight: viewportHeight} = window;

    let top = 0;
    let left = 0;

    // Adjust tooltip position based on viewport boundaries
    if (tooltipProps.direction === 'onTop') {
      top = childRect.top - tooltipRect.height;
      left = childRect.left + childRect.width / 2 - tooltipRect.width / 2;

      // If the tooltip goes offscreen at the top, switch to onBottom
      if (top < 0) {
        top = childRect.bottom;
        tooltipProps.direction = 'onBottom';
      }
    } else if (tooltipProps.direction === 'onBottom') {
      top = childRect.bottom;
      left = childRect.left + childRect.width / 2 - tooltipRect.width / 2;

      // If the tooltip goes offscreen at the bottom, switch to onTop
      if (top + tooltipRect.height > viewportHeight) {
        top = childRect.top - tooltipRect.height;
        tooltipProps.direction = 'onTop';
      }
    } else if (tooltipProps.direction === 'onLeft') {
      top = childRect.top + childRect.height / 2 - tooltipRect.height / 2;
      left = childRect.left - tooltipRect.width;

      // If the tooltip goes offscreen on the left, switch to onRight
      if (left < 0) {
        left = childRect.right;
        tooltipProps.direction = 'onRight';
      }
    } else if (tooltipProps.direction === 'onRight') {
      top = childRect.top + childRect.height / 2 - tooltipRect.height / 2;
      left = childRect.right;

      // If the tooltip goes offscreen on the right, switch to onLeft
      if (left + tooltipRect.width > viewportWidth) {
        left = childRect.left - tooltipRect.width;
        tooltipProps.direction = 'onLeft';
      }
    }

    // Apply the calculated styles
    setTooltipStyles({
      top: `${top}px`,
      left: `${left}px`,
      position: 'absolute',
    });
  }, [nodePosition, tailLength, tooltipProps.direction]);

  // Effect to update tooltip styles when the tooltip is shown
  useEffect(() => {
    if (showTooltip) {
      updateTooltipStyles();

      const observer = new ResizeObserver(() => {
        updateTooltipStyles();
      });

      const child = childRef.current;
      if (child) {
        observer.observe(child);
      }

      window.addEventListener('resize', updateTooltipStyles);

      return () => {
        window.removeEventListener('resize', updateTooltipStyles);
        observer.disconnect();
      };
    }
  }, [showTooltip, tooltipProps.direction, updateTooltipStyles]);

  // Effect to handle the Escape key to close the tooltip
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleHideTooltip();
      }
    };
    if (showTooltip) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTooltip]);

  const tooltipStyleProps: React.CSSProperties = {
    visibility: showTooltip ? 'visible' : 'hidden',
    ...tooltipStyles,
  };

  // Check if children prop is a valid React element and clone it with ariaDescribedBy attribute
  // and additional event handlers to make sure the tooltip is displayed correctly
  const componentToWrap =
    isValidElement<HTMLAttributes<HTMLElement>>(children) &&
    cloneElement(children, {
      'aria-describedby': tooltipProps.tooltipId,
      onFocus: (event: React.FocusEvent<HTMLElement>) => {
        handleShowTooltip(true, event);
        children.props.onFocus?.(event);
      },
      onBlur: (event: React.FocusEvent<HTMLElement>) => {
        handleHideTooltip();
        children.props.onBlur?.(event);
      },
      onMouseEnter: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        handleShowTooltip(true, event);
        children.props.onMouseEnter?.(event);
      },
      onMouseLeave: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        handleHideTooltip();
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
            onMouseEnter={event => handleShowTooltip(true, event, true)}
            onMouseLeave={handleHideTooltip}
          />,
          document.body,
        )}
    </TooltipOverlay>
  );
};

export default WithTooltip;
