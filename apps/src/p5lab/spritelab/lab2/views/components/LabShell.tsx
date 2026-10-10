import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React from 'react';

import {blurAfterPointerClick} from '../blurAfterPointerClick';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface LabShellProps {
  /** The scene tabs, leading the bar. */
  sceneTabs?: React.ReactNode;
  /** Rendered at the right, before Start Over. */
  rightExtra?: React.ReactNode;
  children: React.ReactNode;
  onClickStartOver?: () => void;
}

/**
 * The full-screen chrome for SpriteLab2: a bar of scene tabs over the
 * workspace, with the project-wide controls at the bar's right.
 */
const LabShell: React.FunctionComponent<LabShellProps> = ({
  sceneTabs,
  rightExtra,
  children,
  onClickStartOver,
}) => (
  <div className={moduleStyles.tabShell}>
    <div className={moduleStyles.tabContainer}>
      <div className={moduleStyles.tabBar}>{sceneTabs}</div>
      <div className={moduleStyles.tabBar}>
        {rightExtra}
        {onClickStartOver && (
          <MuiButton
            variant="outlined"
            color="secondary"
            size="extraSmall"
            onClick={event => {
              blurAfterPointerClick(event);
              onClickStartOver();
            }}
            type="button"
            endIcon={<FontAwesomeV6Icon iconStyle="solid" iconName="refresh" />}
          >
            Start Over
          </MuiButton>
        )}
      </div>
    </div>
    <div className={moduleStyles.tabContent}>{children}</div>
  </div>
);

export default LabShell;
