import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import moduleStyles from './resizeBar.module.scss';

interface ResizeBarProps {
  isVertical: boolean;
}

const ResizeBar: React.FunctionComponent<ResizeBarProps> = ({isVertical}) => {
  const className = isVertical
    ? moduleStyles.verticalBar
    : moduleStyles.horizontalBar;
  return (
    <div className={classNames(moduleStyles.resizeBar, className)}>
      <FontAwesomeV6Icon iconName={'ellipsis'} />
    </div>
  );
};

export default ResizeBar;
