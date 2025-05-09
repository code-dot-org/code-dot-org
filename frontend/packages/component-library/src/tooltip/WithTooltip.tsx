import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
  HTMLAttributes,
  forwardRef,
  useImperativeHandle,
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

export interface WithTooltipHandle {
  hideTooltip: () => void;
}

export interface WithTooltipProps {
  children: ReactNode;
  tooltipOverlayClassName?: string;
  tooltipProps: TooltipProps;
}

const WithTooltip = forwardRef<WithTooltipHandle, WithTooltipProps>(
  ({children, tooltipOverlayClassName, tooltipProps}, ref) => {
    const [nodePosition, setNodePosition] = useState<HTMLElement | null>(null);
    const [showTooltip, setShowTooltip] = useState<boolean>(false);
    const [tooltipStyles, setTooltipStyles] = useState<React.CSSProperties>({});
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const hideTimeoutRef = useRef<number | null>(null);
    const suppressNextFocusRef = useRef(false);

    const clearHideTimeout = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };

    // Define the additional event handlers
    const handleShowTooltip = (
      show: boolean,
      event: React.SyntheticEvent<HTMLElement>,
      isTooltip: boolean = false,
    ) => {
      if (suppressNextFocusRef.current && event.type === 'focus') {
        suppressNextFocusRef.current = false;
        return;
      }
      setShowTooltip(show);
      clearHideTimeout();
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

    // Use useImperativeHandle hook to let the parent control visibility in certain cases
    // without needing to refactor all components that use WithTooltip.
    useImperativeHandle(ref, () => ({
      hideTooltip: () => {
        clearHideTimeout();
        setShowTooltip(false);
        setNodePosition(null);
        suppressNextFocusRef.current = true;
      },
    }));

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
  },
);

export default WithTooltip;
