import classNames from 'classnames';
import React, {useEffect, useMemo} from 'react';
import {SeparatorProps} from 'react-resizable-layout';

import moduleStyles from './resizeBar.module.scss';

interface ResizeBarProps {
  isVertical: boolean;
  isDragging: boolean;
  separatorProps: SeparatorProps;
}

export const RESIZE_BAR_SIZE_PX = 1;

// A resize bar that can be dragged to resize two adjacent panels.
// The visible bar starts out 1px wide. There is an absolutely-positioned 7px bar
// that is used for grabbing, and a 3px "resize" bar that becomes visible
// when the grabbable bar is hovered or being dragged.
// The keyboard events happen on the 3px resize bar so they are visible to the user.
// The resize bar should be used with useResizable from react-resizable-layout.
const ResizeBar: React.FunctionComponent<ResizeBarProps> = ({
  isVertical,
  isDragging,
  separatorProps,
}) => {
  const [isActive, setIsActive] = React.useState(false);

  useEffect(() => {
    // Ensure the cursor changes when the user is dragging or is hovered
    // over/focused on the resize bar.
    const isResizing = isDragging || isActive;
    const cursor = !isResizing
      ? 'default'
      : isVertical
      ? 'col-resize'
      : 'row-resize';
    document.body.style.cursor = cursor;
  }, [isDragging, isActive, isVertical]);

  const grabbableClass = isVertical
    ? moduleStyles.verticalGrabbable
    : moduleStyles.horizontalGrabbable;

  const resizingBarClass = useMemo(() => {
    const className = [
      isVertical
        ? moduleStyles.verticalResizing
        : moduleStyles.horizontalResizing,
    ];
    if (isDragging || isActive) {
      // When we are dragging or the resize bar is active, we show the wider
      // grabbable bar.
      className.push(moduleStyles.visible);
    }
    return classNames(...className);
  }, [isDragging, isActive, isVertical]);

  const layoutClass = isVertical
    ? moduleStyles.verticalBar
    : moduleStyles.horizontalBar;

  const {onPointerDown, ...mainSeparatorProps} = separatorProps;

  return (
    // The always-visible 1px bar
    <div className={classNames(moduleStyles.resizeBar, layoutClass)}>
      {/* The visible 3px bar */}
      <div
        className={classNames(moduleStyles.absoluteBar, resizingBarClass)}
        {...mainSeparatorProps}
        // The separator props are applying role "separator" as well as min/now aria values.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        aria-valuemax={20000} // Infinity fails accessibility checks, so use a large number instead.
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
      >
        {/* The grabbable bar. We take onPointerDown from the separater props and put it here to make the bar
        easier to grab. */}
        <div
          onPointerDown={onPointerDown}
          className={classNames(moduleStyles.absoluteBar, grabbableClass)}
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
          onMouseEnter={() => setIsActive(true)}
          onMouseLeave={() => setIsActive(false)}
        />
      </div>
    </div>
  );
};

export default ResizeBar;
