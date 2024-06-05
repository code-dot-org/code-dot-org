import React, {
  useEffect,
  useRef,
  useState,
  ReactNode,
  HTMLAttributes,
} from 'react';
import {createPortal} from 'react-dom';

import Tooltip, {TooltipOverlay, TooltipProps} from './Tooltip';

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

  useEffect(() => {
    if (nodePosition && tooltipRef.current) {
      const rect = nodePosition.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let styles: React.CSSProperties = {};

      console.log(rect);
      console.log(nodePosition);

      switch (tooltipProps.direction) {
        case 'onRight':
          styles = {
            top: `${rect.top + rect.height / 2 - tooltipRect.height / 2}px`,
            left: `${rect.right}px`,
          };
          break;
        case 'onBottom':
          styles = {
            top: `${rect.bottom}px`,
            left: `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`,
          };
          break;
        case 'onLeft':
          styles = {
            top: `${rect.top + rect.height / 2 - tooltipRect.height / 2}px`,
            left: `${rect.left - tooltipRect.width}px`,
          };
          break;
        case 'onTop':
        default:
          styles = {
            top: `${rect.top - tooltipRect.height}px`,
            left: `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`,
          };
          break;
      }

      setTooltipStyles(styles);
    }
  }, [showTooltip, nodePosition, tooltipProps.direction]);

  const tooltipStyleProps: React.CSSProperties = {
    visibility: showTooltip ? 'visible' : 'hidden',
    ...tooltipStyles,
  };

  console.log('-- WithTooltip --');

  console.log(tooltipStyleProps);
  console.log(tooltipProps.direction);
  console.log(tooltipStyles);

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

  console.log('componentToWrap', componentToWrap);
  console.log('tooltipProps', tooltipProps);
  console.log('showTooltip', showTooltip);
  console.log('nodePosition', nodePosition);

  return (
    <TooltipOverlay className={tooltipOverlayClassName}>
      {componentToWrap}
      {createPortal(
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
