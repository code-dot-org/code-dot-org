import React from 'react';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface LabShellProps {
  /** Optional banner over the stage, in its own row. */
  alert?: React.ReactNode;
  children: React.ReactNode;
}

/** The full-height chrome the editors and the stage fill. */
const LabShell: React.FunctionComponent<LabShellProps> = ({
  alert,
  children,
}) => (
  <div className={moduleStyles.tabShell}>
    {alert && <div className={moduleStyles.shellAlert}>{alert}</div>}
    <div className={moduleStyles.tabContent}>{children}</div>
  </div>
);

export default LabShell;
