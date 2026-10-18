import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Tooltip, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {type ReactNode} from 'react';

import appStyles from '../app.module.scss';
import styles from './nodePath.module.scss';

interface NodePathStepProps {
  step: ReactNode;
  index: number;
  collapsed: boolean;
}

const NodePathStep = ({step, index, collapsed}: NodePathStepProps) => (
  <>
    {index > 0 && (
      <FontAwesomeV6Icon
        iconName="caret-right"
        iconStyle="solid"
        className={styles.caret}
        aria-hidden="true"
      />
    )}
    {collapsed ? (
      <Tooltip title={step} placement="bottom">
        <span
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable so a keyboard can open the tooltip
          tabIndex={0}
          className={classNames(styles.stepNumber, styles.collapsedStepNumber)}
        >
          {index + 1}
          <span className={appStyles.visuallyHidden}>. {step}</span>
        </span>
      </Tooltip>
    ) : (
      <span className={styles.stepBody}>
        <span className={styles.stepNumber}>{index + 1}</span>
        <Typography
          variant="body3"
          component="span"
          className={styles.stepText}
        >
          {step}
        </Typography>
      </span>
    )}
  </>
);

export default NodePathStep;
