import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import styles from './result-tag.module.scss';

export type ResultTagStatus =
  | 'correct'
  | 'incorrect'
  | 'skipped'
  | 'skipped_ungraded'
  | 'ungraded';

const TAGS: Record<
  ResultTagStatus,
  {label: string; iconName?: string; className?: string}
> = {
  correct: {label: 'Correct', iconName: 'check', className: styles.correct},
  incorrect: {label: 'Incorrect', iconName: 'xmark', className: styles.error},
  skipped: {label: 'Skipped', iconName: 'xmark', className: styles.error},
  skipped_ungraded: {label: 'Skipped'},
  ungraded: {label: 'Ungraded'},
};

// Not the design-system Tags, which have no success or error color.
const ResultTag: React.FunctionComponent<{status: ResultTagStatus}> = ({
  status,
}) => {
  const {label, iconName, className} = TAGS[status];
  return (
    <span className={classNames(styles.tag, className)}>
      {iconName && <FontAwesomeV6Icon iconName={iconName} iconStyle="solid" />}
      <Typography variant="label3" component="span">
        {label}
      </Typography>
    </span>
  );
};

export default ResultTag;
