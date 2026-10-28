import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import styles from './skipped-tag.module.scss';

interface SkippedTagProps {
  isGraded: boolean;
}

// Not the design-system Tags, which have no error color.
const SkippedTag: React.FunctionComponent<SkippedTagProps> = ({isGraded}) => (
  <span className={classNames(styles.tag, isGraded && styles.tagGraded)}>
    {isGraded && <FontAwesomeV6Icon iconName="xmark" iconStyle="solid" />}
    <Typography variant="label3" component="span">
      Skipped
    </Typography>
  </span>
);

export default SkippedTag;
