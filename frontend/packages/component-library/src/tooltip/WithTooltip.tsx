import React, {
  isValidElement,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
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
  const hideTimeoutRef = useRef<number | null>(null);

  // Define the additional event handlers
  const handleShowTooltip = (
    show: boolean,
    event: React.SyntheticEvent<HTMLElement>,
    isTooltip: boolean = false,
  ) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowTooltip(show);
    if (!isTooltip) {
      setNodePosition(show ? (event.target as HTMLElement) : null);
    }
  };

  const handleHideTooltip = () => {
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowTooltip(false);
      setNodePosition(null);
    }, 100); // Adjust the delay as needed
  };

  const tailLength = tailLengths[tooltipProps.size || 'm'];

  const updateTooltipStyles = useCallback(
    () =>
      updatePositionedElementStyles({
        nodePosition,
        positionedElementRef: tooltipRef,
        direction: tooltipProps.direction,
        setPositionedElementStyles: setTooltipStyles,
        tailOffset,
        tailLength,
      }),
    [nodePosition, tailLength, tooltipProps.direction],
  );

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

  // Effect to handle the Escape key to close the tooltip
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('Key pressed:', event.key); // Log the key pressed
      if (event.key === 'Escape' && !event.defaultPrevented) {
        console.log('Escape key pressed');
        handleHideTooltip();
        event.preventDefault(); // Prevent other listeners from handling the event
      }
    };

    if (showTooltip) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTooltip]);

  const tooltipStyleProps: React.CSSProperties = {
    visibility: showTooltip ? 'visible' : 'hidden',
    ...tooltipStyles,
  };

  // Wrap children in a container with event handlers and additional padding
  const containerProps = {
    'aria-describedby': tooltipProps.tooltipId,
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      handleShowTooltip(true, event);
      if (isValidElement(children)) {
        children.props.onFocus?.(event);
      }
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      handleHideTooltip();
      if (isValidElement(children)) {
        children.props.onBlur?.(event);
      }
    },
    onMouseEnter: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      handleShowTooltip(true, event);
      if (isValidElement(children)) {
        children.props.onMouseEnter?.(event);
      }
    },
    onMouseLeave: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      handleHideTooltip();
      if (isValidElement(children)) {
        children.props.onMouseLeave?.(event);
      }
    },
  };

  return (
    <TooltipOverlay className={tooltipOverlayClassName}>
      <div {...containerProps}>{children}</div>
      {showTooltip &&
        createPortal(
          <div role="tooltip" style={{padding: '10px'}}>
            <Tooltip
              {...tooltipProps}
              ref={tooltipRef}
              style={tooltipStyleProps}
            />
          </div>,
          document.body,
        )}
    </TooltipOverlay>
  );
};

export default WithTooltip;
