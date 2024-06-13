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
  const handleFocus = (event: React.FocusEvent<HTMLElement>) => {
    setShowTooltip(true);
    setNodePosition(event.target);
  };

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    setShowTooltip(false);
    setNodePosition(null);
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setShowTooltip(true);
    setNodePosition(event.target as HTMLElement);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    setShowTooltip(false);
    setNodePosition(null);
  };

  const tailLength = tailLengths[tooltipProps.size || 'm'];

  const updateTooltipStyles = useCallback(() => {
    if (nodePosition && tooltipRef.current) {
      const rect = nodePosition.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const direction = document.documentElement.dir || 'ltr'; // Default to 'ltr' if not specified

      let styles: React.CSSProperties = {};

      // Calculate the tooltip position based on the direction and its tail length
      switch (tooltipProps.direction) {
        case 'onRight':
          styles = {
            top: `${
              rect.top +
              window.scrollY +
              rect.height / 2 -
              tooltipRect.height / 2
            }px`,
            left:
              direction === 'ltr'
                ? `${rect.right + window.scrollX + tailOffset + tailLength}px`
                : `${
                    rect.left +
                    window.scrollX -
                    tooltipRect.width -
                    tailOffset -
                    tailLength
                  }px`,
          };
          break;
        case 'onBottom':
          styles = {
            top: `${rect.bottom + window.scrollY + tailOffset + tailLength}px`,
            left: `${
              rect.left +
              window.scrollX +
              rect.width / 2 -
              tooltipRect.width / 2
            }px`,
          };
          break;
        case 'onLeft':
          styles = {
            top: `${
              rect.top +
              window.scrollY +
              rect.height / 2 -
              tooltipRect.height / 2
            }px`,
            left:
              direction === 'ltr'
                ? `${
                    rect.left +
                    window.scrollX -
                    tooltipRect.width -
                    tailOffset -
                    tailLength
                  }px`
                : `${rect.right + window.scrollX + tailOffset + tailLength}px`,
          };
          break;
        case 'onTop':
        default:
          styles = {
            top: `${
              rect.top +
              window.scrollY -
              tooltipRect.height -
              tailOffset -
              tailLength
            }px`,
            left: `${
              rect.left +
              window.scrollX +
              rect.width / 2 -
              tooltipRect.width / 2
            }px`,
          };
          break;
      }
      setTooltipStyles(styles);
    }
  }, [nodePosition, tailLength, tooltipProps.direction]);

  // Effect to update tooltip styles when the tooltip is shown
  useEffect(() => {
    if (showTooltip) {
      updateTooltipStyles();
    }
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
        handleFocus(event);
        if (children.props.onFocus) {
          children.props.onFocus(event);
        }
      },
      onBlur: (event: React.FocusEvent<HTMLElement, Element>) => {
        handleBlur(event);
        if (children.props.onBlur) {
          children.props.onBlur(event);
        }
      },
      onMouseEnter: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        handleMouseEnter(event);
        if (children.props.onMouseEnter) {
          children.props.onMouseEnter(event);
        }
      },
      onMouseLeave: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        handleMouseLeave(event);
        if (children.props.onMouseLeave) {
          children.props.onMouseLeave(event);
        }
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
