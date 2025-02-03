import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import moduleStyles from './resizeBar.module.scss';

interface ResizeBarProps {
  isVertical: boolean;
}

const ResizeBar: React.FunctionComponent<ResizeBarProps> = ({
  isVertical,
  ...props
}) => {
  const className = isVertical
    ? moduleStyles.verticalBar
    : moduleStyles.horizontalBar;
  return (
    <div className={classNames(moduleStyles.resizeBar, className)} {...props}>
      <FontAwesomeV6Icon iconName={isVertical ? 'ellipsis-v' : 'ellipsis'} />
    </div>
  );
};

export default ResizeBar;
