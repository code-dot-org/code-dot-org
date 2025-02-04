import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import moduleStyles from './resizeBar.module.scss';

interface ResizeBarProps {
  isVertical: boolean;
  isDragging: boolean;
}

const ResizeBar: React.FunctionComponent<ResizeBarProps> = ({
  isVertical,
  isDragging,
  ...props
}) => {
  const layoutClass = isVertical
    ? moduleStyles.verticalBar
    : moduleStyles.horizontalBar;
  const [isFocused, setIsFocused] = React.useState(false);
  const dragClass = isDragging || isFocused ? moduleStyles.dragging : undefined;
  const iconClassName = isVertical
    ? classNames(moduleStyles.resizeIcon, moduleStyles.resizeIconVertical)
    : moduleStyles.resizeIcon;

  return (
    <div
      className={classNames(moduleStyles.resizeBar, layoutClass, dragClass)}
      {...props}
      // TODO: the props are applying role separator as well as min/max/now aria values.
      // Is it ok to ignore this warning?
      // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/separator_role
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <FontAwesomeV6Icon
        className={iconClassName}
        iconName={isVertical ? 'ellipsis-v' : 'ellipsis'}
      />
    </div>
  );
};

export default ResizeBar;
