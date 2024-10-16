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
  const [popoverStyles, setPopoverStyles] = useState<React.CSSProperties>({});
  const popoverRef = useRef<HTMLDivElement | null>(null);

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
        isPositionFixed: true,
      }),
    [nodePosition, popoverRef, setPopoverStyles, popoverProps, tailLength]
  );

  /** Disable Scroll when Popover is rendered.
   * This is needed to prevent the user from scrolling the page when the Popover is open.
   * Reason for this is that we want our popover to be tab-navigable and the best approach
   * for it when this comment is written is to use position: fixed for the popover.
   */
  useEffect(() => {
    let scrollPosition = {top: 0, left: 0};

    const disableScroll = () => {
      scrollPosition = {top: window.scrollY, left: window.scrollX};
      window.addEventListener('scroll', keepScrollPosition, {passive: false});
    };

    const enableScroll = () => {
      window.removeEventListener('scroll', keepScrollPosition);
    };

    const keepScrollPosition = (event: Event) => {
      if (showPopover) {
        window.scrollTo(scrollPosition.left, scrollPosition.top);
        event.preventDefault();
      }
    };

    // Disable scroll on mount
    disableScroll();

    // Enable scroll on unmount
    return () => {
      enableScroll();
    };
  }, [showPopover]);

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
