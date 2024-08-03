import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
  HTMLAttributes,
  SyntheticEvent,
} from 'react';

import {updatePositionedElementStyles} from '@cdo/apps/componentLibrary/common/helpers';

import Popover, {PopoverProps} from './Popover';

// Define the tail offset and length values
const tailOffset = 4;
const tailLengths = {
  m: 12,
};

export interface WithPopoverProps {
  children: ReactNode;
  showPopover?: boolean;
  popoverProps: PopoverProps;
}

const WithPopover: React.FunctionComponent<WithPopoverProps> = ({
  children,
  showPopover = false,
  popoverProps,
}) => {
  const [nodePosition, setNodePosition] = useState<HTMLElement | null>(null);
  // const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [popoverStyles, setPopoverStyles] = useState<React.CSSProperties>({});
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Define the additional event handlers
  // const handleShowTooltip = (
  //   show: boolean,
  //   event: React.SyntheticEvent<HTMLElement>
  // ) => {
  //   setShowTooltip(show);
  //   setNodePosition(show ? (event.target as HTMLElement) : null);
  // };

  const tailLength = tailLengths[popoverProps.size || 'm'];

  const updatePopoverStyles = useCallback(
    () =>
      updatePositionedElementStyles({
        nodePosition,
        positionedElementRef: popoverRef,
        direction: popoverProps.direction,
        setPositionedElementStyles: setPopoverStyles,
        tailOffset,
        tailLength,
      }),
    [nodePosition, popoverRef, setPopoverStyles, popoverProps, tailLength]
  );

  // Effect to update tooltip styles when the tooltip is shown
  useEffect(() => {
    const updatePopoverPositionIfShown = () => {
      if (showPopover) {
        updatePopoverStyles();
      }
    };

    updatePopoverPositionIfShown();

    window.addEventListener('resize', updatePopoverPositionIfShown);
    return () => {
      window.removeEventListener('resize', updatePopoverPositionIfShown);
    };
  }, [
    showPopover,
    nodePosition,
    popoverProps.direction,
    tailLength,
    updatePopoverStyles,
  ]);

  // const tooltipStyleProps: React.CSSProperties = {
  //   visibility: showTooltip ? 'visible' : 'hidden',
  //   ...tooltipStyles,
  // };

  // Check if children is a valid React element and clone it with ariaDescribedBy attribute
  // and additional event handlers to make sure the tooltip is displayed correctly
  // const componentToWrap =
  //   React.isValidElement<HTMLAttributes<HTMLElement>>(children) &&
  //   React.cloneElement(children, {
  //     'aria-describedby': tooltipProps.tooltipId,
  //     onFocus: (event: React.FocusEvent<HTMLElement>) => {
  //       handleShowTooltip(true, event);
  //       children.props.onFocus?.(event);
  //     },
  //     onBlur: (event: React.FocusEvent<HTMLElement, Element>) => {
  //       handleShowTooltip(false, event);
  //       children.props.onBlur?.(event);
  //     },
  //     onMouseEnter: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
  //       handleShowTooltip(true, event);
  //       children.props.onMouseEnter?.(event);
  //     },
  //     onMouseLeave: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
  //       handleShowTooltip(false, event);
  //       children.props.onMouseLeave?.(event);
  //     },
  //   });

  const handleEvent = (event: React.SyntheticEvent<HTMLElement>) => {
    setNodePosition(event.currentTarget);
  };

  const mergeEventHandlers =
    (
      existingHandler?: React.EventHandler<SyntheticEvent>,
      newHandler?: React.EventHandler<SyntheticEvent>
    ) =>
    (event: React.SyntheticEvent) => {
      if (existingHandler) existingHandler(event);
      if (newHandler) newHandler(event);
    };

  const clonedChildren =
    React.isValidElement<HTMLAttributes<HTMLElement>>(children) &&
    React.cloneElement(children, {
      onMouseEnter: mergeEventHandlers(
        children.props.onMouseEnter,
        handleEvent
      ),
      onFocus: mergeEventHandlers(children.props.onFocus, handleEvent),
      onBlur: mergeEventHandlers(children.props.onBlur, handleEvent),
      onMouseLeave: mergeEventHandlers(
        children.props.onMouseLeave,
        handleEvent
      ),
    });
  return (
    <>
      {clonedChildren}
      {showPopover && (
        <Popover {...popoverProps} ref={popoverRef} style={popoverStyles} />
      )}
    </>
  );
};

export default WithPopover;
