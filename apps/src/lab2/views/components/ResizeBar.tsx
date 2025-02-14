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
// The visible bar starts out 1px wide. There is an absolutely-positioned 5px bar
// that is used for grabbing, and becomes visible when it is hovered/focused or being dragged.
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

  const grabbableClass = useMemo(() => {
    const className = [
      isVertical
        ? moduleStyles.verticalGrabbable
        : moduleStyles.horizontalGrabbable,
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

  return (
    <div className={classNames(moduleStyles.resizeBar, layoutClass)}>
      <div
        className={classNames(moduleStyles.grabbableDiv, grabbableClass)}
        {...separatorProps}
        // TODO: the separator props are applying role "separator" as well as min/max/now aria values.
        // Is it ok to ignore this warning?
        // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/separator_role
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        onMouseEnter={() => setIsActive(true)}
        onMouseLeave={() => setIsActive(false)}
      />
    </div>
  );
};

export default ResizeBar;
