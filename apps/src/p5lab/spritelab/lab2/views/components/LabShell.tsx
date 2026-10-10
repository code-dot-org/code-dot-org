import React from 'react';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface LabShellProps {
  /** The scene tabs, leading the bar. */
  sceneTabs?: React.ReactNode;
  /** Rendered at the bar's right. */
  rightExtra?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * The full-screen chrome for SpriteLab2: a bar of scene tabs over the
 * workspace, with the project-wide controls at the bar's right.
 */
const LabShell: React.FunctionComponent<LabShellProps> = ({
  sceneTabs,
  rightExtra,
  children,
}) => (
  <div className={moduleStyles.tabShell}>
    <div className={moduleStyles.tabContainer}>
      <div className={moduleStyles.tabBar}>{sceneTabs}</div>
      <div className={moduleStyles.tabBar}>{rightExtra}</div>
    </div>
    <div className={moduleStyles.tabContent}>{children}</div>
  </div>
);

export default LabShell;
