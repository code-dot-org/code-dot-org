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
export const RESIZE_BAR_SIZE_PX_HOVERED = 3;

const ResizeBar: React.FunctionComponent<ResizeBarProps> = ({
  isVertical,
  isDragging,
  separatorProps,
}) => {
  const layoutClass = isVertical
    ? moduleStyles.verticalBar
    : moduleStyles.horizontalBar;
  const [isFocused, setIsFocused] = React.useState(false);

  useEffect(() => {
    const isResizing = isDragging || isFocused;
    const cursor = !isResizing
      ? 'default'
      : isVertical
      ? 'col-resize'
      : 'row-resize';
    document.body.style.cursor = cursor;
  }, [isDragging, isFocused, isVertical]);

  const grabbableClass = useMemo(() => {
    const className = [
      isVertical
        ? moduleStyles.verticalGrabbable
        : moduleStyles.horizontalGrabbable,
    ];
    if (isDragging || isFocused) {
      className.push(moduleStyles.visible);
    }
    return classNames(...className);
  }, [isDragging, isFocused, isVertical]);

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
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseEnter={() => setIsFocused(true)}
        onMouseLeave={() => setIsFocused(false)}
      />
    </div>
  );
};

export default ResizeBar;
