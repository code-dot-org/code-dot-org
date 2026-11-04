import React from 'react';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface LabShellProps {
  children: React.ReactNode;
}

/** The full-height chrome the editors and the stage fill. */
const LabShell: React.FunctionComponent<LabShellProps> = ({children}) => (
  <div className={moduleStyles.tabShell}>
    <div className={moduleStyles.tabContent}>{children}</div>
  </div>
);

export default LabShell;
