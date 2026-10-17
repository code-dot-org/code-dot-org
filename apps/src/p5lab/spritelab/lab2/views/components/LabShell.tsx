import classNames from 'classnames';
import React from 'react';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface LabShellProps {
  /** The scene tabs, leading the bar. */
  sceneTabs?: React.ReactNode;
  /** Rendered at the bar's right. */
  rightExtra?: React.ReactNode;
  /** The bar under the workspace instead of over it. */
  barAtBottom?: boolean;
  children: React.ReactNode;
}

/**
 * The full-screen chrome for SpriteLab2: a bar of scene tabs over the
 * workspace, with the project-wide controls at the bar's right.
 */
const LabShell: React.FunctionComponent<LabShellProps> = ({
  sceneTabs,
  rightExtra,
  barAtBottom = false,
  children,
}) => {
  const bar = (
    <div
      className={classNames(
        moduleStyles.tabContainer,
        barAtBottom && moduleStyles.tabContainerBottom
      )}
    >
      <div className={moduleStyles.tabBar}>{sceneTabs}</div>
      <div className={moduleStyles.tabBar}>{rightExtra}</div>
    </div>
  );
  return (
    <div className={moduleStyles.tabShell}>
      {!barAtBottom && bar}
      <div className={moduleStyles.tabContent}>{children}</div>
      {barAtBottom && bar}
    </div>
  );
};

export default LabShell;
